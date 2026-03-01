import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePaymeUrl } from '@/lib/payments/payme'
import { getLocalUser } from '@/lib/auth/server'
import { checkRateLimit, getResetTime } from '@/lib/security/rate-limit'

export async function POST(request: Request) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { courseId, amount, type, provider, couponId } = await request.json()

        // Rate limiting — 5 per minute per user
        if (!checkRateLimit(`payment:${user.id}`)) {
            return NextResponse.json({
                success: false,
                error: 'Too many payment attempts. Please try again later.',
                retryAfter: getResetTime(`payment:${user.id}`)
            }, { status: 429 })
        }

        // Sync/Find user in Prisma
        let dbUser = await prisma.user.findUnique({ where: { id: user.id } })

        // If user doesn't exist in Prisma but exists in Supabase (e.g. freshly registered), ensure sync
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
                provider: provider.toUpperCase()
            }
        })

        // Generate URL
        const amountInTiyn = Math.round(Number(amount) * 100)
        const paymentUrl = await generatePaymeUrl(amountInTiyn, {
            order_id: pendingPurchase.id
        })

        return NextResponse.json({ success: true, paymentUrl })

    } catch (e) {
        console.error('Payme create error:', e)
        return NextResponse.json({ success: false, error: 'Payment creation failed' }, { status: 500 })
    }
}
