import { NextResponse } from 'next/server'
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

export async function POST(req: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        const body = await req.json()
        const { type, content, mediaUrl, targetUserId } = body

        if (!content && type === 'TEXT') {
            return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })
        }

        if (targetUserId) {
            // Send to a specific user
            const user = await prisma.user.findUnique({
                where: { id: targetUserId }
            })

            if (!user?.telegramId) {
                return NextResponse.json({ success: false, error: 'User not found or has no Telegram ID' }, { status: 404 })
            }

            const result = await sendTelegramMessage(user.telegramId, content, type, mediaUrl)
            return NextResponse.json({ success: result.success, error: result.error })
        } else {
            // Broadcast to all users with telegramId
            const users = await prisma.user.findMany({
                where: {
                    telegramId: { not: null },
                    role: 'USER'
                }
            })

            let successCount = 0
            let failureCount = 0

            for (const user of users) {
                if (user.telegramId) {
                    const res = await sendTelegramMessage(user.telegramId, content, type, mediaUrl)
                    if (res.success) successCount++
                    else failureCount++
                }
            }

            return NextResponse.json({
                success: true,
                message: `Broadcast complete: ${successCount} sent, ${failureCount} failed.`
            })
        }
    } catch (error: any) {
        console.error('Broadcast API error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
