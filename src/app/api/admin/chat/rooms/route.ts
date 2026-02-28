import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    const decoded = verifyToken(adminSession);
    return !!decoded;
}

/**
 * GET /api/admin/chat/rooms
 * Returns a list of all courses with their message counts in CourseChat
 */
export async function GET(req: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const courses = await prisma.course.findMany({
            select: {
                id: true,
                title: true,
                titleRu: true,
                type: true,
                _count: {
                    select: {
                        courseChats: { where: { isDeleted: false } }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const rooms = courses.map(course => ({
            id: course.id,
            title: course.title,
            titleRu: course.titleRu,
            type: course.type,
            messageCount: course._count.courseChats
        }));

        return NextResponse.json({ success: true, rooms });
    } catch (error: any) {
        console.error('Error fetching chat rooms:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
