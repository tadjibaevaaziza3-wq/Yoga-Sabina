/**
 * Admin Course Chat API
 * POST /api/admin/chats/send — Send message from admin
 * GET  /api/admin/chats/messages?courseId=xxx — Get messages for a course
 * GET  /api/admin/chats/courses — Get courses with recent chats
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromSession } from '@/lib/auth/admin-auth'

export async function GET(request: NextRequest) {
    const admin = await getAdminFromSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const action = request.nextUrl.searchParams.get('action')

    if (action === 'courses') {
        // Get courses with their latest chat message
        const courses = await prisma.course.findMany({
            where: { isActive: true },
            select: {
                id: true,
                title: true,
                coverImage: true,
                courseChats: {
                    where: { isDeleted: false },
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
                    select: { courseChats: { where: { isDeleted: false } } },
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
                where: { courseId, isDeleted: false },
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
            prisma.courseChat.count({ where: { courseId, isDeleted: false } }),
        ])

        return NextResponse.json({ messages, total, page, pages: Math.ceil(total / limit) })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(request: NextRequest) {
    const admin = await getAdminFromSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { courseId, message, attachmentUrl } = await request.json()
    if (!courseId || !message) {
        return NextResponse.json({ error: 'courseId and message required' }, { status: 400 })
    }

    // CourseChat.userId references User table, not AdminUser table.
    // Find or create a User record for this admin to send chat messages.
    let senderUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: admin.email || undefined },
                { firstName: admin.displayName, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
            ],
        },
        select: { id: true },
    })

    if (!senderUser) {
        // Create a User record for this admin
        senderUser = await prisma.user.create({
            data: {
                firstName: admin.displayName || admin.username,
                email: admin.email || `${admin.username}@admin.local`,
                role: 'ADMIN',
                phone: '',
                registrationSource: 'WEB',
            },
            select: { id: true },
        })
    }

    const chat = await prisma.courseChat.create({
        data: {
            courseId,
            userId: senderUser.id,
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

export async function DELETE(request: NextRequest) {
    const admin = await getAdminFromSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const messageId = request.nextUrl.searchParams.get('messageId')
    if (!messageId) {
        return NextResponse.json({ error: 'messageId required' }, { status: 400 })
    }

    await prisma.courseChat.update({
        where: { id: messageId },
        data: { isDeleted: true },
    })

    return NextResponse.json({ success: true })
}
