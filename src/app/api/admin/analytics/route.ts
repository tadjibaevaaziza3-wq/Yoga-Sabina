import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function GET(request: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Group page views by day
        const eventLogs = await prisma.eventLog.findMany({
            where: {
                createdAt: { gte: weekAgo },
            },
            orderBy: { createdAt: 'asc' },
        });

        const dailyStats = eventLogs.reduce((acc: any, log: any) => {
            const date = log.createdAt.toISOString().split('T')[0];
            if (!acc[date]) acc[date] = { date, views: 0, appOpens: 0 };
            if (log.event === 'page_view') acc[date].views++;
            if (log.event === 'app_open') acc[date].appOpens++;
            return acc;
        }, {});

        // Recent stats for KPIs
        const totalUsers = await prisma.user.count();
        const activeSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
        const recentOrders = await prisma.purchase.count({ where: { status: 'PAID', createdAt: { gte: weekAgo } } });

        return NextResponse.json({
            analytics: Object.values(dailyStats),
            kpis: {
                totalUsers,
                activeSubscriptions,
                recentOrders,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
