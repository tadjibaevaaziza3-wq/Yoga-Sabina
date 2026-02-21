import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePaymeUrl } from '@/lib/payments/payme'
import { generateClickUrl } from '@/lib/payments/click'

export async function POST(request: Request) {
    try {
        const { telegramId, firstName, lastName, courseId, amount, provider } = await request.json()

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
                    role: 'USER'
                }
            })
        }

        // 2. Create a PENDING purchase
        const numericAmount = typeof amount === 'string' ? Number(amount.replace(/[^0-9]/g, "")) : Number(amount)

        const purchase = await prisma.purchase.create({
            data: {
                userId: user.id,
                courseId: courseId,
                amount: numericAmount,
                status: 'PENDING',
                provider: provider === 'CLICK' ? 'CLICK' : 'PAYME'
            }
        })

        // 3. Generate Payment URL
        let paymentUrl = ""
        if (provider === 'CLICK') {
            paymentUrl = await generateClickUrl(numericAmount, { merchant_trans_id: purchase.id })
        } else {
            paymentUrl = await generatePaymeUrl(numericAmount * 100, {
                order_id: purchase.id
            })
        }

        return NextResponse.json({
            success: true,
            orderId: purchase.id,
            paymentUrl
        })
    } catch (error: any) {
        console.error('TMA Order error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Order failed' },
            { status: 500 }
        )
    }
}
