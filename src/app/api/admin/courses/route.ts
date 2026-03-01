/**
 * API Routes for Course Management (Admin Only)
 * 
 * GET    /api/admin/courses - List all courses
 * POST   /api/admin/courses - Create new course
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { autoTranslateFields } from '@/lib/translate';

// Validation schema for course creation/update
const lessonSchema = z.object({
    id: z.string().optional(), // For updates
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
    id: z.string().optional(), // For updates
    title: z.string().optional().nullable(),
    titleRu: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    descriptionRu: z.string().optional().nullable(),
    lessons: z.array(lessonSchema).optional(),
});

const courseSchema = z.object({
    title: z.string().min(1),
    titleRu: z.string().optional(),
    description: z.string().min(1),
    descriptionRu: z.string().optional(),
    price: z.coerce.number().min(0),
    durationDays: z.number().int().min(0).optional(),
    durationLabel: z.string().optional(),
    type: z.enum(['ONLINE', 'OFFLINE']),
    productType: z.enum(['COURSE', 'CONSULTATION']).default('COURSE'),
    consultationFormat: z.enum(['ONLINE', 'OFFLINE']).optional(),
    coverImage: z.string().optional(),
    isActive: z.boolean().default(true),
    location: z.string().optional(),
    locationRu: z.string().optional(),
    schedule: z.string().optional(),
    scheduleRu: z.string().optional(),
    times: z.string().optional(),
    timesRu: z.string().optional(),
    features: z.array(z.string()).optional(),
    featuresRu: z.array(z.string()).optional(),
    // New fields
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.string().optional(),
    modules: z.array(moduleSchema).optional(),
    targetAudience: z.enum(['MEN', 'WOMEN', 'ALL']).optional(),
});

// Helper to check if user is admin
import { verifyToken } from '@/lib/auth/server';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) {
        console.log('[Admin API] No admin_session cookie found');
        return false;
    }
    const result = verifyToken(adminSession);
    if (!result) {
        console.log('[Admin API] verifyToken returned null. Cookie length:', adminSession.length);
    }
    return !!result;
}

/**
 * GET /api/admin/courses
 * List all courses with optional filtering
 */
export async function GET(request: NextRequest) {
    try {
        // Check admin access
        if (!await isAdmin()) {
            console.log('[Admin API] Courses GET: Unauthorized');
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const isActive = searchParams.get('isActive');

        const courses = await prisma.course.findMany({
            where: {
                ...(type && { type: type as 'ONLINE' | 'OFFLINE' }),
                ...(isActive !== null && { isActive: isActive === 'true' }),
            },
            include: {
                modules: {
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                },
                lessons: { // Keep for backward compatibility
                    select: {
                        id: true,
                        title: true,
                        order: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                _count: {
                    select: {
                        lessons: true,
                        purchases: true,
                        subscriptions: true,
                        modules: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ success: true, courses });

    } catch (error: any) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/courses
 * Create new course
 */
export async function POST(request: NextRequest) {
    try {
        // Check admin access
        if (!await isAdmin()) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validation = courseSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request', details: validation.error.issues },
                { status: 400 }
            );
        }

        const data = validation.data;

        // ─── Auto-translate missing fields ───
        const translated = await autoTranslateFields(data as Record<string, any>);

        // Auto-translate modules & lessons
        const translatedModules = data.modules
            ? await Promise.all(data.modules.map(async (mod) => {
                const tMod = await autoTranslateFields(mod as Record<string, any>, [
                    ['title', 'titleRu'],
                    ['description', 'descriptionRu'],
                ]);
                const tLessons = mod.lessons
                    ? await Promise.all(mod.lessons.map(async (lesson) => {
                        const tLesson = await autoTranslateFields(lesson as Record<string, any>, [
                            ['title', 'titleRu'],
                            ['description', 'descriptionRu'],
                        ]);
                        return { ...lesson, ...tLesson };
                    }))
                    : mod.lessons;
                return { ...mod, ...tMod, lessons: tLessons };
            }))
            : data.modules;

        // Create transaction to ensure everything is created correctly
        const course = await prisma.course.create({
            data: {
                title: translated.title || data.title,
                titleRu: translated.titleRu || data.titleRu,
                description: translated.description || data.description,
                descriptionRu: translated.descriptionRu || data.descriptionRu,
                price: data.price,
                durationDays: data.durationDays || 30,
                durationLabel: data.durationLabel,
                type: data.type,
                productType: data.productType,
                consultationFormat: data.consultationFormat,
                targetAudience: data.targetAudience,
                coverImage: data.coverImage,
                isActive: data.isActive,
                location: translated.location || data.location,
                locationRu: translated.locationRu || data.locationRu,
                schedule: translated.schedule || data.schedule,
                scheduleRu: translated.scheduleRu || data.scheduleRu,
                times: translated.times || data.times,
                timesRu: translated.timesRu || data.timesRu,
                features: translated.features ?? data.features ?? undefined,
                featuresRu: translated.featuresRu ?? data.featuresRu ?? undefined,
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
                seoKeywords: data.seoKeywords,
                modules: {
                    create: translatedModules?.map((mod, index) => ({
                        title: mod.title || 'Untitled Module',
                        titleRu: mod.titleRu || undefined,
                        description: mod.description || undefined,
                        order: index,
                        lessons: {
                            create: mod.lessons?.map((lesson, lIndex) => ({
                                title: lesson.title || 'Untitled Lesson',
                                titleRu: lesson.titleRu || undefined,
                                description: lesson.description || undefined,
                                descriptionRu: lesson.descriptionRu || undefined,
                                duration: lesson.duration,
                                isFree: lesson.isFree,
                                videoUrl: lesson.videoUrl || undefined,
                                audioUrl: lesson.audioUrl || undefined,
                                content: lesson.content || undefined,
                                order: lIndex,
                                courseId: '', // placeholder, Prisma handles this in nested create
                            }))
                        }
                    }))
                }
            },
            include: {
                modules: {
                    include: {
                        lessons: true
                    }
                }
            },
        });

        // 🔄 Auto-create course chat room with welcome message
        try {
            await prisma.courseChat.create({
                data: {
                    courseId: course.id,
                    userId: 'system', // System message
                    message: `🎉 "${course.title}" kursi uchun chat yaratildi! Obunachilarga xush kelibsiz.`,
                },
            });
            console.log(`✅ Auto-created chat for course: ${course.title}`);
        } catch (chatError) {
            console.error('Failed to auto-create course chat:', chatError);
            // Non-critical — don't fail course creation
        }

        // Revalidate public pages
        revalidatePath('/[lang]/courses', 'page');
        revalidatePath('/[lang]/', 'page');

        return NextResponse.json({ success: true, course }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating course:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
