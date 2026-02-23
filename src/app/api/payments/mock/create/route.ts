import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLocalUser } from '@/lib/auth/server'

export async function POST(request: Request) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { courseId, amount, couponId } = await request.json()

        // Sync/Find user in Prisma
        let dbUser = await prisma.user.findUnique({ where: { id: user.id } })

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email || '',
                    role: 'USER'
                }
            })
        }

        // Create a pending purchase
        const pendingPurchase = await prisma.purchase.create({
            data: {
                userId: user.id,
                courseId: courseId,
                amount: amount,
                couponId: couponId,
                status: 'PENDING',
                provider: 'MOCK'
            }
        })

        // For mock, we just return a success and include the purchaseId so the frontend can call /api/payments/mock/verify if needed
        // Or redirect to a mock success page
        return NextResponse.json({
            success: true,
            paymentUrl: `/uz/account?mock_purchase_id=${pendingPurchase.id}`
        })

    } catch (e) {
        console.error(e)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
