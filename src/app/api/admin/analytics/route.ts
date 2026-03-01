/**
 * Admin Analytics API — OPTIMIZED for Vercel serverless (10s limit)
 * GET /api/admin/analytics — Comprehensive platform analytics
 * All queries parallelized with Promise.all to avoid sequential timeouts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth/admin-auth';

export const maxDuration = 30; // Allow up to 30s on Vercel Pro, 10s on Hobby

export async function GET(request: NextRequest) {
    try {
        const admin = await getAdminFromRequest(request);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } catch (e) {
        return NextResponse.json({ error: 'Auth check failed' }, { status: 401 });
    }

    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // ── Parse date range from query params ──
        const { searchParams } = new URL(request.url);
        const periodParam = searchParams.get('period');
        const fromParam = searchParams.get('from');
        const toParam = searchParams.get('to');

        let dateFrom: Date;
        let dateTo: Date = new Date(today);
        dateTo.setDate(dateTo.getDate() + 1);

        if (fromParam && toParam) {
            dateFrom = new Date(fromParam);
            dateTo = new Date(toParam);
            dateTo.setDate(dateTo.getDate() + 1);
        } else {
            switch (periodParam) {
                case 'today':
                    dateFrom = new Date(today);
                    break;
                case '7d':
                    dateFrom = new Date(today);
                    dateFrom.setDate(dateFrom.getDate() - 7);
                    break;
                case '90d':
                    dateFrom = new Date(today);
                    dateFrom.setDate(dateFrom.getDate() - 90);
                    break;
                case '365d':
                    dateFrom = new Date(today);
                    dateFrom.setDate(dateFrom.getDate() - 365);
                    break;
                case 'all':
                    dateFrom = new Date('2020-01-01');
                    break;
                default:
                    dateFrom = new Date(today);
                    dateFrom.setDate(dateFrom.getDate() - 30);
                    break;
            }
        }

        const rangeDays = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // ══════════════════════════════════════════════════════
        // ALL queries run in PARALLEL via Promise.all
        // ══════════════════════════════════════════════════════
        const [
            totalUsers,
            totalCourses,
            totalLessons,
            totalSubscriptions,
            periodUsers,
            periodSubscriptions,
            paidPurchases,
            usersInRange,
            subsInRange,
            courses,
            watchedLessons,
            favoritedResults,
            activeUsersResult,
            usersWithPurchases,
        ] = await Promise.all([
            // 1. Totals (4 counts)
            prisma.user.count(),
            prisma.course.count({ where: { isActive: true } }),
            prisma.lesson.count(),
            prisma.subscription.count({ where: { status: 'ACTIVE', endsAt: { gt: now } } }),

            // 2. Period counts
            prisma.user.count({ where: { createdAt: { gte: dateFrom, lt: dateTo } } }),
            prisma.subscription.count({ where: { createdAt: { gte: dateFrom, lt: dateTo } } }),

            // 3. Revenue
            prisma.purchase.findMany({
                where: { status: 'PAID' },
                select: { amount: true, createdAt: true },
            }),

            // 4. Users in range (for time series)
            prisma.user.findMany({
                where: { createdAt: { gte: dateFrom, lt: dateTo } },
                select: { createdAt: true },
                orderBy: { createdAt: 'asc' },
            }),

            // 5. Subscriptions in range
            prisma.subscription.findMany({
                where: { createdAt: { gte: dateFrom, lt: dateTo } },
                select: { createdAt: true },
                orderBy: { createdAt: 'asc' },
            }),

            // 6. Course KPIs
            prisma.course.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    title: true,
                    coverImage: true,
                    _count: {
                        select: {
                            subscriptions: true,
                            purchases: true,
                            lessons: true,
                        }
                    },
                },
            }),

            // 7. Most watched
            prisma.videoProgress.groupBy({
                by: ['lessonId'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),

            // 8. Most favorited
            prisma.favoriteLesson.groupBy({
                by: ['lessonId'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }).catch(() => []),

            // 9. Active users (7d)
            prisma.videoProgress.groupBy({
                by: ['userId'],
                where: { lastWatched: { gte: sevenDaysAgo } },
            }),

            // 10. Avg days to first purchase
            prisma.user.findMany({
                where: { purchases: { some: { status: 'PAID' } } },
                select: {
                    createdAt: true,
                    purchases: {
                        where: { status: 'PAID' },
                        orderBy: { createdAt: 'asc' },
                        take: 1,
                        select: { createdAt: true },
                    },
                },
            }),
        ]);

        // ── Process revenue ──
        const totalRevenue = paidPurchases.reduce((sum, p) => sum + Number(p.amount), 0);
        const periodRevenue = paidPurchases
            .filter(p => p.createdAt >= dateFrom && p.createdAt < dateTo)
            .reduce((sum, p) => sum + Number(p.amount), 0);

        // ── Time series (computed from already-fetched data) ──
        const step = rangeDays <= 90 ? 1 : rangeDays <= 365 ? 7 : 30;

        const registrationSeries: { date: string; count: number }[] = [];
        const revenueSeries: { date: string; amount: number }[] = [];
        const subscriptionSeries: { date: string; count: number }[] = [];

        for (let d = new Date(dateFrom); d < dateTo; d.setDate(d.getDate() + step)) {
            const periodEnd = new Date(d);
            periodEnd.setDate(periodEnd.getDate() + step);
            const dateStr = d.toISOString().split('T')[0];

            registrationSeries.push({
                date: dateStr,
                count: usersInRange.filter(u => u.createdAt >= d && u.createdAt < periodEnd).length,
            });

            revenueSeries.push({
                date: dateStr,
                amount: paidPurchases
                    .filter(p => p.createdAt >= d && p.createdAt < periodEnd)
                    .reduce((sum, p) => sum + Number(p.amount), 0),
            });

            subscriptionSeries.push({
                date: dateStr,
                count: subsInRange.filter(s => s.createdAt >= d && s.createdAt < periodEnd).length,
            });
        }

        // ── Avg days to first purchase ──
        let avgDaysToFirstPurchase = 0;
        if (usersWithPurchases.length > 0) {
            const totalDays = usersWithPurchases.reduce((sum, u) => {
                const firstPurchase = u.purchases[0];
                if (!firstPurchase) return sum;
                return sum + ((firstPurchase.createdAt.getTime() - u.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            }, 0);
            avgDaysToFirstPurchase = Math.round((totalDays / usersWithPurchases.length) * 10) / 10;
        }

        // ── Course KPIs (simplified — use _count) ──
        const courseKPIs = courses.map(c => ({
            id: c.id,
            title: c.title,
            coverImage: c.coverImage,
            activeSubscribers: c._count.subscriptions,
            totalPurchases: c._count.purchases,
            totalLessons: c._count.lessons,
            totalWatches: 0,
            totalLikes: 0,
        })).sort((a, b) => b.activeSubscribers - a.activeSubscribers);

        // ── Most watched (parallel lesson detail fetch) ──
        const watchedLessonIds = watchedLessons.map(w => w.lessonId);
        const favLessonIds = (favoritedResults as any[]).map((f: any) => f.lessonId);
        const allLessonIds = [...new Set([...watchedLessonIds, ...favLessonIds])];

        const lessonDetails = allLessonIds.length > 0
            ? await prisma.lesson.findMany({
                where: { id: { in: allLessonIds } },
                select: { id: true, title: true, course: { select: { title: true } } },
            })
            : [];

        const mostWatched = watchedLessons.map(w => {
            const lesson = lessonDetails.find(l => l.id === w.lessonId);
            return {
                lessonId: w.lessonId,
                title: lesson?.title || 'Noma\'lum',
                courseTitle: lesson?.course?.title || '—',
                watchCount: w._count.id,
            };
        });

        const mostFavorited = (favoritedResults as any[]).map((f: any) => {
            const lesson = lessonDetails.find(l => l.id === f.lessonId);
            return {
                lessonId: f.lessonId,
                title: lesson?.title || 'Noma\'lum',
                courseTitle: lesson?.course?.title || '—',
                favoriteCount: f._count.id,
            };
        });

        return NextResponse.json({
            dateRange: {
                from: dateFrom.toISOString().split('T')[0],
                to: new Date(dateTo.getTime() - 86400000).toISOString().split('T')[0],
                days: rangeDays,
                period: periodParam || (fromParam ? 'custom' : '30d'),
            },
            totals: {
                users: totalUsers,
                courses: totalCourses,
                lessons: totalLessons,
                activeSubscriptions: totalSubscriptions,
                totalRevenue,
                periodRevenue,
                periodUsers,
                periodSubscriptions,
                activeUsers7d: (activeUsersResult as any[]).length,
                avgDaysToFirstPurchase,
            },
            timeSeries: {
                registrations: registrationSeries,
                revenue: revenueSeries,
                subscriptions: subscriptionSeries,
            },
            courseKPIs,
            mostWatched,
            mostFavorited,
        });

    } catch (error: any) {
        console.error('Analytics API error:', error);
        return NextResponse.json(
            { error: process.env.NODE_ENV === 'production' ? 'Analytics failed' : `Analytics failed: ${error.message}` },
            { status: 500 }
        );
    }
}
