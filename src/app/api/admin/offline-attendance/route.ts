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

// Helper: parse schedule string like "Du/Chor/Juma" or "Пн/Ср/Пт" to day-of-week numbers
function parseScheduleDays(schedule: string | null): number[] {
    if (!schedule) return []
    const dayMap: Record<string, number> = {
        // Uzbek (Latin)
        'du': 1, 'dush': 1, 'dushanba': 1,
        'se': 2, 'sesh': 2, 'seshanba': 2,
        'chor': 3, 'chorshanba': 3, 'cho': 3,
        'pay': 4, 'payshanba': 4,
        'ju': 5, 'juma': 5,
        'sha': 6, 'shanba': 6,
        'yak': 0, 'yakshanba': 0,
        // Uzbek (Cyrillic)
        'душанба': 1, 'ду': 1, 'душ': 1,
        'сешанба': 2, 'се': 2, 'сеш': 2,
        'чоршанба': 3, 'чор': 3,
        'пайшанба': 4, 'пай': 4,
        'жума': 5, 'жу': 5,
        'шанба': 6,
        'якшанба': 0, 'як': 0,
        // Russian
        'пн': 1, 'понедельник': 1,
        'вт': 2, 'вторник': 2,
        'ср': 3, 'среда': 3,
        'чт': 4, 'четверг': 4,
        'пт': 5, 'пятница': 5,
        'сб': 6, 'суббота': 6,
        'вс': 0, 'воскресенье': 0,
        // English shortcuts
        'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6, 'sun': 0,
    }
    const parts = schedule.toLowerCase().split(/[\/,\s\-]+/).map(s => s.trim()).filter(Boolean)
    const days: number[] = []
    for (const part of parts) {
        if (dayMap[part] !== undefined) days.push(dayMap[part])
    }
    return [...new Set(days)]
}

// Helper: get all dates in a month that match given day-of-week numbers
function getMonthDates(year: number, month: number, dayNumbers: number[]): Date[] {
    const dates: Date[] = []
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d)
        if (dayNumbers.includes(date.getDay())) {
            dates.push(date)
        }
    }
    return dates
}

// GET - List sessions + attendances for a course
export async function GET(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const action = searchParams.get('action')
    const month = searchParams.get('month') // format: YYYY-MM

    if (action === 'courses') {
        const courses = await prisma.course.findMany({
            where: { type: 'OFFLINE', isActive: true },
            select: { id: true, title: true, titleRu: true, schedule: true, scheduleRu: true, times: true, timesRu: true, location: true, locationRu: true },
            orderBy: { title: 'asc' },
        })
        return NextResponse.json(courses)
    }

    if (action === 'users' && courseId) {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { subscriptions: { some: { courseId, status: 'ACTIVE' } } },
                    { purchases: { some: { courseId, status: { in: ['APPROVED', 'PAID'] } } } },
                ],
            },
            select: {
                id: true, firstName: true, lastName: true, phone: true, telegramUsername: true,
                subscriptions: {
                    where: { courseId },
                    select: { id: true, status: true, startsAt: true, endsAt: true },
                    orderBy: { startsAt: 'desc' as const },
                    take: 1,
                },
                purchases: {
                    where: { courseId, status: { in: ['APPROVED', 'PAID'] } },
                    select: { id: true, status: true, createdAt: true, amount: true },
                    orderBy: { createdAt: 'desc' as const },
                    take: 1,
                },
            },
            orderBy: { firstName: 'asc' },
        })
        const now = new Date()
        const enriched = users.map(u => {
            const sub = u.subscriptions[0]
            const purchase = u.purchases[0]
            const isExpired = sub ? new Date(sub.endsAt) < now : false
            return {
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                phone: u.phone,
                telegramUsername: u.telegramUsername,
                subscriptionStart: sub?.startsAt || purchase?.createdAt || null,
                subscriptionEnd: sub?.endsAt || null,
                isExpired,
                purchaseAmount: purchase?.amount ? Number(purchase.amount) : null,
            }
        })
        return NextResponse.json(enriched)
    }

    if (!courseId) {
        return NextResponse.json({ error: 'courseId required' }, { status: 400 })
    }

    // Filter sessions by month if provided
    let dateFilter: any = { courseId }
    if (month) {
        const [y, m] = month.split('-').map(Number)
        const start = new Date(y, m - 1, 1)
        const end = new Date(y, m, 0, 23, 59, 59)
        dateFilter = { courseId, date: { gte: start, lte: end } }
    }

    const sessions = await prisma.offlineSession.findMany({
        where: dateFilter,
        include: {
            attendances: {
                include: { user: { select: { id: true, firstName: true, lastName: true } } },
            },
        },
        orderBy: { date: 'asc' },
    })

    return NextResponse.json(sessions)
}

// POST - Create session, mark attendance, or generate month
export async function POST(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action } = body

    // Auto-generate sessions for a month based on course schedule
    if (action === 'generate-month') {
        const { courseId, month } = body // month: "YYYY-MM"
        if (!courseId || !month) {
            return NextResponse.json({ error: 'courseId and month required' }, { status: 400 })
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { schedule: true, times: true },
        })
        if (!course?.schedule) {
            return NextResponse.json({ error: 'Course has no schedule set' }, { status: 400 })
        }

        const [year, mon] = month.split('-').map(Number)
        const scheduleDays = parseScheduleDays(course.schedule)
        if (scheduleDays.length === 0) {
            return NextResponse.json({ error: 'Could not parse schedule days' }, { status: 400 })
        }

        const monthDates = getMonthDates(year, mon - 1, scheduleDays)

        // Get existing sessions for this month
        const start = new Date(year, mon - 1, 1)
        const end = new Date(year, mon, 0, 23, 59, 59)
        const existing = await prisma.offlineSession.findMany({
            where: { courseId, date: { gte: start, lte: end } },
            select: { date: true },
        })
        const existingDates = new Set(existing.map(s => s.date.toISOString().split('T')[0]))

        // Create missing sessions
        let created = 0
        for (const date of monthDates) {
            const dateStr = date.toISOString().split('T')[0]
            if (!existingDates.has(dateStr)) {
                const dayName = date.toLocaleDateString('uz-UZ', { weekday: 'long' })
                await prisma.offlineSession.create({
                    data: {
                        courseId,
                        date,
                        title: course.times ? `${dayName} · ${course.times}` : dayName,
                    },
                })
                created++
            }
        }

        return NextResponse.json({ success: true, created, total: monthDates.length })
    }

    if (action === 'update-schedule') {
        const { courseId, schedule, times } = body
        if (!courseId) {
            return NextResponse.json({ error: 'courseId required' }, { status: 400 })
        }
        await prisma.course.update({
            where: { id: courseId },
            data: {
                ...(schedule !== undefined && { schedule }),
                ...(times !== undefined && { times }),
            },
        })
        return NextResponse.json({ success: true })
    }

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

// PUT - Update session or course schedule
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
