import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram-bot'

/**
 * Subscription Check Cron Job
 * Runs daily to:
 * 1. Notify users 3 days before subscription expiry (Telegram + in-app)
 * 2. Mark expired subscriptions as EXPIRED
 * 3. Notify expired users to renew (Telegram + in-app)
 * 4. Notify admin about expired subscriptions
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')
    const authHeader = req.headers.get('authorization')

    // Security: verify cron secret (Vercel sends Bearer header, manual calls use ?key=)
    const isAuthorized =
        key === process.env.CRON_SECRET ||
        authHeader === `Bearer ${process.env.CRON_SECRET}`

    if (!isAuthorized && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const now = new Date()
        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(now.getDate() + 3)

        let notifiedExpiring = 0
        let processedExpired = 0

        // ─── 1. Subscriptions expiring in 3 days → warn user ───
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

        for (const sub of expiringSoon) {
            // Telegram notification
            if (sub.user.telegramId) {
                const msg = `⚠️ <b>Obuna tugashiga 3 kun qoldi!</b>\n\n📚 Kurs: ${sub.course.title}\n📅 Tugash sanasi: ${sub.endsAt.toLocaleDateString('uz-UZ')}\n\nObunani uzaytirish uchun to'lovni amalga oshiring.\n\n---\n⚠️ <b>Подписка истекает через 3 дня!</b>\n\n📚 Курс: ${sub.course.titleRu || sub.course.title}\n📅 Дата окончания: ${sub.endsAt.toLocaleDateString('ru-RU')}\n\nПродлите подписку, чтобы продолжить обучение.`

                await sendTelegramMessage(sub.user.telegramId, msg)
                notifiedExpiring++
            }

            // In-app notification
            await prisma.notification.create({
                data: {
                    userId: sub.userId,
                    type: 'warning',
                    title: `"${sub.course.title}" obunasi 3 kundan tugaydi!`,
                    titleRu: `Подписка на "${sub.course.titleRu || sub.course.title}" истекает через 3 дня!`,
                    message: `Darslarni ko'rishda davom etish uchun obunani uzaytiring. Tugash sanasi: ${sub.endsAt.toLocaleDateString('uz-UZ')}`,
                    messageRu: `Продлите подписку, чтобы продолжить обучение. Дата окончания: ${sub.endsAt.toLocaleDateString('ru-RU')}`,
                    link: `/checkout?courseId=${sub.courseId}`,
                }
            })
        }

        // ─── 2. Expired subscriptions → mark + notify user to renew ───
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
            // Mark as expired
            await prisma.subscription.update({
                where: { id: sub.id },
                data: { status: 'EXPIRED' }
            })

            // Notify user via Telegram
            if (sub.user.telegramId) {
                const msg = `🔴 <b>Obuna muddati tugadi!</b>\n\n📚 Kurs: ${sub.course.title}\n📅 Tugadi: ${sub.endsAt.toLocaleDateString('uz-UZ')}\n\nDarslarni ko'rishda davom etish uchun obunani yangilang.\n\n---\n🔴 <b>Подписка истекла!</b>\n\n📚 Курс: ${sub.course.titleRu || sub.course.title}\n📅 Истекла: ${sub.endsAt.toLocaleDateString('ru-RU')}\n\nПродлите подписку, чтобы продолжить обучение.`

                await sendTelegramMessage(sub.user.telegramId, msg)
            }

            // In-app notification
            await prisma.notification.create({
                data: {
                    userId: sub.userId,
                    type: 'warning',
                    title: `"${sub.course.title}" obunasi tugadi!`,
                    titleRu: `Подписка на "${sub.course.titleRu || sub.course.title}" истекла!`,
                    message: `Obuna muddati tugadi. Darslarni ko'rishda davom etish uchun to'lov qiling va obunani yangilang.`,
                    messageRu: `Срок подписки истёк. Оплатите и продлите подписку, чтобы продолжить обучение.`,
                    link: `/checkout?courseId=${sub.courseId}`,
                }
            })

            // Notify admin
            const adminId = process.env.ADMIN_TELEGRAM_ID
            if (adminId) {
                const adminMsg = `🔴 <b>Obuna muddati tugadi</b>\n\n👤 ${sub.user.firstName || ''} ${sub.user.lastName || ''}\n📱 ${sub.user.phone || sub.user.telegramId || sub.user.email || 'N/A'}\n📚 ${sub.course.title}\n📅 ${sub.endsAt.toLocaleDateString('uz-UZ')}`

                await sendTelegramMessage(adminId, adminMsg)
            }

            processedExpired++
        }

        return NextResponse.json({
            success: true,
            message: `Cron complete. Warned ${notifiedExpiring} expiring users. Processed ${processedExpired} expired subscriptions.`
        })
    } catch (error: any) {
        console.error('Subscription check error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
