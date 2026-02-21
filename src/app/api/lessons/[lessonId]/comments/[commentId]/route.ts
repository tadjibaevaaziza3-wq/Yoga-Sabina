import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'

// PUT - Edit own comment
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ lessonId: string; commentId: string }> }
) {
    try {
        const { commentId } = await params
        const body = await req.json()
        const { comment } = body

        if (!comment || comment.trim().length === 0) {
            return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })
        }

        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if comment exists and belongs to user
        const existingComment = await prisma.videoComment.findUnique({
            where: { id: commentId }
        })

        if (!existingComment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
        }

        if (existingComment.userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Update comment
        const updatedComment = await prisma.videoComment.update({
            where: { id: commentId },
            data: { comment: comment.trim() },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        return NextResponse.json({ success: true, comment: updatedComment })
    } catch (error: any) {
        console.error('Error updating comment:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE - Delete own comment
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ lessonId: string; commentId: string }> }
) {
    try {
        const { commentId } = await params
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if comment exists and belongs to user
        const comment = await prisma.videoComment.findUnique({
            where: { id: commentId }
        })

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
        }

        // Allow user to delete own comments, or admin to delete any
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (comment.userId !== user.id && dbUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Delete comment (cascades to replies)
        await prisma.videoComment.delete({
            where: { id: commentId }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting comment:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
