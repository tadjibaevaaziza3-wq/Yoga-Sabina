/**
 * API Route for User's Purchased Courses
 * 
 * GET /api/user/my-courses - Get user's active subscriptions with courses
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';

async function getUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    const userId = verifyToken(token)
    if (!userId) return null
    return userId
}

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user
        const userId = await getUser();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's active subscriptions and paid purchases
        const [subscriptions, purchases] = await Promise.all([
            prisma.subscription.findMany({
                where: {
                    userId: userId,
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
            }),
            prisma.purchase.findMany({
                where: {
                    userId: userId,
                    status: 'PAID',
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
            })
        ]);

        // Combine and unique by courseId
        const activeCourses = [
            ...subscriptions.map(s => ({ ...s, isSubscription: true })),
            ...purchases.map(p => ({ ...p, isSubscription: false }))
        ];

        // Deduplicate: if a user has both a subscription and a purchase for the same course
        const uniqueCourses = activeCourses.reduce((acc, current) => {
            const x = acc.find(item => item.courseId === current.courseId);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, [] as any[]);

        // Get progress for each course
        const coursesWithProgress = await Promise.all(
            uniqueCourses.map(async (item) => {
                const totalLessons = item.course._count.lessons;

                let completedLessons = 0;
                let lastWatchedLesson = null;

                try {
                    // Get completed lessons for this specific course
                    const lessonIds = await prisma.lesson.findMany({
                        where: { courseId: item.courseId },
                        select: { id: true }
                    }).then(lessons => lessons.map(l => l.id));

                    const progressRecords = await prisma.enhancedVideoProgress.findMany({
                        where: {
                            userId: userId,
                            lessonId: { in: lessonIds }
                        },
                        orderBy: {
                            lastWatched: 'desc'
                        }
                    });

                    completedLessons = progressRecords.filter(p => p.completed || (p.progress > (p.duration || 0) * 0.9)).length;
                    const lastWatchedRecord = progressRecords[0];

                    if (lastWatchedRecord) {
                        lastWatchedLesson = await prisma.lesson.findUnique({
                            where: { id: lastWatchedRecord.lessonId },
                            select: {
                                id: true,
                                title: true,
                                titleRu: true,
                                thumbnailUrl: true,
                                videoUrl: true,
                            }
                        }) as any;

                        if (lastWatchedLesson) {
                            lastWatchedLesson.lastWatched = lastWatchedRecord.lastWatched;
                            lastWatchedLesson.progress = lastWatchedRecord.progress;
                            lastWatchedLesson.duration = lastWatchedRecord.duration;
                        }
                    }
                } catch (progressError) {
                    console.error(`Progress fetch failed for course ${item.courseId}:`, progressError);
                    // Continue with 0 progress rather than crashing
                }

                return {
                    subscription: item.isSubscription ? {
                        id: item.id,
                        startsAt: item.startsAt,
                        endsAt: item.endsAt,
                    } : null,
                    purchase: !item.isSubscription ? {
                        id: item.id,
                        amount: item.amount,
                        createdAt: item.createdAt,
                    } : null,
                    course: item.course,
                    progress: {
                        total: totalLessons,
                        completed: completedLessons,
                        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
                    },
                    lastWatchedLesson,
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
