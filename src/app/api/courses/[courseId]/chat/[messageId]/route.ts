import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'

// DELETE - Delete own chat message
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ courseId: string; messageId: string }> }
) {
    try {
        const { courseId, messageId } = await params
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if message exists and belongs to user
        const message = await prisma.courseChat.findUnique({
            where: { id: messageId }
        })

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 })
        }

        if (message.userId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Delete message
        await prisma.courseChat.delete({
            where: { id: messageId }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting chat message:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
