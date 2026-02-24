import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

// GET /api/admin/courses/[id]/modules — fetch all modules with lessons
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const modules = await prisma.module.findMany({
            where: { courseId: id },
            include: {
                lessons: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        titleRu: true,
                        description: true,
                        descriptionRu: true,
                        order: true,
                        duration: true,
                        isFree: true,
                        videoUrl: true,
                        audioUrl: true,
                        thumbnailUrl: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(modules);
    } catch (error: any) {
        console.error('Error fetching modules:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/admin/courses/[id]/modules — create a module
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    try {
        const module = await prisma.module.create({
            data: {
                courseId: id,
                title: body.title,
                titleRu: body.titleRu || null,
                description: body.description || null,
                order: body.order ?? 0,
            },
        });
        return NextResponse.json(module, { status: 201 });
    } catch (error: any) {
        console.error('Error creating module:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/admin/courses/[id]/modules — update a module
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    try {
        const module = await prisma.module.update({
            where: { id: body.id },
            data: {
                title: body.title,
                titleRu: body.titleRu || null,
                description: body.description || null,
            },
        });
        return NextResponse.json(module);
    } catch (error: any) {
        console.error('Error updating module:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/courses/[id]/modules?moduleId=xxx — delete a module
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const moduleId = url.searchParams.get('moduleId');

    if (!moduleId) {
        return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });
    }

    try {
        await prisma.lesson.deleteMany({ where: { moduleId } });
        await prisma.module.delete({ where: { id: moduleId } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting module:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
