/**
 * Admin Analytics API
 * GET /api/admin/analytics — Comprehensive platform analytics
 * Returns: time-series data, KPIs, course stats, favorites, watch stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth/admin-auth';

export async function GET(request: NextRequest) {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // ── Time ranges ──
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // ── 1. Totals ──
    const [totalUsers, totalCourses, totalLessons, totalSubscriptions] = await Promise.all([
        prisma.user.count(),
        prisma.course.count({ where: { isActive: true } }),
        prisma.lesson.count(),
        prisma.subscription.count({ where: { status: 'ACTIVE', endsAt: { gt: now } } }),
    ]);

    // ── 2. Revenue totals ──
    const paidPurchases = await prisma.purchase.findMany({
        where: { status: 'PAID' },
        select: { amount: true, createdAt: true },
    });
    const totalRevenue = paidPurchases.reduce((sum, p) => sum + Number(p.amount), 0);
    const monthlyRevenue = paidPurchases
        .filter(p => p.createdAt >= thirtyDaysAgo)
        .reduce((sum, p) => sum + Number(p.amount), 0);

    // ── 3. User registration time series (last 30 days) ──
    const usersLast30 = await prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
    });

    const registrationSeries: { date: string; count: number }[] = [];
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const count = usersLast30.filter(u => u.createdAt.toISOString().split('T')[0] === dateStr).length;
        registrationSeries.push({ date: dateStr, count });
    }

    // ── 4. Revenue time series (last 30 days) ──
    const revenueSeries: { date: string; amount: number }[] = [];
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayAmount = paidPurchases
            .filter(p => p.createdAt.toISOString().split('T')[0] === dateStr)
            .reduce((sum, p) => sum + Number(p.amount), 0);
        revenueSeries.push({ date: dateStr, amount: dayAmount });
    }

    // ── 5. Cumulative users over time (last 90 days, weekly) ──
    const allUsers = await prisma.user.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
    });
    const cumulativeUsers: { date: string; total: number }[] = [];
    for (let d = new Date(ninetyDaysAgo); d <= today; d.setDate(d.getDate() + 7)) {
        const dateStr = d.toISOString().split('T')[0];
        const totalAtDate = allUsers.filter(u => u.createdAt <= d).length;
        cumulativeUsers.push({ date: dateStr, total: totalAtDate });
    }

    // ── 6. Subscription time series (last 30 days) ──
    const subsLast30 = await prisma.subscription.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
    });

    const subscriptionSeries: { date: string; count: number }[] = [];
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const count = subsLast30.filter(s => s.createdAt.toISOString().split('T')[0] === dateStr).length;
        subscriptionSeries.push({ date: dateStr, count });
    }

    // ── 7. Average time from registration to first purchase ──
    const usersWithPurchases = await prisma.user.findMany({
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
    });

    let avgDaysToFirstPurchase = 0;
    if (usersWithPurchases.length > 0) {
        const totalDays = usersWithPurchases.reduce((sum, u) => {
            const firstPurchase = u.purchases[0];
            if (!firstPurchase) return sum;
            const diffMs = firstPurchase.createdAt.getTime() - u.createdAt.getTime();
            return sum + (diffMs / (1000 * 60 * 60 * 24));
        }, 0);
        avgDaysToFirstPurchase = Math.round((totalDays / usersWithPurchases.length) * 10) / 10;
    }

    // ── 8. Course KPIs (subscribers per course, watch counts) ──
    const courses = await prisma.course.findMany({
        where: { isActive: true },
        select: {
            id: true,
            title: true,
            coverImage: true,
            subscriptions: { where: { status: 'ACTIVE', endsAt: { gt: now } }, select: { id: true } },
            purchases: { where: { status: 'PAID' }, select: { id: true } },
            lessons: {
                select: {
                    id: true,
                    title: true,
                    progress: { select: { id: true } },
                    likes: { select: { id: true } },
                },
            },
        },
    });

    const courseKPIs = courses.map(c => ({
        id: c.id,
        title: c.title,
        coverImage: c.coverImage,
        activeSubscribers: c.subscriptions.length,
        totalPurchases: c.purchases.length,
        totalLessons: c.lessons.length,
        totalWatches: c.lessons.reduce((sum, l) => sum + l.progress.length, 0),
        totalLikes: c.lessons.reduce((sum, l) => sum + l.likes.length, 0),
    })).sort((a, b) => b.activeSubscribers - a.activeSubscribers);

    // ── 9. Most watched videos ──
    const watchedLessons = await prisma.videoProgress.groupBy({
        by: ['lessonId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
    });

    const watchedLessonIds = watchedLessons.map(w => w.lessonId);
    const lessonDetails = await prisma.lesson.findMany({
        where: { id: { in: watchedLessonIds } },
        select: { id: true, title: true, course: { select: { title: true } } },
    });

    const mostWatched = watchedLessons.map(w => {
        const lesson = lessonDetails.find(l => l.id === w.lessonId);
        return {
            lessonId: w.lessonId,
            title: lesson?.title || 'Noma\'lum',
            courseTitle: lesson?.course?.title || '—',
            watchCount: w._count.id,
        };
    });

    // ── 10. Most liked (favorited) lessons ──
    let mostFavorited: any[] = [];
    try {
        const favoritedLessons = await prisma.favoriteLesson.groupBy({
            by: ['lessonId'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
        });

        const favLessonIds = favoritedLessons.map(f => f.lessonId);
        const favLessonDetails = await prisma.lesson.findMany({
            where: { id: { in: favLessonIds } },
            select: { id: true, title: true, course: { select: { title: true } } },
        });

        mostFavorited = favoritedLessons.map(f => {
            const lesson = favLessonDetails.find(l => l.id === f.lessonId);
            return {
                lessonId: f.lessonId,
                title: lesson?.title || 'Noma\'lum',
                courseTitle: lesson?.course?.title || '—',
                favoriteCount: f._count.id,
            };
        });
    } catch { /* FavoriteLesson may not exist yet */ }

    // ── 11. Active users (users who watched something in last 7 days) ──
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsersCount = await prisma.videoProgress.groupBy({
        by: ['userId'],
        where: { lastWatched: { gte: sevenDaysAgo } },
    });

    return NextResponse.json({
        totals: {
            users: totalUsers,
            courses: totalCourses,
            lessons: totalLessons,
            activeSubscriptions: totalSubscriptions,
            totalRevenue,
            monthlyRevenue,
            activeUsers7d: activeUsersCount.length,
            avgDaysToFirstPurchase,
        },
        timeSeries: {
            registrations: registrationSeries,
            revenue: revenueSeries,
            subscriptions: subscriptionSeries,
            cumulativeUsers,
        },
        courseKPIs,
        mostWatched,
        mostFavorited,
    });
}
