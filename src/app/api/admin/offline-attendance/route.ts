import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function getAdmin() {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')?.value
    if (!session) return null
    return verifyToken(session)
}

// GET - List sessions + attendances for a course
export async function GET(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const action = searchParams.get('action')

    if (action === 'courses') {
        // Return only OFFLINE courses
        const courses = await prisma.course.findMany({
            where: { type: 'OFFLINE', isActive: true },
            select: { id: true, title: true, titleRu: true, schedule: true, location: true },
            orderBy: { title: 'asc' },
        })
        return NextResponse.json(courses)
    }

    if (action === 'users' && courseId) {
        // Return users subscribed to this offline course
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { subscriptions: { some: { courseId, status: 'ACTIVE' } } },
                    { purchases: { some: { courseId, status: 'APPROVED' } } },
                ],
            },
            select: { id: true, firstName: true, lastName: true, phone: true, telegramUsername: true },
            orderBy: { firstName: 'asc' },
        })
        return NextResponse.json(users)
    }

    if (!courseId) {
        return NextResponse.json({ error: 'courseId required' }, { status: 400 })
    }

    // List sessions with attendances
    const sessions = await prisma.offlineSession.findMany({
        where: { courseId },
        include: {
            attendances: {
                include: { user: { select: { id: true, firstName: true, lastName: true } } },
            },
        },
        orderBy: { date: 'desc' },
    })

    return NextResponse.json(sessions)
}

// POST - Create session or mark attendance
export async function POST(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action } = body

    if (action === 'create-session') {
        const { courseId, date, title, notes } = body
        if (!courseId || !date) {
            return NextResponse.json({ error: 'courseId and date required' }, { status: 400 })
        }
        const session = await prisma.offlineSession.create({
            data: { courseId, date: new Date(date), title, notes },
        })
        return NextResponse.json(session)
    }

    if (action === 'mark-attendance') {
        const { sessionId, attendances } = body
        // attendances: [{ userId, status, note }]
        if (!sessionId || !attendances?.length) {
            return NextResponse.json({ error: 'sessionId and attendances required' }, { status: 400 })
        }

        const results = []
        for (const att of attendances) {
            const result = await prisma.offlineAttendance.upsert({
                where: { sessionId_userId: { sessionId, userId: att.userId } },
                update: { status: att.status, note: att.note || null },
                create: { sessionId, userId: att.userId, status: att.status, note: att.note || null },
            })
            results.push(result)
        }
        return NextResponse.json({ success: true, count: results.length })
    }

    if (action === 'bulk-mark') {
        const { sessionId, userIds, status } = body
        if (!sessionId || !userIds?.length || !status) {
            return NextResponse.json({ error: 'sessionId, userIds, and status required' }, { status: 400 })
        }
        const results = []
        for (const userId of userIds) {
            const result = await prisma.offlineAttendance.upsert({
                where: { sessionId_userId: { sessionId, userId } },
                update: { status },
                create: { sessionId, userId, status },
            })
            results.push(result)
        }
        return NextResponse.json({ success: true, count: results.length })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// PUT - Update session
export async function PUT(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { sessionId, title, notes, date } = body

    if (!sessionId) {
        return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    const session = await prisma.offlineSession.update({
        where: { id: sessionId },
        data: {
            ...(title !== undefined && { title }),
            ...(notes !== undefined && { notes }),
            ...(date && { date: new Date(date) }),
        },
    })

    return NextResponse.json(session)
}

// DELETE - Delete session
export async function DELETE(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
        return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    await prisma.offlineSession.delete({ where: { id: sessionId } })
    return NextResponse.json({ success: true })
}
