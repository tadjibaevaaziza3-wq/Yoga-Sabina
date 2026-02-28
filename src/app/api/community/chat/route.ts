import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '50');

        const messages = await prisma.communityMessage.findMany({
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor }
            }),
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        telegramPhotoUrl: true,
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            messages: messages.reverse(), // oldest first for chat display
            nextCursor: messages.length === limit ? messages[0]?.id : null,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const userId = verifyToken(token);
        if (!userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

        const { message, sharedKPI, photoUrl } = await request.json();

        if (!message?.trim() && !sharedKPI) {
            return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
        }

        const newMessage = await prisma.communityMessage.create({
            data: {
                userId,
                message: message?.trim() || '📊 KPI ulashdi',
                sharedKPI: sharedKPI || undefined,
                photoUrl: photoUrl || undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        telegramPhotoUrl: true,
                    }
                }
            }
        });

        return NextResponse.json({ success: true, message: newMessage });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
