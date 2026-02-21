/**
 * User Notification API
 * 
 * GET    /api/user/notifications - Get user's notifications (paginated)
 * PATCH  /api/user/notifications - Mark notifications as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLocalUser } from '@/lib/auth/server'

/**
 * GET /api/user/notifications
 * Returns user's notifications, newest first
 */
export async function GET(request: NextRequest) {
    const user = await getLocalUser()
    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const cursor = searchParams.get('cursor') || undefined

    const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasMore = notifications.length > limit
    if (hasMore) notifications.pop()

    const unreadCount = await prisma.notification.count({
        where: { userId: user.id, isRead: false },
    })

    return NextResponse.json({
        success: true,
        notifications,
        unreadCount,
        hasMore,
        nextCursor: hasMore ? notifications[notifications.length - 1]?.id : null,
    })
}

/**
 * PATCH /api/user/notifications
 * Mark notifications as read
 * Body: { ids: string[] } or { all: true }
 */
export async function PATCH(request: NextRequest) {
    const user = await getLocalUser()
    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (body.all) {
        await prisma.notification.updateMany({
            where: { userId: user.id, isRead: false },
            data: { isRead: true },
        })
    } else if (Array.isArray(body.ids) && body.ids.length > 0) {
        await prisma.notification.updateMany({
            where: {
                id: { in: body.ids },
                userId: user.id,
            },
            data: { isRead: true },
        })
    }

    const unreadCount = await prisma.notification.count({
        where: { userId: user.id, isRead: false },
    })

    return NextResponse.json({ success: true, unreadCount })
}
