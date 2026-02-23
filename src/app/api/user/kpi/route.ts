import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function getUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    const userId = verifyToken(token)
    if (!userId) return null
    return userId
}

// GET: Fetch KPI data (yoga time, streak, cycle data, calendar)
export async function GET() {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            profile: true,
            enhancedProgress: {
                orderBy: { lastWatched: 'desc' },
                select: { lastWatched: true, duration: true, progress: true, completed: true }
            },
            checkIns: {
                orderBy: { createdAt: 'desc' },
                take: 30
            }
        }
    })

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Build practice calendar from enhancedProgress
    const practiceMap = new Map<string, { minutes: number, sessions: number }>()
    user.enhancedProgress.forEach(p => {
        const date = p.lastWatched.toISOString().split('T')[0]
        const existing = practiceMap.get(date) || { minutes: 0, sessions: 0 }
        practiceMap.set(date, {
            minutes: existing.minutes + Math.round(p.progress / 60),
            sessions: existing.sessions + 1
        })
    })

    const practiceCalendar = Array.from(practiceMap.entries()).map(([date, data]) => ({
        date, ...data
    }))

    return NextResponse.json({
        success: true,
        kpi: {
            totalYogaTime: user.profile?.totalYogaTime || 0,
            currentStreak: user.profile?.currentStreak || 0,
            longestStreak: user.profile?.longestStreak || 0,
            lastActivityDate: user.profile?.lastActivityDate,
            achievements: user.profile?.achievements || [],
            cycleData: user.profile?.cycleData || null,
            practiceCalendar,
            checkIns: user.checkIns
        }
    })
}

// POST: Update cycle data or log yoga session
export async function POST(request: NextRequest) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action } = body

    if (action === 'update_cycle') {
        // Save menstruation calendar data
        const { cycleData } = body
        await prisma.profile.upsert({
            where: { userId },
            update: { cycleData },
            create: { userId, cycleData }
        })
        return NextResponse.json({ success: true })
    }

    if (action === 'log_session') {
        // Log a yoga session and update streak
        const { durationSeconds } = body
        const profile = await prisma.profile.findUnique({ where: { userId } })
        const now = new Date()
        const lastActivity = profile?.lastActivityDate
        const isConsecutiveDay = lastActivity &&
            (now.getTime() - lastActivity.getTime()) < 2 * 24 * 60 * 60 * 1000 &&
            now.toDateString() !== lastActivity.toDateString()

        const newStreak = isConsecutiveDay ? (profile?.currentStreak || 0) + 1 : 1
        const longestStreak = Math.max(newStreak, profile?.longestStreak || 0)

        await prisma.profile.upsert({
            where: { userId },
            update: {
                totalYogaTime: { increment: durationSeconds || 0 },
                currentStreak: newStreak,
                longestStreak,
                lastActivityDate: now
            },
            create: {
                userId,
                totalYogaTime: durationSeconds || 0,
                currentStreak: 1,
                longestStreak: 1,
                lastActivityDate: now
            }
        })
        return NextResponse.json({ success: true, streak: newStreak })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
