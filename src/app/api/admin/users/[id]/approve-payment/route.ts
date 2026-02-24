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

// POST /api/admin/users/[id]/approve-payment
// Approves a pending payment screenshot and creates automatic subscription
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = await params;

    try {
        // Find pending purchase with screenshot
        const pendingPurchase = await prisma.purchase.findFirst({
            where: {
                userId,
                screenshotUrl: { not: null },
                verifiedByAdmin: false,
                status: 'PENDING',
            },
            include: {
                course: true,
            },
        });

        if (!pendingPurchase) {
            return NextResponse.json({ error: "Bu foydalanuvchida kutilayotgan to'lov topilmadi" }, { status: 404 });
        }

        // Get course duration for subscription
        const durationDays = pendingPurchase.course?.durationDays || 30;
        const now = new Date();
        const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        // Transaction: approve purchase + create subscription
        await prisma.$transaction([
            // Mark purchase as verified
            prisma.purchase.update({
                where: { id: pendingPurchase.id },
                data: {
                    verifiedByAdmin: true,
                    status: 'PAID',
                    performTime: now,
                },
            }),
            // Create subscription
            prisma.subscription.create({
                data: {
                    userId,
                    courseId: pendingPurchase.courseId,
                    startsAt: now,
                    endsAt,
                    status: 'ACTIVE',
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: `"${pendingPurchase.course?.title}" kursiga ${durationDays} kunlik obuna berildi`,
        });
    } catch (error: any) {
        console.error('Error approving payment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
