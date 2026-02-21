import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram/bot'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function POST(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        const { type, content, mediaUrl, target, courseId, telegramId } = await request.json()

        // 1. Fetch target users
        let users: { telegramId: string | null }[] = []

        if (target === 'ALL') {
            users = await (prisma as any).user.findMany({
                where: { telegramId: { not: null } },
                select: { telegramId: true }
            })
        } else if (target === 'LEADS') {
            users = await (prisma as any).user.findMany({
                where: {
                    telegramId: { not: null },
                    purchases: { none: {} }
                },
                select: { telegramId: true }
            })
        } else if (target === 'COURSE') {
            if (!courseId) return NextResponse.json({ success: false, error: 'Course ID missing' }, { status: 400 })
            users = await (prisma as any).user.findMany({
                where: {
                    telegramId: { not: null },
                    OR: [
                        { purchases: { some: { courseId, status: 'PAID' } } },
                        { subscriptions: { some: { courseId, status: 'ACTIVE' } } }
                    ]
                },
                select: { telegramId: true }
            })
        } else if (target === 'SPECIFIC') {
            if (!telegramId) return NextResponse.json({ success: false, error: 'Telegram ID missing' }, { status: 400 })
            users = [{ telegramId }]
        }

        if (users.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No target users found' })
        }

        // 2. Send broadcast (sequential with delay to avoid rate limits)
        let successCount = 0
        let errors = []

        for (const user of users) {
            if (user.telegramId) {
                const res = await sendTelegramMessage(user.telegramId, content, type, mediaUrl)
                if (res.success) {
                    successCount++
                } else {
                    errors.push({ id: user.telegramId, error: res.error })
                }
                await new Promise(resolve => setTimeout(resolve, 50))
            }
        }

        return NextResponse.json({
            success: true,
            successCount,
            count: users.length,
            errors: errors.length > 0 ? errors : undefined,
            message: `Broadcast sent to ${successCount}/${users.length} users`
        })
    } catch (error: any) {
        console.error('Admin Broadcast error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
