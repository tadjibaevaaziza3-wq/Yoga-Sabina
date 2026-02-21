import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocalUser } from '@/lib/auth/server';

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

        const users = await prisma.user.findMany({
            where: {
                role: 'USER',
            },
            include: {
                profile: true,
                subscriptions: {
                    orderBy: { endsAt: 'desc' },
                    take: 1,
                },
                eventLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                }
            },
        });

        // Map and calculate priorities
        const tguUsers = (users as any[]).map(user => {
            const latestSub = user.subscriptions?.[0];
            const lastActive = user.eventLogs?.[0]?.createdAt;

            let status = 'INACTIVE';
            let priority = 3; // Low priority
            let color = 'NONE';

            if (latestSub && latestSub.status === 'ACTIVE') {
                status = 'ACTIVE';
                const now = new Date();
                const endsAt = new Date(latestSub.endsAt);
                const diffDays = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays <= 3) {
                    priority = 0; // CRITICAL
                    color = 'RED';
                } else if (diffDays <= 7) {
                    priority = 1; // WARNING
                    color = 'ORANGE';
                } else {
                    priority = 2; // NORMAL
                }
            }

            return {
                id: user.id,
                userNumber: (user as any).userNumber || null, // Fallback if schema push failed
                name: user.profile?.name || user.firstName || 'Unknown',
                phone: user.phone,
                telegramId: user.telegramId,
                telegramUsername: (user.profile?.bodyParams as any)?.telegramUsername || null,
                region: (user.profile?.bodyParams as any)?.region || user.profile?.location || null,
                subscriptionStatus: status,
                expiryDate: latestSub?.endsAt,
                lastActive,
                priority,
                color,
                totalCourses: 0, // In reality, count purchases
            };
        });

        // Sort by priority (0 first) and then by expiry date
        tguUsers.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            if (!a.expiryDate) return 1;
            if (!b.expiryDate) return -1;
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        });

        return NextResponse.json({ success: true, users: tguUsers });
    } catch (error: any) {
        console.error('TGU Users fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
