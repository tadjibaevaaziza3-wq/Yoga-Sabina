import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function getUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    return verifyToken(token)
}

// GET: Fetch chat messages for a course (subscribers only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { courseId } = await params

    // Check subscription/purchase
    const access = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            role: true,
            purchases: { where: { courseId, status: 'PAID' }, take: 1 },
            subscriptions: { where: { courseId, status: 'ACTIVE' }, take: 1 }
        }
    })

    if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const hasAccess = access.role === 'ADMIN' || access.purchases.length > 0 || access.subscriptions.length > 0
    if (!hasAccess) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const take = 50

    const messages = await prisma.courseChat.findMany({
        where: { courseId },
        orderBy: { createdAt: 'desc' },
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    telegramPhotoUrl: true
                }
            }
        }
    })

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true, titleRu: true, coverImage: true }
    })

    return NextResponse.json({
        success: true,
        messages: messages.reverse(),
        course,
        hasMore: messages.length === take,
        nextCursor: messages.length === take ? messages[messages.length - 1]?.id : null
    })
}

// POST: Send a message in course chat
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { courseId } = await params

    // Check subscription
    const access = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            role: true,
            purchases: { where: { courseId, status: 'PAID' }, take: 1 },
            subscriptions: { where: { courseId, status: 'ACTIVE' }, take: 1 }
        }
    })

    if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const hasAccess = access.role === 'ADMIN' || access.purchases.length > 0 || access.subscriptions.length > 0
    if (!hasAccess) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

    const { message } = await request.json()
    if (!message?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

    const chatMessage = await prisma.courseChat.create({
        data: {
            courseId,
            userId,
            message: message.trim()
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    telegramPhotoUrl: true
                }
            }
        }
    })

    return NextResponse.json({ success: true, message: chatMessage })
}
