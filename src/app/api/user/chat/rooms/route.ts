import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLocalUser } from "@/lib/auth/server";

/**
 * GET /api/user/chat/rooms
 * Returns a list of courses the user has access to, to be displayed in the UserChatManager.
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getLocalUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch courses the user has purchased or subscribed to
        const userWithAccess = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                purchases: {
                    where: { status: 'PAID' },
                    select: { courseId: true }
                },
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    select: { courseId: true }
                },
                offlineAttendances: {
                    select: { session: { select: { courseId: true } } }
                }
            }
        });

        if (!userWithAccess && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let uniqueCourseIds: string[] = [];

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            const allCourses = await prisma.course.findMany({
                where: { isActive: true },
                select: { id: true }
            });
            uniqueCourseIds = allCourses.map(c => c.id);
        } else if (userWithAccess) {
            const accessibleCourseIds = [
                ...userWithAccess.purchases.map(p => p.courseId),
                ...userWithAccess.subscriptions.map(s => s.courseId),
                ...userWithAccess.offlineAttendances.map(a => a.session.courseId)
            ];
            uniqueCourseIds = Array.from(new Set(accessibleCourseIds));
        }

        if (uniqueCourseIds.length === 0) {
            return NextResponse.json({ success: true, rooms: [] });
        }

        const courses = await prisma.course.findMany({
            where: {
                id: { in: uniqueCourseIds },
                isActive: true
            },
            select: {
                id: true,
                title: true,
                titleRu: true,
                type: true,
                coverImage: true,
                _count: {
                    select: {
                        courseChats: true // Total count (optional, but good for UI)
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
            coverImage: course.coverImage,
            messageCount: course._count.courseChats
        }));

        return NextResponse.json({ success: true, rooms });
    } catch (error: any) {
        console.error('Error fetching chat rooms:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
