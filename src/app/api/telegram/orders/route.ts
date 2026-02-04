import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { telegramId, firstName, lastName, photoUrl, courseId, amount } = await request.json()

        if (!telegramId || !courseId) {
            return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 })
        }

        // 1. Find or create user by telegramId
        let user = await prisma.user.findUnique({
            where: { telegramId: String(telegramId) }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    telegramId: String(telegramId),
                    firstName,
                    lastName,
                    profile: {
                        create: {
                            totalYogaTime: 0,
                        }
                    }
                }
            })
        }

        // 2. Create a PENDING purchase
        const purchase = await prisma.purchase.create({
            data: {
                userId: user.id,
                courseId: courseId,
                amount: amount,
                status: 'PENDING',
                provider: 'PAYME'
            }
        })

        // 3. Optional: Notify admin or log the lead
        console.log(`New lead from Telegram: User ${telegramId} interested in course ${courseId}`)

        return NextResponse.json({
            success: true,
            orderId: purchase.id,
            paymentUrl: `https://test.paycom.uz/checkout/...` // Mock payment URL
        })
    } catch (error: any) {
        console.error('TMA Order error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Order failed' },
            { status: 500 }
        )
    }
}
