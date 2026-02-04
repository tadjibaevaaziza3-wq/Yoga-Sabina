import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { userId, lessonId, text } = await request.json()

        if (!userId || !lessonId || !text) {
            return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 })
        }

        const comment = await (prisma as any).comment.create({
            data: {
                userId,
                lessonId,
                text
            },
            include: {
                user: {
                    select: {
                        name: true,
                        id: true
                    }
                }
            }
        })

        return NextResponse.json({ success: true, comment })
    } catch (error: any) {
        console.error('Comment error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
        return NextResponse.json({ success: false, error: 'Missing lessonId' }, { status: 400 })
    }

    const comments = await (prisma as any).comment.findMany({
        where: { lessonId },
        include: {
            user: {
                select: {
                    name: true,
                    id: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, comments })
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        // In a real app, verify admin session here
        if (!id) return NextResponse.json({ success: false }, { status: 400 })

        await (prisma as any).comment.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
