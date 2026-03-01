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

// ─── Parse schedule string to day-of-week numbers ───
function parseScheduleDays(schedule: string | null): number[] {
    if (!schedule) return []
    const dayMap: Record<string, number> = {
        'du': 1, 'dush': 1, 'dushanba': 1, 'душанба': 1, 'ду': 1,
        'se': 2, 'sesh': 2, 'seshanba': 2, 'сешанба': 2,
        'chor': 3, 'chorshanba': 3, 'чоршанба': 3, 'чор': 3,
        'pay': 4, 'payshanba': 4, 'пайшанба': 4,
        'ju': 5, 'juma': 5, 'жума': 5,
        'sha': 6, 'shanba': 6, 'шанба': 6,
        'yak': 0, 'yakshanba': 0, 'якшанба': 0,
        'пн': 1, 'понедельник': 1, 'вт': 2, 'вторник': 2,
        'ср': 3, 'среда': 3, 'чт': 4, 'четверг': 4,
        'пт': 5, 'пятница': 5, 'сб': 6, 'суббота': 6,
        'вс': 0, 'воскресенье': 0,
        'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6, 'sun': 0,
    }
    const parts = schedule.toLowerCase().split(/[\/,\s\-]+/).filter(Boolean)
    const days: number[] = []
    parts.forEach(p => { if (dayMap[p] !== undefined) days.push(dayMap[p]) })
    return [...new Set(days)]
}

// ─── Generate dates for a month matching specific day-of-week numbers ───
function getMonthDates(year: number, month: number, dayNumbers: number[]): Date[] {
    const dates: Date[] = []
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d, 12) // noon to avoid TZ issues
        if (dayNumbers.includes(date.getDay())) dates.push(date)
    }
    return dates
}

// ─── GET ───
export async function GET(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const action = searchParams.get('action')
    const month = searchParams.get('month') // YYYY-MM

    // List offline courses
    if (action === 'courses') {
        const courses = await prisma.course.findMany({
            where: { type: 'OFFLINE', isActive: true },
            select: { id: true, title: true, titleRu: true, schedule: true, times: true, location: true },
            orderBy: { title: 'asc' },
        })
        return NextResponse.json(courses)
    }

    // ─── GET FULL DAVOMAT DATA (time-slot grouped) ───
    if (action === 'davomat' && courseId && month) {
        const [y, m] = month.split('-').map(Number)
        const monthStart = new Date(y, m - 1, 1)
        const monthEnd = new Date(y, m, 0, 23, 59, 59)

        // 1. Get course schedule
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { schedule: true, times: true },
        })
        const scheduleDays = parseScheduleDays(course?.schedule || '')
        // Parse time slots from course.times (e.g. "10:00, 11:00, 14:00")
        const courseTimeSlots = (course?.times || '')
            .split(/[,;\/]+/)
            .map(t => t.replace(/\s*-\s*\d{1,2}:\d{2}/, '').trim()) // "10:00 - 11:00" → "10:00"
            .filter(t => /^\d{1,2}:\d{2}$/.test(t))
        const timeSlots = courseTimeSlots.length > 0 ? courseTimeSlots : ['default']

        // 2. Get subscribed users grouped by timeSlot
        const subscriptions = await prisma.subscription.findMany({
            where: {
                courseId,
                status: { in: ['ACTIVE', 'EXPIRED'] },
            },
            select: {
                userId: true, timeSlot: true, startsAt: true, endsAt: true, status: true,
                user: { select: { id: true, firstName: true, lastName: true, phone: true, telegramUsername: true } },
            },
            orderBy: { user: { firstName: 'asc' } },
        })
        // Also get purchases without subscriptions
        const purchases = await prisma.purchase.findMany({
            where: {
                courseId,
                status: 'PAID',
                user: { subscriptions: { none: { courseId } } },
            },
            select: {
                userId: true, createdAt: true,
                user: { select: { id: true, firstName: true, lastName: true, phone: true, telegramUsername: true } },
            },
        })

        // 3. Auto-generate sessions for this month if schedule exists
        if (scheduleDays.length > 0) {
            const monthDates = getMonthDates(y, m - 1, scheduleDays)
            const existingSessions = await prisma.offlineSession.findMany({
                where: { courseId, date: { gte: monthStart, lte: monthEnd } },
                select: { date: true, timeSlot: true },
            })

            for (const ts of timeSlots) {
                const tsVal = ts === 'default' ? null : ts
                for (const date of monthDates) {
                    const dateStr = date.toISOString().split('T')[0]
                    const exists = existingSessions.some(s =>
                        s.date.toISOString().split('T')[0] === dateStr &&
                        (s.timeSlot || null) === tsVal
                    )
                    if (!exists) {
                        await prisma.offlineSession.create({
                            data: { courseId, date, timeSlot: tsVal },
                        })
                    }
                }
            }
        }

        // 4. Fetch sessions with attendances
        const sessions = await prisma.offlineSession.findMany({
            where: { courseId, date: { gte: monthStart, lte: monthEnd } },
            include: {
                attendances: { select: { userId: true, status: true } },
            },
            orderBy: { date: 'asc' },
        })

        // 5. Group by timeSlot
        const result: Record<string, {
            timeSlot: string
            sessions: typeof sessions
            users: { id: string; firstName: string | null; lastName: string | null; phone: string | null; telegramUsername?: string | null; isExpired: boolean; subscriptionEnd: string | null }[]
        }> = {}

        const now = new Date()
        for (const ts of timeSlots) {
            const tsKey = ts === 'default' ? 'default' : ts
            const tsVal = ts === 'default' ? null : ts

            // Filter sessions for this timeSlot
            const tsSessions = sessions.filter(s => (s.timeSlot || null) === tsVal)

            // Filter users for this timeSlot
            const tsUsers: typeof result[string]['users'] = []
            const seenUserIds = new Set<string>()

            for (const sub of subscriptions) {
                const userTs = sub.timeSlot || (timeSlots.length === 1 ? ts : null)
                if (timeSlots.length > 1 && userTs !== ts) continue
                if (seenUserIds.has(sub.userId)) continue
                seenUserIds.add(sub.userId)
                tsUsers.push({
                    id: sub.user.id,
                    firstName: sub.user.firstName,
                    lastName: sub.user.lastName,
                    phone: sub.user.phone,
                    telegramUsername: sub.user.telegramUsername || null,
                    isExpired: sub.status === 'EXPIRED' || new Date(sub.endsAt) < now,
                    subscriptionEnd: sub.endsAt.toISOString(),
                })
            }
            // Add purchased users (no subscription)
            for (const pur of purchases) {
                if (seenUserIds.has(pur.userId)) continue
                seenUserIds.add(pur.userId)
                tsUsers.push({
                    id: pur.user.id,
                    firstName: pur.user.firstName,
                    lastName: pur.user.lastName,
                    phone: pur.user.phone,
                    telegramUsername: pur.user.telegramUsername || null,
                    isExpired: false,
                    subscriptionEnd: null,
                })
            }

            if (tsSessions.length > 0 || tsUsers.length > 0) {
                result[tsKey] = { timeSlot: tsKey, sessions: tsSessions, users: tsUsers }
            }
        }

        return NextResponse.json({
            schedule: course?.schedule || '',
            times: course?.times || '',
            timeSlots,
            groups: result,
        })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

