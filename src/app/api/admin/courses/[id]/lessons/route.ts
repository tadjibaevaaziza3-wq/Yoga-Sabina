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
                title: body.title,
                description: body.description,
                videoUrl: body.videoUrl,
                duration: body.duration,
                isFree: body.isFree || false,
                order: body.order || newOrder,
                content: body.content,
                assets: {
                    create: body.assets?.map((a: any) => ({
                        type: a.type,
                        name: a.name,
                        url: a.url,
                        size: a.size
                    }))
                }
            },
            include: { assets: true }
        })

        return NextResponse.json({ success: true, lesson })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
