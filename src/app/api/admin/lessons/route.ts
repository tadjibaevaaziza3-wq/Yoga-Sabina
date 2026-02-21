/**
 * API Routes for Lesson Management (Admin Only)
 * 
 * POST   /api/admin/lessons - Create new lesson
 * PUT    /api/admin/lessons/[id] - Update lesson
 * DELETE /api/admin/lessons/[id] - Delete lesson
 * PUT    /api/admin/lessons/reorder - Reorder lessons
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth/server';
import { autoTranslateFields } from '@/lib/translate';

const lessonSchema = z.object({
    courseId: z.string().min(1),
    title: z.string().min(1),
    titleRu: z.string().optional(),
    description: z.string().optional(),
    descriptionRu: z.string().optional(),
    videoUrl: z.string().url().optional(),
    duration: z.number().int().positive().optional(),
    isFree: z.boolean().default(false),
    order: z.number().int().nonnegative(),
    content: z.string().optional(),
});

const lessonUpdateSchema = lessonSchema.partial().omit({ courseId: true });

const reorderSchema = z.object({
    lessons: z.array(z.object({
        id: z.string(),
        order: z.number().int().nonnegative(),
    })),
});

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

/**
 * POST /api/admin/lessons
 * Create new lesson with auto-translation
 */
export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validation = lessonSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request', details: validation.error.issues },
                { status: 400 }
            );
        }

        const data = validation.data;

        // ─── Auto-translate missing fields ───
        const translated = await autoTranslateFields(data as Record<string, any>, [
            ['title', 'titleRu'],
            ['description', 'descriptionRu'],
        ]);

        const lesson = await prisma.lesson.create({
            data: {
                ...data,
                titleRu: translated.titleRu || data.titleRu,
                descriptionRu: translated.descriptionRu || data.descriptionRu,
            },
            include: {
                assets: true,
            },
        });

        return NextResponse.json({ success: true, lesson }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating lesson:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
