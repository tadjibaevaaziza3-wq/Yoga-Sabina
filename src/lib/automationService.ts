/**
 * Retention Automation Service
 * 
 * Handles trigger checking, queue processing with AI integration,
 * and user re-activation cancellation.
 */

import { prisma } from '@/lib/prisma'
import { sendTelegramMessage, sendTelegramVideo, sendTelegramAudio, sendTelegramPhoto } from '@/lib/telegram-bot'
import { generateRetentionMessage, estimateReturnProbability, adjustToneByProbability, selectVariant } from '@/lib/aiRetentionService'
import { recalculateUserEngagement } from '@/lib/engagementService'

// ── TRIGGER CHECKING ──

export async function checkTriggers(): Promise<{ triggered: number; errors: string[] }> {
    const errors: string[] = []
    let triggered = 0

    const activeTriggers = await prisma.trigger.findMany({
        where: { isActive: true },
        include: { steps: { orderBy: { stepOrder: 'asc' }, take: 1 } },
    })

    for (const trigger of activeTriggers) {
        if (trigger.steps.length === 0) continue

        try {
            const matchingUsers = await findMatchingUsers(trigger.conditionType)

            for (const user of matchingUsers) {
                const existing = await prisma.userAutomationQueue.findFirst({
                    where: {
                        userId: user.id,
                        triggerId: trigger.id,
                        status: { in: ['PENDING', 'SENT'] },
                    },
                })
                if (existing) continue

                const recentSent = await prisma.userAutomationQueue.findFirst({
                    where: {
                        userId: user.id,
                        sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                    },
                })
                if (recentSent) continue

                const firstStep = trigger.steps[0]
                await prisma.userAutomationQueue.create({
                    data: {
                        userId: user.id,
                        triggerId: trigger.id,
                        automationStepId: firstStep.id,
                        scheduledAt: new Date(Date.now() + firstStep.delayDays * 24 * 60 * 60 * 1000),
                        status: 'PENDING',
                    },
                })
                triggered++
            }
        } catch (error: any) {
            errors.push(`Trigger ${trigger.id}: ${error.message}`)
        }
    }

    return { triggered, errors }
}

