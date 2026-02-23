import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token) as unknown as { userId: string };
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                profile: {
                    select: {
                        name: true,
                        totalYogaTime: true,
                        currentStreak: true,
                        longestStreak: true,
                        achievements: true
                    }
                },
                subscriptions: true,
                purchases: {
                    where: { status: 'PAID' }
                },
                enhancedProgress: {
                    take: 5,
                    orderBy: { updatedAt: 'desc' },
                    include: {
                        lesson: {
                            include: { course: true }
                        }
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                profile: user.profile,
                subscriptions: user.subscriptions,
                purchases: user.purchases,
                recentProgress: user.enhancedProgress
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
