import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBroadcast } from '@/lib/telegram/bot'

export async function POST(request: Request) {
    try {
        const { telegramId, event, details } = await request.json()

        if (!telegramId || !event) {
            return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 })
        }

        // 1. Find user
        const user = await (prisma as any).user.findUnique({
            where: { telegramId: String(telegramId) },
            include: { purchases: true }
        })

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
        }

        // 2. Log activity
        console.log(`[ACTIVITY LOG] User:${telegramId} Event:${event} Details:${JSON.stringify(details)}`)

        // 3. SMART TRIGGERS (Automated CRM)
        if (event === 'VIEW_COURSE_CARD') {
            const courseId = details.courseId

            // If user viewed a course card but has NO purchases
            if (user.purchases.length === 0) {
                setTimeout(async () => {
                    try {
                        const freshUser = await (prisma as any).user.findUnique({
                            where: { id: user.id },
                            include: { purchases: true }
                        })

                        if (freshUser && freshUser.purchases.length === 0) {
                            await sendBroadcast(
                                telegramId,
                                'TEXT',
                                `Salom! 👋 Siz **${courseId}** kursimiz bilan qiziqdingiz. Savollaringiz bormi? Sizga yordam bera olamiz! 😊\n\nПривет! 👋 Вы интересовались нашим курсом **${courseId}**. Есть вопросы? Мы можем помочь! 😊`
                            )
                        }
                    } catch (e) {
                        console.error("Delayed trigger failed:", e)
                    }
                }, 1000 * 60 * 5) // 5 minutes follow up
            }
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Activity Log error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
