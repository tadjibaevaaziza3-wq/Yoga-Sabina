/**
 * Admin Notification API
 * 
 * POST /api/admin/notifications — Send notification to user(s)
 * Body: { userIds: string[] | 'all', title, titleRu?, message, messageRu?, type?, link? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')?.value
    if (!adminSession) return false
    return !!verifyToken(adminSession)
}

export async function POST(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userIds, title, titleRu, message, messageRu, type = 'info', link } = body

    if (!title || !message) {
        return NextResponse.json({ success: false, error: 'Title and message are required' }, { status: 400 })
    }

    let targetUserIds: string[]

    if (userIds === 'all') {
        const users = await prisma.user.findMany({ select: { id: true } })
        targetUserIds = users.map(u => u.id)
    } else if (Array.isArray(userIds) && userIds.length > 0) {
        targetUserIds = userIds
    } else {
        return NextResponse.json({ success: false, error: 'userIds must be "all" or an array of user IDs' }, { status: 400 })
    }

    const data = targetUserIds.map(userId => ({
        userId,
        title,
        titleRu: titleRu || null,
        message,
        messageRu: messageRu || null,
        type,
        link: link || null,
    }))

    const result = await prisma.notification.createMany({ data })

    return NextResponse.json({
        success: true,
        sent: result.count,
    })
}
