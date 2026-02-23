import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLocalUser } from '@/lib/auth/server'

// GET - Fetch comments for a lesson
export async function GET(
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params
        const user = await getLocalUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch comments with user info and replies
        const comments = await prisma.videoComment.findMany({
            where: {
                lessonId,
                parentId: null // Only top-level comments
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50 // Pagination
        })

        return NextResponse.json({ success: true, comments })
    } catch (error: any) {
        console.error('Error fetching comments:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - Add a comment
export async function POST(
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params
        const body = await req.json()
        const { comment, timestamp, parentId } = body

        if (!comment || comment.trim().length === 0) {
            return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })
        }

        const user = await getLocalUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user has access to this lesson (via subscription)
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { course: true }
        })

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
        }

        const [subscription, purchase] = await Promise.all([
            prisma.subscription.findFirst({
                where: {
                    userId: user.id,
                    courseId: lesson.courseId,
                    status: 'ACTIVE',
                    endsAt: { gt: new Date() }
                }
            }),
            prisma.purchase.findFirst({
                where: {
                    userId: user.id,
                    courseId: lesson.courseId,
                    status: 'PAID'
                }
            })
        ])

        if (!subscription && !purchase && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'No active subscription or purchase' }, { status: 403 })
        }

        // Create comment
        const videoComment = await prisma.videoComment.create({
            data: {
                lessonId,
                userId: user.id,
                comment: comment.trim(),
                timestamp: timestamp || null,
                parentId: parentId || null
            },
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

        return NextResponse.json({ success: true, comment: videoComment })
    } catch (error: any) {
        console.error('Error adding comment:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
