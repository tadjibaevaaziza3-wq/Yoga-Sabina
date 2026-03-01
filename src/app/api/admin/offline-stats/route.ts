import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function GET() {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all offline courses
        const offlineCourses = await prisma.course.findMany({
            where: { type: 'OFFLINE', isActive: true },
            select: {
                id: true,
                title: true,
                location: true,
                times: true,
                price: true,
                maxCapacity: true,
            }
        });

        // Get all active offline subscriptions grouped by course + timeSlot
        const activeSubscriptions = await prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                course: { type: 'OFFLINE' }
            },
            select: {
                id: true,
                courseId: true,
                timeSlot: true,
                userId: true,
                startsAt: true,
                endsAt: true,
                user: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        // Get paid purchases for offline courses (revenue)
        const paidPurchases = await prisma.purchase.findMany({
            where: {
                status: 'PAID',
                course: { type: 'OFFLINE' }
            },
            select: {
                courseId: true,
                amount: true,
                createdAt: true,
            }
        });

        // Get attendance stats per course
        const attendanceStats = await prisma.offlineAttendance.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        // Build per-studio analytics
        const studios = offlineCourses.map(course => {
            const courseSubs = activeSubscriptions.filter(s => s.courseId === course.id);
            const courseRevenue = paidPurchases
                .filter(p => p.courseId === course.id)
                .reduce((sum, p) => sum + Number(p.amount), 0);

            // Parse time slots from course.times
            const timeSlots = course.times
                ? course.times.split(/[,;\/]+/).map(t => t.replace(/\s*-\s*\d{1,2}:\d{2}/, '').trim()).filter(t => /^\d{1,2}:\d{2}$/.test(t))
                : [];

            // Subscribers per time slot
            const slotData = timeSlots.map(slot => {
                const slotSubs = courseSubs.filter(s => s.timeSlot === slot);
                return {
                    timeSlot: slot,
                    subscribers: slotSubs.length,
                    capacity: course.maxCapacity || 15, // default max 15
                    occupancyPercent: Math.round((slotSubs.length / (course.maxCapacity || 15)) * 100),
                    students: slotSubs.map(s => ({
                        name: [s.user.firstName, s.user.lastName].filter(Boolean).join(' ') || 'Nomsiz',
                        endsAt: s.endsAt
                    }))
                };
            });

            // Also count subs without a time slot
            const unassigned = courseSubs.filter(s => !s.timeSlot || !timeSlots.includes(s.timeSlot));

            return {
                courseId: course.id,
                title: course.title,
                location: course.location || "Belgilanmagan",
                price: Number(course.price),
                maxCapacity: course.maxCapacity || 15,
                totalSubscribers: courseSubs.length,
                totalRevenue: courseRevenue,
                timeSlots: slotData,
                unassignedCount: unassigned.length,
            };
        });

        // Monthly revenue for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await prisma.purchase.findMany({
            where: {
                status: 'PAID',
                course: { type: 'OFFLINE' },
                createdAt: { gte: sixMonthsAgo }
            },
            select: {
                courseId: true,
                amount: true,
                createdAt: true,
            }
        });

        // Group by month
        const revenueByMonth: Record<string, Record<string, number>> = {};
        monthlyRevenue.forEach(p => {
            const month = p.createdAt.toISOString().substring(0, 7); // "2026-03"
            if (!revenueByMonth[month]) revenueByMonth[month] = {};
            const courseTitle = offlineCourses.find(c => c.id === p.courseId)?.title || "Noma'lum";
            revenueByMonth[month][courseTitle] = (revenueByMonth[month][courseTitle] || 0) + Number(p.amount);
        });

        const monthlyChart = Object.entries(revenueByMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, courses]) => ({
                month,
                ...courses,
                total: Object.values(courses).reduce((a, b) => a + b, 0)
            }));

        // Summary KPIs
        const totalOfflineSubscribers = activeSubscriptions.length;
        const totalOfflineRevenue = paidPurchases.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalAttended = attendanceStats.find(a => a.status === 'PRESENT')?._count?.id || 0;
        const totalAbsent = attendanceStats.find(a => a.status === 'ABSENT')?._count?.id || 0;

        return NextResponse.json({
            success: true,
            studios,
            monthlyChart,
            kpis: {
                totalOfflineSubscribers,
                totalOfflineRevenue,
                totalStudios: offlineCourses.length,
                totalAttended,
                totalAbsent,
                attendanceRate: totalAttended + totalAbsent > 0
                    ? Math.round((totalAttended / (totalAttended + totalAbsent)) * 100)
                    : 0,
            }
        });
    } catch (error: any) {
        console.error('[Offline Stats API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
