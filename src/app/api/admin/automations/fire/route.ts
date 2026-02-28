/**
 * Immediate Fire Automation Trigger
 * POST /api/admin/automations/fire
 * body: { triggerId }
 * 
 * Immediately checks the trigger, enqueues matching users with 0 delay,
 * then processes the queue — sending messages right away.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromSession } from '@/lib/auth/admin-auth'
import { prisma } from '@/lib/prisma'
import { sendTelegramMessage, sendTelegramVideo, sendTelegramAudio, sendTelegramPhoto } from '@/lib/telegram-bot'

export async function POST(request: NextRequest) {
    const admin = await getAdminFromSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { triggerId, force } = await request.json()
    if (!triggerId) return NextResponse.json({ error: 'triggerId required' }, { status: 400 })

    try {
        // 1. Get the trigger with its first step
        const trigger = await prisma.trigger.findUnique({
            where: { id: triggerId },
            include: { steps: { orderBy: { stepOrder: 'asc' }, take: 1 } },
        })

        if (!trigger || trigger.steps.length === 0) {
            return NextResponse.json({ error: 'Trigger topilmadi yoki qadamlar yo\'q' }, { status: 404 })
        }

        // 2. Find matching users based on condition type
        let matchingUsers: { id: string; telegramId: string | null; firstName: string | null }[] = []

        if (trigger.conditionType === 'NEW_MODULE_ADDED') {
            // All users with active subscriptions + telegram
            matchingUsers = await prisma.user.findMany({
                where: {
                    telegramId: { not: null },
                    isBlocked: false,
                    subscriptions: { some: { status: 'ACTIVE' } },
                },
                select: { id: true, telegramId: true, firstName: true },
            })
        } else {
            return NextResponse.json({ error: 'Bu trigger turi uchun tezkor yuborish qo\'llab-quvvatlanmaydi' }, { status: 400 })
        }

        if (matchingUsers.length === 0) {
            return NextResponse.json({ success: true, sent: 0, message: 'Faol obunachillar topilmadi' })
        }

        // 3. Send messages immediately (skip queue)
        const step = trigger.steps[0]
        let sent = 0
        let failed = 0

        for (const user of matchingUsers) {
            if (!user.telegramId) { failed++; continue }

            // Skip if already sent for this trigger recently (last 1 hour)
            // Unless force=true (manual admin fire bypasses dedup)
            if (!force) {
                const recentSend = await prisma.triggerLog.findFirst({
                    where: {
                        triggerId,
                        userId: user.id,
                        sentAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
                    },
                })
                if (recentSend) continue
            }

            try {
                let messageText = step.contentText || ''

                // Personalize with user name
                if (user.firstName) {
                    messageText = messageText.replace('{name}', user.firstName)
                }

                let success = false
                if (step.contentType === 'video' && step.contentUrl) {
                    success = await sendTelegramVideo(user.telegramId, step.contentUrl, messageText || undefined)
                } else if (step.contentType === 'audio' && step.contentUrl) {
                    success = await sendTelegramAudio(user.telegramId, step.contentUrl, messageText || undefined)
                } else if ((step.contentType === 'photo' || step.contentType === 'image') && step.contentUrl) {
                    success = await sendTelegramPhoto(user.telegramId, step.contentUrl, messageText || undefined)
                } else if (messageText) {
                    success = await sendTelegramMessage(user.telegramId, messageText)
                }

                if (success) {
                    await prisma.triggerLog.create({
                        data: {
                            triggerId,
                            userId: user.id,
                            status: 'SENT',
                            messageText,
                            aiGenerated: false,
                            metadata: { stepOrder: step.stepOrder, contentType: step.contentType, immediate: true },
                        },
                    })
                    sent++
                } else {
                    failed++
                }
            } catch (err) {
                console.error(`[ImmediateFire] Failed for user ${user.id}:`, err)
                failed++
            }
        }

        return NextResponse.json({
            success: true,
            sent,
            failed,
            total: matchingUsers.length,
            message: `${sent} ta obunachiga xabar yuborildi`,
        })
    } catch (error: any) {
        console.error('[ImmediateFire] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
