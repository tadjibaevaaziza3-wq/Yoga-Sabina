import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // 1. Fetch lessons with like and comment counts
        // In Prisma, we can use _count for relations
        const lessons = await (prisma as any).lesson.findMany({
            select: {
                id: true,
                title: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                likes: { _count: 'desc' }
            },
            take: 10 // Top 10 engaged lessons
        })

        const stats = lessons.map((l: any) => ({
            id: l.id,
            title: l.title,
            likes: l._count.likes,
            comments: l._count.comments
        }))

        return NextResponse.json({ success: true, stats })
    } catch (error: any) {
        console.error('Engagement Stats error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
