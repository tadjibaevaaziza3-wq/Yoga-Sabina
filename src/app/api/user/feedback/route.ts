/**
 * User Feedback API
 * POST /api/user/feedback — Submit feedback from app
 * GET /api/user/feedback — Get approved feedbacks (public, for About page)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';

export async function GET() {
    // Public endpoint — returns approved feedbacks for About page
    const feedbacks = await prisma.feedback.findMany({
        where: { isApproved: true },
        include: {
            user: {
                select: { firstName: true, lastName: true, telegramPhotoUrl: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    return NextResponse.json(feedbacks.map(f => ({
        id: f.id,
        message: f.message,
        rating: f.rating,
        name: `${f.user?.firstName || ''} ${f.user?.lastName || ''}`.trim() || 'Foydalanuvchi',
        avatar: f.user?.telegramPhotoUrl || null,
        createdAt: f.createdAt,
    })));
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, rating } = await request.json();
    if (!message || message.trim().length < 5) {
        return NextResponse.json({ error: "Kamida 5 ta belgi kiriting" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
        data: {
            userId: decoded.userId,
            message: message.trim(),
            rating: rating ? Math.min(5, Math.max(1, Number(rating))) : null,
            isApproved: false,
        }
    });

    return NextResponse.json({ success: true, id: feedback.id });
}
