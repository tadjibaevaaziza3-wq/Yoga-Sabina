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

export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const activeSubs = await prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                endsAt: {
                    lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Within 3 days
                }
            },
            include: { user: true }
        });

        const notifications = [];

        for (const sub of activeSubs) {
            const endsAt = new Date(sub.endsAt);
            const diffDays = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            let message = '';
            if (diffDays <= 1) {
                message = "Faqat 1 kun qoldi! Obunangizni uzaytirishni unutmang.";
            } else if (diffDays <= 2) {
                message = "Obunangiz 2 kundan keyin tugaydi. Mashg'ulotlarni davom ettirish uchun uzaytiring.";
            } else if (diffDays <= 3) {
                message = "Obunangiz tugashiga 3 kun qoldi. Biz bilan qoling!";
            }

            if (message) {
                // In a real system, we'd send Telegram or App Notification here
                // For now, we log it as an event that the User Panel will show
                await (prisma as any).eventLog.create({
                    data: {
                        userId: sub.userId,
                        event: 'SUBSCRIPTION_REMINDER',
                        metadata: { message, diffDays, endsAt: sub.endsAt }
                    }
                });
                notifications.push({ userId: sub.userId, message });
            }
        }

        return NextResponse.json({
            success: true,
            sentCount: notifications.length,
            notifications
        });
    } catch (error: any) {
        console.error('Reminder trigger error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
