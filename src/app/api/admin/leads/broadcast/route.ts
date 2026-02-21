import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/server'
import { sendTelegramMessage } from '@/lib/telegram/bot'

export async function POST(req: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { content, type, mediaUrl } = await req.json()

        if (!content) {
            return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })
        }

        // Get all leads
        const allUsers = await prisma.user.findMany({
            include: {
                purchases: true,
                subscriptions: { where: { status: 'ACTIVE' } }
            }
        })

        const leads = allUsers.filter(user => {
            return user.subscriptions.length === 0 && user.purchases.length === 0 && user.telegramId
        })

        const results = {
            successCount: 0,
            failCount: 0,
            errors: [] as string[]
        }

        // Send messages in sequence to avoid hitting rate limits too hard
        for (const lead of leads) {
            if (!lead.telegramId) continue

            const res = await sendTelegramMessage(
                lead.telegramId,
                content,
                type || 'TEXT',
                mediaUrl
            )

            if (res.success) {
                results.successCount++
            } else {
                results.failCount++
                results.errors.push(`Lead ${lead.id}: ${res.error}`)
            }
        }

        return NextResponse.json({
            success: true,
            results
        })
    } catch (error: any) {
        console.error('Error broadcasting to leads:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
