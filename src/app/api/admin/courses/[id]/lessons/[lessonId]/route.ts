import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

// PUT /api/admin/courses/[id]/lessons/[lessonId]
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        const { id, lessonId } = await params
        const body = await req.json()

        const lesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: {
                title: body.title,
                description: body.description,
                videoUrl: body.videoUrl,
                duration: body.duration,
                isFree: body.isFree,
                order: body.order,
                content: body.content,
                assets: {
                    deleteMany: {}, // Simplest approach: delete all and recreate. 
                    // Better approach would be diffing or separate Asset API.
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

// DELETE /api/admin/courses/[id]/lessons/[lessonId]
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
    try {
        const { lessonId } = await params
        await prisma.lesson.delete({
            where: { id: lessonId }
        })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
