/**
 * API Route for Course Details
 * 
 * GET /api/courses/[id] - Get course with lessons (checks user access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocalUser } from '@/lib/auth/server';

// Helper: check if ID looks like a valid CUID
const isCuid = (s: string) => /^c[a-z0-9]{20,}$/i.test(s)

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

        // Resolve the course ID - try direct lookup first, then title search
        let resolvedId = id;

        // First: try findUnique by ID (works for both CUIDs and slug-based IDs)
        let testCourse = null;
        try {
            testCourse = await prisma.course.findUnique({
                where: { id },
                select: { id: true }
            });
        } catch (e) {
            // ID format error
        }

        if (testCourse) {
            resolvedId = testCourse.id;
        } else {
            // Fallback: search by slug pattern in title
            try {
                const searchTerm = id.replace(/-/g, ' ')
                const matchedCourse = await prisma.course.findFirst({
                    where: {
                        OR: [
                            { title: { contains: searchTerm, mode: 'insensitive' } },
                            { titleRu: { contains: searchTerm, mode: 'insensitive' } },
                        ]
                    },
                    select: { id: true }
                });
                if (matchedCourse) {
                    resolvedId = matchedCourse.id;
                }
            } catch (e) {
                // Slug search failed, keep original id
            }
        }

        // Check if user has active subscription to this course
        let hasAccess = false;
        if (user) {
            const subscription = await prisma.subscription.findFirst({
                where: {
                    userId: user.id,
                    courseId: resolvedId,
                    status: 'ACTIVE',
                    endsAt: {
                        gte: new Date(),
                    },
                },
            });
            hasAccess = !!subscription;
        }

        // Fetch course with lessons — always return all lesson titles for sales preview
        // but strip video URLs and content for non-subscribers
        const course = await prisma.course.findUnique({
            where: { id: resolvedId },
            include: {
                lessons: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        duration: true,
                        order: true,
                        isFree: true,
                        // Only include video/content for subscribers
                        ...(hasAccess ? {
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
                        } : {}),
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
                total: await prisma.lesson.count({ where: { courseId: resolvedId } }),
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
