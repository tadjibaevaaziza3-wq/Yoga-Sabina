import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { purchaseId } = await req.json()

        if (!purchaseId) {
            return NextResponse.json({ success: false, error: 'Missing purchaseId' }, { status: 400 })
        }

        const purchase = await prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: { user: true, course: true }
        })

        if (!purchase) {
            return NextResponse.json({ success: false, error: 'Purchase not found' }, { status: 404 })
        }

        if (purchase.status === 'PAID') {
            return NextResponse.json({ success: true, message: 'Already paid' })
        }

        // 1. Update purchase status
        await prisma.purchase.update({
            where: { id: purchaseId },
            data: { status: 'PAID' }
        })

        // 2. Create or extend subscription using course duration
        const now = new Date()
        const duration = purchase.course.durationDays || 30 // Use course duration or default to 30 days
        let endsAt = new Date(now)
        endsAt.setDate(now.getDate() + duration)

        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId: purchase.userId,
                courseId: purchase.courseId,
                status: 'ACTIVE',
                endsAt: { gt: now }
            }
        })

        if (existingSubscription) {
            // Extend existing subscription
            const currentEndsAt = new Date(existingSubscription.endsAt)
            currentEndsAt.setDate(currentEndsAt.getDate() + duration)

            await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: { endsAt: currentEndsAt }
            })
        } else {
            // Create new subscription
            await prisma.subscription.create({
                data: {
                    userId: purchase.userId,
                    courseId: purchase.courseId,
                    startsAt: now,
                    endsAt: endsAt,
                    status: 'ACTIVE'
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Mock Verify error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
