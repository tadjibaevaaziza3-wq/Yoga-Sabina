import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateClickUrl } from '@/lib/payments/click'
import { getLocalUser } from '@/lib/auth/server'

export async function POST(request: Request) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { courseId, amount, type, provider, couponId } = await request.json()

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
                provider: provider.toUpperCase() // 'CLICK'
            }
        })

        // Generate URL
        const paymentUrl = await generateClickUrl(Number(amount), {
            merchant_trans_id: pendingPurchase.id
        })

        return NextResponse.json({ success: true, paymentUrl })

    } catch (e) {
        console.error(e)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
