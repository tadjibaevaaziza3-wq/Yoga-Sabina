import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { userId, lessonId } = await request.json()

        if (!userId || !lessonId) {
            return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 })
        }

        // Check if goal like already exists
        const existingLike = await (prisma as any).like.findUnique({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId
                }
            }
        })

        if (existingLike) {
            // Unlike
            await (prisma as any).like.delete({
                where: { id: existingLike.id }
            })
            return NextResponse.json({ success: true, liked: false })
        } else {
            // Like
            await (prisma as any).like.create({
                data: {
                    userId,
                    lessonId
                }
            })
            return NextResponse.json({ success: true, liked: true })
        }
    } catch (error: any) {
        console.error('Like error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')
    const userId = searchParams.get('userId')

    if (!lessonId) {
        return NextResponse.json({ success: false, error: 'Missing lessonId' }, { status: 400 })
    }

    const count = await (prisma as any).like.count({
        where: { lessonId }
    })

    let isLiked = false
    if (userId) {
        const like = await (prisma as any).like.findUnique({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId
                }
            }
        })
        isLiked = !!like
    }

    return NextResponse.json({ success: true, count, isLiked })
}
