import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBroadcast } from '@/lib/telegram/bot'

export async function POST(request: Request) {
    try {
        const { type, content, mediaUrl, target } = await request.json()

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
        }

        if (users.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No target users found' })
        }

        // 2. Send broadcast
        const results = await Promise.all(
            users.map((u: any) => sendBroadcast(u.telegramId!, type, content, mediaUrl))
        )

        const successCount = results.filter((r: any) => r.success).length

        return NextResponse.json({
            success: true,
            count: users.length,
            successCount,
            message: `Broadcast sent to ${successCount}/${users.length} users`
        })
    } catch (error: any) {
        console.error('Admin Broadcast error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
