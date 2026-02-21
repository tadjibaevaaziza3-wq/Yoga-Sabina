import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createOrExtendSubscription } from '@/lib/payments/subscription'

import { verifyToken } from '@/lib/auth/server'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function GET(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const userId = searchParams.get('userId')
        const courseId = searchParams.get('courseId')

        const where: any = {}

        if (status) {
            where.status = status
        }
        if (userId) {
            where.userId = userId
        }
        if (courseId) {
            where.courseId = courseId
        }
        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) {
                where.createdAt.gte = new Date(startDate)
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate)
            }
        }

        const purchases = await prisma.purchase.findMany({
            where,
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                course: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Calculate total revenue
        const totalRevenue = purchases
            .filter(p => p.status === 'PAID')
            .reduce((sum, p) => sum + Number(p.amount), 0)

        // Group by status
        const byStatus = purchases.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return NextResponse.json({
            success: true,
            purchases,
            total: purchases.length,
            totalRevenue,
            byStatus
        })
    } catch (error: any) {
        console.error('Error fetching orders:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { purchaseId, status } = body

        if (!purchaseId || !status) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: purchaseId, status'
            }, { status: 400 })
        }

        const purchase = await prisma.purchase.update({
            where: { id: purchaseId },
            data: {
                status,
                verifiedByAdmin: true
            },
            include: {
                user: true,
                course: true
            }
        })

        // If status is PAID, create/extend subscription
        if (status === 'PAID') {
            await createOrExtendSubscription(
                purchase.userId,
                purchase.courseId,
                purchase.course.durationDays || 30
            )
        }

        return NextResponse.json({
            success: true,
            purchase,
            message: 'Order status updated successfully'
        })
    } catch (error: any) {
        console.error('Error updating order:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
