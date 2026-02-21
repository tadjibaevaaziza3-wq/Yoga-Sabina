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

        const purchases = await prisma.purchase.findMany({
            include: {
                user: {
                    include: { profile: true }
                },
                course: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const formatted = purchases.map(p => ({
            id: p.id,
            userName: p.user.profile?.name || p.user.firstName || 'Unknown',
            userPhone: p.user.phone,
            courseName: p.course.title,
            amount: p.amount,
            method: p.provider,
            status: p.status,
            txnId: p.providerTxnId,
            createdAt: p.createdAt,
            screenshotUrl: (p as any).screenshotUrl || null, // Support if existed
            verified: (p as any).verifiedByAdmin || false,
        }));

        return NextResponse.json({ success: true, purchases: formatted });
    } catch (error: any) {
        console.error('Purchases fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { purchaseId, action } = await request.json(); // action: APPROVE or REJECT

        const purchase = await prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: { user: true }
        });

        if (!purchase) {
            return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
        }

        if (action === 'APPROVE') {
            // Check if subscription exists for this user and course
            const existingSub = await prisma.subscription.findFirst({
                where: {
                    userId: purchase.userId,
                    courseId: purchase.courseId
                }
            });

            // Atomic update: Purchase status + Subscription activation
            if (existingSub) {
                await prisma.$transaction([
                    prisma.purchase.update({
                        where: { id: purchaseId },
                        data: {
                            status: 'PAID',
                            performTime: new Date(),
                        }
                    }),
                    prisma.subscription.update({
                        where: { id: existingSub.id },
                        data: {
                            status: 'ACTIVE',
                            startsAt: new Date(),
                            endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        }
                    })
                ]);
            } else {
                await prisma.$transaction([
                    prisma.purchase.update({
                        where: { id: purchaseId },
                        data: {
                            status: 'PAID',
                            performTime: new Date(),
                        }
                    }),
                    prisma.subscription.create({
                        data: {
                            userId: purchase.userId,
                            courseId: purchase.courseId,
                            status: 'ACTIVE',
                            startsAt: new Date(),
                            endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        }
                    })
                ]);
            }
        } else if (action === 'REJECT') {
            await prisma.purchase.update({
                where: { id: purchaseId },
                data: { status: 'FAILED' }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Purchase verification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
