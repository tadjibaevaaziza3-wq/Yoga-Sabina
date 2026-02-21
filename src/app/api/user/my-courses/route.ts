/**
 * API Route for User's Purchased Courses
 * 
 * GET /api/user/my-courses - Get user's active subscriptions with courses
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's active subscriptions with course details
        const subscriptions = await prisma.subscription.findMany({
            where: {
                userId: user.id,
                status: 'ACTIVE',
                endsAt: {
                    gte: new Date(),
                },
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        titleRu: true,
                        description: true,
                        descriptionRu: true,
                        coverImage: true,
                        type: true,
                        _count: {
                            select: {
                                lessons: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Get progress for each course
        const coursesWithProgress = await Promise.all(
            subscriptions.map(async (sub) => {
                // Get total lessons
                const totalLessons = sub.course._count.lessons;

                // Get completed lessons (we'll consider a lesson completed if user watched >80%)
                // For now, we'll just return 0 as we haven't implemented progress tracking yet
                const completedLessons = 0;

                return {
                    subscription: {
                        id: sub.id,
                        startsAt: sub.startsAt,
                        endsAt: sub.endsAt,
                    },
                    course: sub.course,
                    progress: {
                        total: totalLessons,
                        completed: completedLessons,
                        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
                    },
                };
            })
        );

        return NextResponse.json({
            success: true,
            courses: coursesWithProgress,
        });

    } catch (error: any) {
        console.error('Error fetching user courses:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
