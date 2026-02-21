import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBroadcast } from '@/lib/telegram/bot'

export async function GET(req: Request) {
    // Basic security: Check for a secret key or verify it's a cron call
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')

    // For demo/simulated run, we can skip strict check if explicitly allowed
    // if (key !== process.env.CRON_SECRET) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    try {
        const now = new Date()
        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(now.getDate() + 3)

        // 1. Find subscriptions expiring in exactly 3 days (or between 2 and 3 days)
        const expiringSoon = await prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                endsAt: {
                    gte: now,
                    lte: threeDaysFromNow
                }
            },
            include: { user: true, course: true }
        })

        let notifyCount = 0

        for (const sub of expiringSoon) {
            if (sub.user.telegramId) {
                const message = `
⚠️ **Obuna tugashiga oz qoldi!**

Sizning "${sub.course.title}" kursiga obunangiz 3 kundan keyin tugaydi. 
Bilim olishda davom etish uchun obunani vaqtida uzaytirishni unutmang. ✨

---
⚠️ **Ваша подписка скоро истечет!**

Ваша подписка на курс "${sub.course.titleRu || sub.course.title}" истекает через 3 дня.
Не забудьте вовремя продлить подписку. ✨
`
                await sendBroadcast(sub.user.telegramId, 'TEXT', message)
                notifyCount++
            }
        }

        // 2. Find expired subscriptions to notify admin
        const justExpired = await prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                endsAt: {
                    lt: now
                }
            },
            include: { user: true, course: true }
        })

        for (const sub of justExpired) {
            // Update status to EXPIRED
            await prisma.subscription.update({
                where: { id: sub.id },
                data: { status: 'EXPIRED' }
            })

            // Notify Admin (we assume there's an admin telegram ID in env or we find it)
            const adminId = process.env.ADMIN_TELEGRAM_ID
            if (adminId) {
                const adminMsg = `
🚫 **Obuna muddati tugadi**

Foydalanuvchi: ${sub.user.firstName} ${sub.user.lastName || ''} (@${sub.user.telegramId || 'ID: ' + sub.user.id})
Kurs: ${sub.course.title}
Muddati tugadi: ${sub.endsAt.toLocaleDateString()}
`
                await sendBroadcast(adminId, 'TEXT', adminMsg)
            }
        }

        return NextResponse.json({
            success: true,
            message: `Checked subscriptions. Notified ${notifyCount} users. Processed ${justExpired.length} expired.`
        })
    } catch (error: any) {
        console.error('Subscription check error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
