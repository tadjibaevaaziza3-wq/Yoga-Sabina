import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'

// POST - Like/unlike a comment
export async function POST(
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

        // Check if comment exists
        const comment = await prisma.videoComment.findUnique({
            where: { id: commentId }
        })

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
        }

        // Toggle like (increment or decrement)
        // For simplicity, we'll just increment. In production, track individual likes
        const updatedComment = await prisma.videoComment.update({
            where: { id: commentId },
            data: {
                likes: { increment: 1 }
            }
        })

        return NextResponse.json({ success: true, likes: updatedComment.likes })
    } catch (error: any) {
        console.error('Error liking comment:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
