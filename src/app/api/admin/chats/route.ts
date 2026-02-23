/**
 * Admin Course Chat API
 * POST /api/admin/chats/send — Send message from admin
 * GET  /api/admin/chats/messages?courseId=xxx — Get messages for a course
 * GET  /api/admin/chats/courses — Get courses with recent chats
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function getAdminId(): Promise<string | null> {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')?.value
    if (!adminSession) return null
    const decoded = verifyToken(adminSession) as any
    return decoded?.id || null
}

export async function GET(request: NextRequest) {
    const adminId = await getAdminId()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const action = request.nextUrl.searchParams.get('action')

    if (action === 'courses') {
        // Get courses with their latest chat message
        const courses = await prisma.course.findMany({
            where: {
                courseChats: { some: {} },
            },
            select: {
                id: true,
                title: true,
                coverImage: true,
                courseChats: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        message: true,
                        createdAt: true,
                        senderRole: true,
                        user: { select: { firstName: true, lastName: true } },
                    },
                },
                _count: {
                    select: { courseChats: true },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        return NextResponse.json(
            courses.map((c) => ({
                id: c.id,
                title: c.title,
                coverImage: c.coverImage,
                totalMessages: c._count.courseChats,
                lastMessage: c.courseChats[0] || null,
            }))
        )
    }

    if (action === 'messages') {
        const courseId = request.nextUrl.searchParams.get('courseId')
        if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

        const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
        const limit = 50

        const [messages, total] = await Promise.all([
            prisma.courseChat.findMany({
                where: { courseId },
                orderBy: { createdAt: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    message: true,
                    senderRole: true,
                    attachmentUrl: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            telegramUsername: true,
                            telegramPhotoUrl: true,
                        },
                    },
                },
            }),
            prisma.courseChat.count({ where: { courseId } }),
        ])

        return NextResponse.json({ messages, total, page, pages: Math.ceil(total / limit) })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(request: NextRequest) {
    const adminId = await getAdminId()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { courseId, message, attachmentUrl } = await request.json()
    if (!courseId || !message) {
        return NextResponse.json({ error: 'courseId and message required' }, { status: 400 })
    }

    const chat = await prisma.courseChat.create({
        data: {
            courseId,
            userId: adminId,
            message,
            senderRole: 'ADMIN',
            attachmentUrl: attachmentUrl || null,
        },
        select: {
            id: true,
            message: true,
            senderRole: true,
            attachmentUrl: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    })

    return NextResponse.json(chat)
}
