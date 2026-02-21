/**
 * API Routes for Individual Lesson Management (Admin Only)
 * 
 * PUT    /api/admin/lessons/[id] - Update lesson
 * DELETE /api/admin/lessons/[id] - Delete lesson
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth/server';

const lessonUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    videoUrl: z.string().url().optional(),
    duration: z.number().int().positive().optional(),
    isFree: z.boolean().optional(),
    order: z.number().int().nonnegative().optional(),
    content: z.string().optional(),
});

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

/**
 * PUT /api/admin/lessons/[id]
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
        const validation = lessonUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request', details: validation.error.issues },
                { status: 400 }
            );
        }

        const lesson = await prisma.lesson.update({
            where: { id },
            data: validation.data,
            include: {
                assets: true,
            },
        });

        return NextResponse.json({ success: true, lesson });

    } catch (error: any) {
        console.error('Error updating lesson:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Lesson not found' },
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
 * DELETE /api/admin/lessons/[id]
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

        await prisma.lesson.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Lesson deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting lesson:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Lesson not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
