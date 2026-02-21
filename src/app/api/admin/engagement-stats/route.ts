import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

import { verifyToken } from '@/lib/auth/server';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    return !!adminSession && !!verifyToken(adminSession);
}

export async function GET(request: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch top liked/commented lessons
        // For now, return mock or aggregate if potential
        const stats = await prisma.lesson.findMany({
            take: 5,
            select: {
                title: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                likes: {
                    _count: 'desc'
                }
            }
        });

        const formattedStats = stats.map(s => ({
            title: s.title,
            likes: s._count.likes,
            comments: s._count.comments
        }));

        return NextResponse.json({ success: true, stats: formattedStats });

    } catch (error: any) {
        console.error('Stats error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