async function findMatchingUsers(conditionType: string) {
    const now = new Date()

    switch (conditionType) {
        case 'INACTIVE_3_DAYS':
            return prisma.user.findMany({
                where: {
                    telegramId: { not: null },
                    isBlocked: false,
                    updatedAt: { lt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
                },
                select: { id: true, telegramId: true, firstName: true },
            })

        case 'INACTIVE_10_DAYS':
            return prisma.user.findMany({
                where: {
                    telegramId: { not: null },
                    isBlocked: false,
                    updatedAt: { lt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
                },
                select: { id: true, telegramId: true, firstName: true },
            })

        case 'REGISTERED_NO_PURCHASE':
            return prisma.user.findMany({
                where: {
                    telegramId: { not: null },
                    isBlocked: false,
                    createdAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
                    purchases: { none: {} },
                },
                select: { id: true, telegramId: true, firstName: true },
            })

        case 'SUB_EXPIRING_SOON':
            return prisma.user.findMany({
                where: {
                    telegramId: { not: null },
                    isBlocked: false,
                    subscriptions: {
                        some: {
                            status: 'ACTIVE',
                            endsAt: {
                                gte: now,
                                lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                            },
                        },
                    },
                },
                select: { id: true, telegramId: true, firstName: true },
            })

        case 'VIEWED_COURSE_NO_SUB':
            return prisma.user.findMany({
                where: {
                    telegramId: { not: null },
                    isBlocked: false,
                    eventLogs: {
                        some: {
                            event: { contains: 'course_view' },
                            createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
                        },
                    },
                    subscriptions: { none: { status: 'ACTIVE' } },
                },
                select: { id: true, telegramId: true, firstName: true },
            })

        default:
            return []
    }
}

// ── QUEUE PROCESSING (AI-INTEGRATED) ──

export async function processQueue(): Promise<{ sent: number; failed: number; errors: string[] }> {
    const errors: string[] = []
    let sent = 0
    let failed = 0

    const pendingItems = await prisma.userAutomationQueue.findMany({
        where: {
            status: 'PENDING',
            scheduledAt: { lte: new Date() },
        },
        include: {
            user: {
                select: {
                    id: true, telegramId: true, firstName: true, language: true,
                    engagementScore: true, segment: true, totalSessions: true,
                    totalWatchTime: true, lastActivityType: true, lastLoginAt: true, updatedAt: true,
                    purchases: { select: { id: true }, take: 1 },
                    subscriptions: { where: { status: 'ACTIVE' }, select: { id: true }, take: 1 },
                },
            },
            automationStep: true,
            trigger: {
                include: { steps: { orderBy: { stepOrder: 'asc' } } },
            },
        },
        take: 50,
    })

    for (const item of pendingItems) {
        if (!item.user.telegramId) {
            await prisma.userAutomationQueue.update({
                where: { id: item.id },
                data: { status: 'FAILED' },
            })
            failed++
            continue
        }

        // Cancel if user purchased or has active subscription
        if (item.user.purchases.length > 0 || item.user.subscriptions.length > 0) {
            await prisma.userAutomationQueue.update({
                where: { id: item.id },
                data: { status: 'CANCELLED' },
            })
            continue
        }

        try {
            // Recalculate engagement
            await recalculateUserEngagement(item.userId)

            const step = item.automationStep
            let messageText = step.contentText || ''
            let aiGenerated = false
            const variant = step.variant ? selectVariant(item.userId) : null

            // AI Personalization
            if (step.aiEnabled) {
                const now = new Date()
                const lastActive = item.user.lastLoginAt || item.user.updatedAt
                const inactiveDays = Math.floor((now.getTime() - lastActive.getTime()) / (24 * 60 * 60 * 1000))

                const userContext = {
                    firstName: item.user.firstName,
                    inactiveDays,
                    lastActivityType: item.user.lastActivityType,
                    segment: item.user.segment,
                    engagementScore: item.user.engagementScore,
                    totalSessions: item.user.totalSessions,
                    totalWatchTime: item.user.totalWatchTime,
                    hasPurchases: item.user.purchases.length > 0,
                    subscriptionActive: item.user.subscriptions.length > 0,
                    language: item.user.language || 'uz',
                }

                const probability = await estimateReturnProbability(userContext)
                const adjustedTone = adjustToneByProbability(step.tone, probability)

                messageText = await generateRetentionMessage(userContext, {
                    tone: adjustedTone,
                    goal: step.goal,
                    basePrompt: step.basePrompt,
                })
                aiGenerated = true
            }

            // Send via Telegram
            let success: boolean
            if (step.contentType === 'video' && step.contentUrl) {
                success = await sendTelegramVideo(item.user.telegramId, step.contentUrl, messageText || undefined)
            } else if (step.contentType === 'audio' && step.contentUrl) {
                success = await sendTelegramAudio(item.user.telegramId, step.contentUrl, messageText || undefined)
            } else if ((step.contentType === 'photo' || step.contentType === 'image') && step.contentUrl) {
                success = await sendTelegramPhoto(item.user.telegramId, step.contentUrl, messageText || undefined)
            } else {
                if (!messageText) { failed++; continue }
                success = await sendTelegramMessage(item.user.telegramId, messageText)
            }

            if (success) {
                await prisma.userAutomationQueue.update({
                    where: { id: item.id },
                    data: { status: 'SENT', sentAt: new Date() },
                })

                await prisma.triggerLog.create({
                    data: {
                        triggerId: item.triggerId,
                        userId: item.userId,
                        status: 'SENT',
                        messageText,
                        aiGenerated,
                        variant,
                        metadata: {
                            stepOrder: step.stepOrder,
                            contentType: step.contentType,
                            tone: step.tone,
                            goal: step.goal,
                        },
                    },
                })

                // Enqueue next step
                const currentStepIndex = item.trigger.steps.findIndex(
                    (s: any) => s.id === item.automationStepId
                )
                const nextStep = item.trigger.steps[currentStepIndex + 1]

                if (nextStep) {
                    await prisma.userAutomationQueue.create({
                        data: {
                            userId: item.userId,
                            triggerId: item.triggerId,
                            automationStepId: nextStep.id,
                            scheduledAt: new Date(Date.now() + nextStep.delayDays * 24 * 60 * 60 * 1000),
                            status: 'PENDING',
                        },
                    })
                }
                sent++
            } else {
                await prisma.userAutomationQueue.update({
                    where: { id: item.id },
                    data: { status: 'FAILED' },
                })
                failed++
            }
        } catch (error: any) {
            errors.push(`Queue ${item.id}: ${error.message}`)
            await prisma.userAutomationQueue.update({
                where: { id: item.id },
                data: { status: 'FAILED' },
            })
            failed++
        }
    }

    return { sent, failed, errors }
}

// ── CANCEL IF ACTIVE ──

export async function cancelIfActive(): Promise<number> {
    const recentlyActive = await prisma.user.findMany({
        where: {
            updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            automationQueue: { some: { status: 'PENDING' } },
        },
        select: { id: true },
    })

    if (recentlyActive.length === 0) return 0

    const result = await prisma.userAutomationQueue.updateMany({
        where: {
            userId: { in: recentlyActive.map((u) => u.id) },
            status: 'PENDING',
        },
        data: { status: 'CANCELLED' },
    })

    return result.count
}

// ── STATISTICS ──

export async function getAutomationStats(triggerId: string) {
    const [totalSent, totalPending, totalFailed, totalCancelled] = await Promise.all([
        prisma.userAutomationQueue.count({ where: { triggerId, status: 'SENT' } }),
        prisma.userAutomationQueue.count({ where: { triggerId, status: 'PENDING' } }),
        prisma.userAutomationQueue.count({ where: { triggerId, status: 'FAILED' } }),
        prisma.userAutomationQueue.count({ where: { triggerId, status: 'CANCELLED' } }),
    ])

    const returned = totalCancelled
    const total = totalSent + totalPending + totalFailed + totalCancelled
    const conversionRate = total > 0 ? Math.round((returned / total) * 100) : 0

    // A/B stats
    const [variantASent, variantBSent, variantAReturned, variantBReturned] = await Promise.all([
        prisma.triggerLog.count({ where: { triggerId, variant: 'A', status: 'SENT' } }),
        prisma.triggerLog.count({ where: { triggerId, variant: 'B', status: 'SENT' } }),
        prisma.triggerLog.count({ where: { triggerId, variant: 'A', returned: true } }),
        prisma.triggerLog.count({ where: { triggerId, variant: 'B', returned: true } }),
    ])

    // Best tone/goal stats
    const toneStats = await prisma.triggerLog.groupBy({
        by: ['metadata'],
        where: { triggerId, status: 'SENT' },
        _count: true,
    })

    return {
        totalSent, totalPending, totalFailed, totalCancelled,
        returned, conversionRate, total,
        abTest: {
            variantA: { sent: variantASent, returned: variantAReturned, rate: variantASent > 0 ? Math.round((variantAReturned / variantASent) * 100) : 0 },
            variantB: { sent: variantBSent, returned: variantBReturned, rate: variantBSent > 0 ? Math.round((variantBReturned / variantBSent) * 100) : 0 },
        },
    }
}
