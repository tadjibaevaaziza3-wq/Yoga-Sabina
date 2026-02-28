import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

// GET /api/admin/courses/[id]/lessons
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        const { id } = await params
        const lessons = await prisma.lesson.findMany({
            where: { courseId: id },
            orderBy: { order: 'asc' },
            include: { assets: true }
        })
        return NextResponse.json({ success: true, lessons })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST /api/admin/courses/[id]/lessons
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        const { id } = await params
        const body = await req.json()

        // Get max order
        const lastLesson = await prisma.lesson.findFirst({
            where: { courseId: id },
            orderBy: { order: 'desc' }
        })
        const newOrder = (lastLesson?.order || 0) + 1

        const lesson = await prisma.lesson.create({
            data: {
                courseId: id,
                moduleId: body.moduleId || null,
                title: body.title,
                titleRu: body.titleRu || null,
                description: body.description || null,
                descriptionRu: body.descriptionRu || null,
                videoUrl: body.videoUrl || null,
                audioUrl: body.audioUrl || null,
                pdfUrl: body.pdfUrl || null,
                thumbnailUrl: body.thumbnailUrl || null,
                duration: body.duration || null,
                isFree: body.isFree || false,
                order: body.order || newOrder,
                content: body.content || null,
                searchKeywords: body.searchKeywords || null,
                assets: body.assets ? {
                    create: body.assets.map((a: any) => ({
                        type: a.type,
                        name: a.name,
                        url: a.url,
                        size: a.size
                    }))
                } : undefined
            },
            include: { assets: true }
        })

        return NextResponse.json({ success: true, lesson })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// PUT /api/admin/courses/[id]/lessons — update a lesson
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        const body = await req.json()

        const lesson = await prisma.lesson.update({
            where: { id: body.id },
            data: {
                title: body.title,
                titleRu: body.titleRu || null,
                description: body.description || null,
                descriptionRu: body.descriptionRu || null,
                videoUrl: body.videoUrl ?? undefined,
                audioUrl: body.audioUrl ?? undefined,
                pdfUrl: body.pdfUrl ?? undefined,
                thumbnailUrl: body.thumbnailUrl ?? undefined,
                duration: body.duration ?? undefined,
                isFree: body.isFree ?? false,
                content: body.content ?? undefined,
                searchKeywords: body.searchKeywords ?? undefined,
            },
        })

        return NextResponse.json({ success: true, lesson })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// DELETE /api/admin/courses/[id]/lessons?lessonId=xxx — delete a lesson
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        const url = new URL(req.url)
        const lessonId = url.searchParams.get('lessonId')

        if (!lessonId) {
            return NextResponse.json({ success: false, error: 'lessonId is required' }, { status: 400 })
        }

        await prisma.lesson.delete({ where: { id: lessonId } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
