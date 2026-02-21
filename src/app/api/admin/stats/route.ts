import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

import { verifyToken } from '@/lib/auth/server'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function GET() {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const [userCount, courseCount, purchaseCount, activeSubscriptions] = await Promise.all([
            prisma.user.count(),
            prisma.course.count(),
            prisma.purchase.count({ where: { status: 'PAID' } }),
            prisma.subscription.count({ where: { status: 'ACTIVE' } })
        ])

        // Calculate total revenue
        const purchases = await prisma.purchase.findMany({
            where: { status: 'PAID' },
            select: { amount: true }
        })
        const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.amount), 0)

        return NextResponse.json({
            success: true,
            stats: {
                userCount,
                courseCount,
                purchaseCount,
                activeSubscriptions,
                totalRevenue: totalRevenue.toFixed(0)
            }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
