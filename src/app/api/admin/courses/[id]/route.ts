/**
 * API Routes for Individual Course Management (Admin Only)
 * 
 * GET    /api/admin/courses/[id] - Get course details
 * PUT    /api/admin/courses/[id] - Update course
 * DELETE /api/admin/courses/[id] - Delete course
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Validation schema for course creation/update
const lessonSchema = z.object({
    id: z.string().optional(),
    title: z.string().optional().nullable(),
    titleRu: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    descriptionRu: z.string().optional().nullable(),
    duration: z.number().optional().nullable(),
    isFree: z.boolean().default(false),
    videoUrl: z.string().optional().nullable(),
    audioUrl: z.string().optional().nullable(),
    pdfUrl: z.string().optional().nullable(),
    content: z.string().optional().nullable(),
});

const moduleSchema = z.object({
    id: z.string().optional(),
    title: z.string().optional().nullable(),
    titleRu: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    descriptionRu: z.string().optional().nullable(),
    lessons: z.array(lessonSchema).optional(),
});

const courseUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    titleRu: z.string().optional(),
    description: z.string().min(1).optional(),
    descriptionRu: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    durationDays: z.number().int().min(0).optional(),
    durationLabel: z.string().optional(),
    type: z.enum(['ONLINE', 'OFFLINE']).optional(),
    productType: z.enum(['COURSE', 'CONSULTATION']).optional(),
    consultationFormat: z.enum(['ONLINE', 'OFFLINE']).optional(),
    coverImage: z.string().optional(),
    isActive: z.boolean().optional(),
    location: z.string().optional(),
    locationRu: z.string().optional(),
    schedule: z.string().optional(),
    scheduleRu: z.string().optional(),
    times: z.string().optional(),
    timesRu: z.string().optional(),
    features: z.array(z.string()).optional(),
    featuresRu: z.array(z.string()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.string().optional(),
    modules: z.array(moduleSchema).optional(),
    targetAudience: z.enum(['MEN', 'WOMEN', 'ALL']).optional(),
});

import { verifyToken } from '@/lib/auth/server';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

/**
 * GET /api/admin/courses/[id]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                assets: true
                            },
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                },
                lessons: {
                    include: {
                        assets: true,
                        _count: {
                            select: {
                                comments: true,
                                likes: true,
                            },
                        },
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                _count: {
                    select: {
                        purchases: true,
                        subscriptions: true,
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

        return NextResponse.json({ success: true, course });

    } catch (error: any) {
        console.error('Error fetching course:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/courses/[id]
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const validation = courseUpdateSchema.safeParse(body);

        if (!validation.success) {
            console.error('Course update validation failed. Detailed errors:', JSON.stringify(validation.error.issues, null, 2));
            return NextResponse.json(
                { success: false, error: 'Invalid request', details: validation.error.issues },
                { status: 400 }
            );
        }

        const data = validation.data;

        await prisma.$transaction(async (tx) => {
            // 1. Update Course ... (same as above)
            await tx.course.update({
                where: { id },
                data: {
                    title: data.title,
                    titleRu: data.titleRu,
                    description: data.description,
                    descriptionRu: data.descriptionRu,
                    price: data.price,
                    durationDays: data.durationDays,
                    durationLabel: data.durationLabel,
                    type: data.type,
                    productType: data.productType,
                    consultationFormat: data.consultationFormat,
                    targetAudience: data.targetAudience,
                    coverImage: data.coverImage,
                    isActive: data.isActive,
                    location: data.location,
                    locationRu: data.locationRu,
                    schedule: data.schedule,
                    scheduleRu: data.scheduleRu,
                    times: data.times,
                    timesRu: data.timesRu,
                    features: data.features,
                    featuresRu: data.featuresRu,
                    seoTitle: data.seoTitle,
                    seoDescription: data.seoDescription,
                    seoKeywords: data.seoKeywords,
                },
            });

            if (data.modules) {
                // Delete missing modules (same as above)
                const existingModules = await tx.module.findMany({
                    where: { courseId: id },
                    select: { id: true }
                });
                const existingModuleIds = existingModules.map(m => m.id);
                const payloadModuleIds = data.modules
                    .filter(m => m.id && !m.id.startsWith('temp-'))
                    .map(m => m.id as string);
                const modulesToDelete = existingModuleIds.filter(mid => !payloadModuleIds.includes(mid));
                if (modulesToDelete.length > 0) {
                    await tx.module.deleteMany({ where: { id: { in: modulesToDelete } } });
                }

                // Collect all valid lesson IDs to Identify deletions
                const allPayloadLessonIds: string[] = [];
                data.modules.forEach(m => {
                    if (m.lessons) {
                        m.lessons.forEach(l => {
                            if (l.id && !l.id.startsWith('temp-')) {
                                allPayloadLessonIds.push(l.id);
                            }
                        });
                    }
                });
                // Delete missing lessons
                const existingLessons = await tx.lesson.findMany({ where: { courseId: id }, select: { id: true } });
                const existingLessonIds = existingLessons.map(l => l.id);
                const lessonsToDelete = existingLessonIds.filter(lid => !allPayloadLessonIds.includes(lid));
                if (lessonsToDelete.length > 0) {
                    await tx.lesson.deleteMany({ where: { id: { in: lessonsToDelete } } });
                }


                // Process Modules and Lessons
                for (let i = 0; i < data.modules.length; i++) {
                    const mod = data.modules[i];
                    let currentModuleId = mod.id;

                    if (!currentModuleId || currentModuleId.startsWith('temp-')) {
                        const newModule = await tx.module.create({
                            data: {
                                courseId: id,
                                title: mod.title || 'Untitled Module',
                                titleRu: mod.titleRu || undefined,
                                description: mod.description || undefined,
                                order: i,
                            }
                        });
                        currentModuleId = newModule.id;
                    } else {
                        await tx.module.update({
                            where: { id: currentModuleId },
                            data: {
                                title: mod.title || 'Untitled Module',
                                titleRu: mod.titleRu || undefined,
                                description: mod.description || undefined,
                                order: i
                            }
                        });
                    }

                    if (mod.lessons) {
                        for (let j = 0; j < mod.lessons.length; j++) {
                            const lesson = mod.lessons[j];
                            if (!lesson.id || lesson.id.startsWith('temp-')) {
                                await tx.lesson.create({
                                    data: {
                                        courseId: id,
                                        moduleId: currentModuleId,
                                        title: lesson.title || 'Untitled Lesson',
                                        titleRu: lesson.titleRu || undefined,
                                        description: lesson.description || undefined,
                                        descriptionRu: lesson.descriptionRu || undefined,
                                        duration: lesson.duration,
                                        isFree: lesson.isFree,
                                        videoUrl: lesson.videoUrl || undefined,
                                        audioUrl: lesson.audioUrl || undefined,
                                        pdfUrl: lesson.pdfUrl || undefined,
                                        order: j,
                                    }
                                });
                            } else {
                                await tx.lesson.update({
                                    where: { id: lesson.id },
                                    data: {
                                        moduleId: currentModuleId, // Moves lesson if module changed
                                        title: lesson.title || 'Untitled Lesson',
                                        titleRu: lesson.titleRu || undefined,
                                        description: lesson.description || undefined,
                                        descriptionRu: lesson.descriptionRu || undefined,
                                        duration: lesson.duration,
                                        isFree: lesson.isFree,
                                        videoUrl: lesson.videoUrl || undefined,
                                        audioUrl: lesson.audioUrl || undefined,
                                        pdfUrl: lesson.pdfUrl || undefined,
                                        order: j,
                                    }
                                });
                            }
                        }
                    }
                }
            }
        });

        const updatedCourse = await prisma.course.findUnique({
            where: { id },
            include: { modules: { include: { lessons: true } } }
        });

        // Revalidate public pages
        revalidatePath('/[lang]/courses', 'page');
        revalidatePath('/[lang]/', 'page');

        return NextResponse.json({ success: true, course: updatedCourse });

    } catch (error: any) {
        console.error('Error updating course:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Course not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/courses/[id]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if course has active subscriptions
        const activeSubscriptions = await prisma.subscription.count({
            where: {
                courseId: id,
                status: 'ACTIVE',
                endsAt: {
                    gte: new Date(),
                },
            },
        });

        if (activeSubscriptions > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Cannot delete course with active subscriptions',
                    activeSubscriptions,
                },
                { status: 400 }
            );
        }

        await prisma.course.delete({
            where: { id },
        });

        // Revalidate public pages
        revalidatePath('/[lang]/courses', 'page');
        revalidatePath('/[lang]/', 'page');

        return NextResponse.json({
            success: true,
            message: 'Course deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting course:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Course not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
