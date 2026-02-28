/**
 * Public Announcements API
 * 
 * GET /api/announcements — returns active announcements
 * Supports audience targeting and auto-generates personalized announcements
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocalUser } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
    try {
        const user = await getLocalUser().catch(() => null);
        const lang = request.nextUrl.searchParams.get('lang') || 'uz';

        // Get all active, non-expired announcements
        const announcements = await prisma.announcement.findMany({
            where: {
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gte: new Date() } },
                ],
            },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' },
            ],
            take: 20,
        });

        // Check user subscription status for audience filtering
        let isSubscriber = false;
        let expiringSubscription: any = null;

        if (user) {
            const activeSub = await prisma.subscription.findFirst({
                where: {
                    userId: user.id,
                    status: 'ACTIVE',
                    endsAt: { gte: new Date() },
                },
                include: { course: { select: { id: true, title: true, titleRu: true } } },
                orderBy: { endsAt: 'asc' },
            });

            isSubscriber = !!activeSub;

            // Check if subscription expires within 5 days
            if (activeSub?.endsAt) {
                const daysLeft = Math.ceil((activeSub.endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                if (daysLeft <= 5 && daysLeft >= 0) {
                    expiringSubscription = {
                        courseId: activeSub.courseId,
                        courseTitle: lang === 'ru' ? (activeSub.course?.titleRu || activeSub.course?.title) : activeSub.course?.title,
                        daysLeft,
                        endsAt: activeSub.endsAt,
                    };
                }
            }
        }

        // Filter by audience
        const filtered = announcements.filter((a) => {
            if (a.audience === 'ALL') return true;
            if (a.audience === 'SUBSCRIBERS' && isSubscriber) return true;
            if (a.audience === 'NON_SUBSCRIBERS' && !isSubscriber) return true;
            return false;
        });

        // Format for response
        const result = filtered.map((a) => ({
            id: a.id,
            title: lang === 'ru' ? (a.titleRu || a.title) : a.title,
            message: lang === 'ru' ? (a.messageRu || a.message) : a.message,
            type: a.type,
            imageUrl: a.imageUrl,
            targetUrl: a.targetUrl,
            isPinned: a.isPinned,
            createdAt: a.createdAt,
        }));

        // Auto-generate personalized SUB_EXPIRING announcement
        if (expiringSubscription) {
            const subMsg = lang === 'ru'
                ? `Ваша подписка на "${expiringSubscription.courseTitle}" заканчивается через ${expiringSubscription.daysLeft} дн. Продлите сейчас!`
                : `"${expiringSubscription.courseTitle}" obunangiz ${expiringSubscription.daysLeft} kunda tugaydi. Hozir uzaytiring!`;

            result.unshift({
                id: `sub-expiring-${expiringSubscription.courseId}`,
                title: lang === 'ru' ? '⏰ Подписка заканчивается' : '⏰ Obuna tugamoqda',
                message: subMsg,
                type: 'SUB_EXPIRING',
                imageUrl: null,
                targetUrl: `/${lang}/checkout?id=${expiringSubscription.courseId}&type=course&from=prolong`,
                isPinned: true,
                createdAt: new Date(),
            });
        }

        return NextResponse.json({ success: true, announcements: result });
    } catch (error: any) {
        console.error('Announcements API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
