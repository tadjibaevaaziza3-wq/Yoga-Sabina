
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const { courseId } = await request.json()
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({ where: { id: token } })
        const course = await prisma.course.findUnique({ where: { id: courseId } })

        if (!user || !course) {
            return NextResponse.json({ success: false, error: 'User or Course not found' }, { status: 404 })
        }

        // Create a Mock Purchase
        const purchase = await prisma.purchase.create({
            data: {
                userId: user.id,
                courseId: course.id,
                amount: course.price,
                status: 'PAID',
                provider: 'MOCK_PAYME',
                providerTxnId: `mock_${Date.now()}`
            }
        })

        // Also create a subscription for 30 days
        await prisma.subscription.create({
            data: {
                userId: user.id,
                courseId: course.id,
                status: 'ACTIVE',
                endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        })

        return NextResponse.json({ success: true, purchase })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
