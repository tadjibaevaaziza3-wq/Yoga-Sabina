import { MasterAgent, UserContext } from '@/lib/ai/master-agent'
import { NextResponse } from 'next/server'
import { getLocalUser } from '@/lib/auth/server'
import { checkUserAccess } from '@/lib/db/access'
import { prisma } from '@/lib/prisma'
import { Locale } from '@/lib/ai/faq-engine'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { message, lang = 'uz', history = [] } = body

        if (!message) {
            return NextResponse.json({ error: 'No message provided' }, { status: 400 })
        }

        // Get authenticated user (if exists)
        const user = await getLocalUser()

        // Build user context with subscription status + profile data
        let isSubscribed = false
        let firstName: string | undefined
        let healthIssues: string | null = null
        let gender: string | null = null
        let age: number | null = null
        let isPregnant = false

        // Behavioral intelligence data
        let lastActivityDaysAgo = 0
        let watchTimeThisWeek = 0
        let watchTimeLastWeek = 0
        let streakDays = 0
        let subscriptionDaysLeft: number | undefined
        let chatMessagesThisWeek = 0
        let chatMessagesLastWeek = 0
        let lastMoodKpi: number | undefined
        let daysSinceLastLogin = 0
        let subscribedCourseName: string | null = null

        if (user) {
            isSubscribed = await checkUserAccess(user.id)
            firstName = user.firstName || undefined

            // Fetch health profile
            try {
                const profile = await prisma.profile.findUnique({
                    where: { userId: user.id },
                    select: { healthIssues: true, gender: true, birthDate: true, currentStreak: true }
                })
                healthIssues = profile?.healthIssues || null
                gender = profile?.gender || null
                streakDays = profile?.currentStreak || 0

                if (profile?.birthDate) {
                    const now = new Date()
                    const birth = new Date(profile.birthDate)
                    age = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                }

                if (healthIssues) {
                    const pregnancyWords = ['homilador', 'pregnant', 'беременн']
                    isPregnant = pregnancyWords.some(w => healthIssues!.toLowerCase().includes(w))
                }
            } catch { /* ignore */ }

            // Fetch behavioral data for emotional intelligence
            try {
                const now = new Date()
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

                // Watch time (this week vs last week) from video progress
                const [thisWeekProgress, lastWeekProgress] = await Promise.all([
                    prisma.enhancedVideoProgress.findMany({
                        where: { userId: user.id, updatedAt: { gte: oneWeekAgo } },
                        select: { progress: true }
                    }).catch(() => []),
                    prisma.enhancedVideoProgress.findMany({
                        where: { userId: user.id, updatedAt: { gte: twoWeeksAgo, lt: oneWeekAgo } },
                        select: { progress: true }
                    }).catch(() => []),
                ])
                watchTimeThisWeek = thisWeekProgress.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / 60
                watchTimeLastWeek = lastWeekProgress.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / 60

                // Last activity
                const lastProgress = await prisma.enhancedVideoProgress.findFirst({
                    where: { userId: user.id },
                    orderBy: { updatedAt: 'desc' },
                    select: { updatedAt: true }
                }).catch(() => null)
                if (lastProgress?.updatedAt) {
                    lastActivityDaysAgo = Math.floor((now.getTime() - new Date(lastProgress.updatedAt).getTime()) / (24 * 60 * 60 * 1000))
                }

                // Chat engagement (this week vs last week)
                const [thisWeekChat, lastWeekChat] = await Promise.all([
                    prisma.aiConversation.count({
                        where: { userId: user.id, role: 'user', createdAt: { gte: oneWeekAgo } }
                    }).catch(() => 0),
                    prisma.aiConversation.count({
                        where: { userId: user.id, role: 'user', createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } }
                    }).catch(() => 0),
                ])
                chatMessagesThisWeek = thisWeekChat
                chatMessagesLastWeek = lastWeekChat

                // Subscription expiration + course name
                const subscription = await prisma.subscription.findFirst({
                    where: { userId: user.id, status: 'ACTIVE' },
                    orderBy: { endsAt: 'desc' },
                    select: { endsAt: true, course: { select: { title: true } } }
                }).catch(() => null)
                if (subscription?.endsAt) {
                    subscriptionDaysLeft = Math.max(0, Math.floor((new Date(subscription.endsAt).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
                }
                if ((subscription as any)?.course?.title) {
                    subscribedCourseName = (subscription as any).course.title
                }

                // Last mood KPI from CheckIn
                const lastCheckIn = await prisma.checkIn.findFirst({
                    where: { userId: user.id },
                    orderBy: { createdAt: 'desc' },
                    select: { moodRating: true }
                }).catch(() => null)
                if (lastCheckIn?.moodRating !== undefined && lastCheckIn?.moodRating !== null) {
                    lastMoodKpi = lastCheckIn.moodRating
                }

                // Days since last login (approximate from last chat)
                daysSinceLastLogin = lastActivityDaysAgo // Use activity as proxy
            } catch (e) {
                console.warn('[AI] Failed to load behavior data:', e)
            }
        }

        const userCtx: UserContext = {
            userId: user?.id,
            firstName,
            isSubscribed,
            healthIssues,
            gender,
            age,
            isPregnant,
            lang: lang as Locale,
            // Behavioral intelligence
            lastActivityDaysAgo,
            watchTimeThisWeek,
            watchTimeLastWeek,
            streakDays,
            subscriptionDaysLeft,
            chatMessagesThisWeek,
            chatMessagesLastWeek,
            lastMoodKpi,
            daysSinceLastLogin,
            // Subscription context
            subscribedCourseName,
        }

        const response = await MasterAgent.processRequest(message, lang as Locale, userCtx, history)

        return NextResponse.json({
            success: true,
            response: response.content,
            metadata: response.metadata,
            isSubscribed,
        })

    } catch (error: any) {
        console.error('AI Chat Error:', error)
        return NextResponse.json({ success: false, error: 'AI unavailable' }, { status: 500 })
    }
}

// GET — Load conversation history for the current user
export async function GET(req: Request) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ success: true, history: [] })
        }

        const messages = await prisma.aiConversation.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 30,
            select: {
                role: true,
                content: true,
                createdAt: true,
            }
        })

        return NextResponse.json({
            success: true,
            history: messages.reverse().map(m => ({
                role: m.role,
                content: m.content,
            }))
        })
    } catch (error: any) {
        console.error('AI History Error:', error)
        return NextResponse.json({ success: true, history: [] })
    }
}
