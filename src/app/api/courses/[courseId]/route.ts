/**
 * API Route for Course Details
 * 
 * GET /api/courses/[id] - Get course with lessons (checks user access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocalUser } from '@/lib/auth/server';

/**
 * GET /api/courses/[id]
 * Get course details with lessons
 * - Public: Shows course info and free lessons
 * - Authenticated with subscription: Shows all lessons
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId: id } = await params;

        // Get authenticated user via custom auth
        const user = await getLocalUser();

        // Check if user has active subscription to this course
        let hasAccess = false;
        if (user) {
            const subscription = await prisma.subscription.findFirst({
                where: {
                    userId: user.id,
                    courseId: id,
                    status: 'ACTIVE',
                    endsAt: {
                        gte: new Date(),
                    },
                },
            });
            hasAccess = !!subscription;
        }

        // Fetch course with lessons
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                lessons: {
                    where: hasAccess
                        ? {} // Show all lessons if user has access
                        : { isFree: true }, // Show only free lessons otherwise
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        duration: true,
                        order: true,
                        isFree: true,
                        videoUrl: true,
                        content: true,
                        assets: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                                url: true,
                                storagePath: true,
                            },
                        },
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });

        if (!course) {
            return NextResponse.json(
                { success: false, error: 'Course not found' },
                { status: 404 }
            );
        }

        // Don't show inactive courses to non-admin users
        if (!course.isActive) {
            return NextResponse.json(
                { success: false, error: 'Course not available' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            course,
            hasAccess,
            lessonsCount: {
                total: await prisma.lesson.count({ where: { courseId: id } }),
                available: course.lessons.length,
            },
        });

    } catch (error: any) {
        console.error('Error fetching course:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