// ─── POST ───
export async function POST(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action } = body

    // Update course schedule + time slots
    if (action === 'update-schedule') {
        const { courseId, schedule, times } = body
        if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })
        await prisma.course.update({
            where: { id: courseId },
            data: { ...(schedule !== undefined && { schedule }), ...(times !== undefined && { times }) },
        })
        return NextResponse.json({ success: true })
    }

    // Mark single attendance
    if (action === 'mark-attendance') {
        const { sessionId, userId, status } = body
        if (!sessionId || !userId || !status) {
            return NextResponse.json({ error: 'sessionId, userId, status required' }, { status: 400 })
        }
        await prisma.offlineAttendance.upsert({
            where: { sessionId_userId: { sessionId, userId } },
            update: { status },
            create: { sessionId, userId, status },
        })
        return NextResponse.json({ success: true })
    }

    // Bulk mark all users for a session
    if (action === 'bulk-mark') {
        const { sessionId, userIds, status } = body
        if (!sessionId || !userIds?.length || !status) {
            return NextResponse.json({ error: 'sessionId, userIds, status required' }, { status: 400 })
        }
        for (const userId of userIds) {
            await prisma.offlineAttendance.upsert({
                where: { sessionId_userId: { sessionId, userId } },
                update: { status },
                create: { sessionId, userId, status },
            })
        }
        return NextResponse.json({ success: true, count: userIds.length })
    }

    // Add time slot to course
    if (action === 'add-timeslot') {
        const { courseId, newTime } = body
        if (!courseId || !newTime) return NextResponse.json({ error: 'courseId and newTime required' }, { status: 400 })
        const course = await prisma.course.findUnique({ where: { id: courseId }, select: { times: true } })
        const existing = (course?.times || '').split(/[,;]+/).map(t => t.trim()).filter(Boolean)
        if (!existing.includes(newTime)) existing.push(newTime)
        await prisma.course.update({ where: { id: courseId }, data: { times: existing.join(', ') } })
        return NextResponse.json({ success: true, times: existing.join(', ') })
    }

    // Remove time slot
    if (action === 'remove-timeslot') {
        const { courseId, removeTime } = body
        if (!courseId || !removeTime) return NextResponse.json({ error: 'courseId and removeTime required' }, { status: 400 })
        const course = await prisma.course.findUnique({ where: { id: courseId }, select: { times: true } })
        const existing = (course?.times || '').split(/[,;]+/).map(t => t.trim()).filter(t => t && t !== removeTime)
        await prisma.course.update({ where: { id: courseId }, data: { times: existing.join(', ') || null } })
        return NextResponse.json({ success: true, times: existing.join(', ') })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// ─── PUT ───
export async function PUT(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { sessionId, title, notes, date } = body
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    const session = await prisma.offlineSession.update({
        where: { id: sessionId },
        data: { ...(title !== undefined && { title }), ...(notes !== undefined && { notes }), ...(date && { date: new Date(date) }) },
    })
    return NextResponse.json(session)
}

// ─── DELETE ───
export async function DELETE(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    await prisma.offlineSession.delete({ where: { id: sessionId } })
    return NextResponse.json({ success: true })
}
