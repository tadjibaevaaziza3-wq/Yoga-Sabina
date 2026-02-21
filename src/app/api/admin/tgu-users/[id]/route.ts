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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                subscriptions: {
                    orderBy: { endsAt: 'desc' },
                },
                eventLogs: {
                    orderBy: { createdAt: 'desc' },
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Process Watch Time from Heartbeats
        const heartbeats = user.eventLogs.filter(log => log.event === 'VIDEO_HEARTBEAT');
        const lessonStats: Record<string, { lessonId: string, watchTime: number, lastWatched: Date }> = {};

        heartbeats.forEach(hb => {
            const meta = (hb.metadata as any) || {};
            const lessonId = meta.lessonId || 'unknown';
            const interval = meta.watchInterval || 10;

            if (!lessonStats[lessonId]) {
                lessonStats[lessonId] = {
                    lessonId,
                    watchTime: 0,
                    lastWatched: hb.createdAt
                };
            }
            lessonStats[lessonId].watchTime += interval;
            if (new Date(hb.createdAt) > new Date(lessonStats[lessonId].lastWatched)) {
                lessonStats[lessonId].lastWatched = hb.createdAt;
            }
        });

        // Get Course Info for lessons (In a real app, join with Course/Lesson models)
        // For now, we return the processed stats

        const activitySummary = {
            profile: {
                id: user.id,
                name: (user as any).profile?.name || user.firstName || 'Unknown',
                phone: user.phone,
                telegramUsername: (user as any).profile?.bodyParams?.telegramUsername,
                region: (user as any).profile?.bodyParams?.region,
                registeredAt: user.createdAt,
            },
            subscriptions: user.subscriptions,
            lessonEngagement: Object.values(lessonStats),
            recentLogs: user.eventLogs.slice(0, 50) // Last 50 events
        };

        return NextResponse.json({ success: true, data: activitySummary });
    } catch (error: any) {
        console.error('User detail fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
