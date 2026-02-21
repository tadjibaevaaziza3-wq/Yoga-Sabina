import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateClickUrl } from '@/lib/payments/click'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { userId, courseId, amount } = body

        if (!userId || !courseId || !amount) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Create a PENDING purchase record
        const purchase = await prisma.purchase.create({
            data: {
                userId,
                courseId,
                amount: Number(amount),
                status: 'PENDING',
                provider: 'CLICK'
            }
        })

        // 2. Generate Payment URL
        const paymentUrl = generateClickUrl(Number(amount), {
            merchant_trans_id: purchase.id,
            course_id: courseId
        })

        return NextResponse.json({ success: true, paymentUrl, purchaseId: purchase.id })
    } catch (error: any) {
        console.error('Click checkout error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
