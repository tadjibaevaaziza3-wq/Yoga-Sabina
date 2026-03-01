import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLocalUser } from '@/lib/auth/server'

// GET - User's offline attendance progress
export async function GET(request: NextRequest) {
    const user = await getLocalUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    // Get all offline courses the user is subscribed to
    const offlineCourses = await prisma.course.findMany({
        where: {
            type: 'OFFLINE',
            isActive: true,
            OR: [
                { subscriptions: { some: { userId: user.id, status: 'ACTIVE' } } },
                { purchases: { some: { userId: user.id, status: 'PAID' } } },
            ],
        },
        select: {
            id: true,
            title: true,
            titleRu: true,
            coverImage: true,
            location: true,
            locationRu: true,
            schedule: true,
            scheduleRu: true,
            times: true,
            timesRu: true,
        },
    })

    // Get attendance data for each course (or specific course)
    const courseIds = courseId ? [courseId] : offlineCourses.map(c => c.id)

    const sessions = await prisma.offlineSession.findMany({
        where: { courseId: { in: courseIds } },
        include: {
            attendances: {
                where: { userId: user.id },
                select: { status: true, note: true },
            },
        },
        orderBy: { date: 'asc' },
    })

    // Calculate stats per course
    const courseStats = courseIds.map(cId => {
        const courseSessions = sessions.filter(s => s.courseId === cId)
        const totalSessions = courseSessions.length
        const attended = courseSessions.filter(s =>
            s.attendances.length > 0 && (s.attendances[0].status === 'PRESENT' || s.attendances[0].status === 'LATE')
        ).length
        const missed = courseSessions.filter(s =>
            s.attendances.length > 0 && s.attendances[0].status === 'ABSENT'
        ).length
        const percentage = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0

        return {
            courseId: cId,
            totalSessions,
            attended,
            missed,
            excused: totalSessions - attended - missed,
            percentage,
            sessions: courseSessions.map(s => ({
                id: s.id,
                date: s.date.toISOString(),
                title: s.title,
                status: s.attendances.length > 0 ? s.attendances[0].status : null,
            })),
        }
    })

    // Get attendance dates for activity heatmap
    const attendanceDates = sessions
        .filter(s => s.attendances.length > 0 && (s.attendances[0].status === 'PRESENT' || s.attendances[0].status === 'LATE'))
        .map(s => s.date.toISOString().split('T')[0])

    return NextResponse.json({
        courses: offlineCourses,
        stats: courseStats,
        attendanceDates,
    })
}
