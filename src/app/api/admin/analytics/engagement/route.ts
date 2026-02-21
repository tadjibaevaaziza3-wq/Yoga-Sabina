import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/server'
import { startOfDay, subDays, format } from 'date-fns'

export async function GET(req: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const url = new URL(req.url)
        const days = parseInt(url.searchParams.get('days') || '30')

        // 1. DAU (Daily Active Users)
        const dauData = await prisma.eventLog.groupBy({
            by: ['createdAt'],
            _count: { userId: true },
            where: {
                createdAt: {
                    gte: subDays(new Date(), days)
                }
            }
        })

        // Group by day manually since Prisma doesn't support date truncation directly in groupBy easily across DBs
        const dailyActive = new Map<string, number>()
        dauData.forEach(log => {
            const dateStr = format(log.createdAt, 'yyyy-MM-dd')
            dailyActive.set(dateStr, (dailyActive.get(dateStr) || 0) + 1)
        })

        // 2. Course Progress Heatmap
        const courseProgress = await prisma.enhancedVideoProgress.findMany({
            include: {
                lesson: {
                    select: {
                        courseId: true,
                        course: { select: { title: true } }
                    }
                }
            }
        })

        const heatmap: any = {}
        courseProgress.forEach(progress => {
            const courseId = progress.lesson.courseId
            const courseTitle = progress.lesson.course.title

            if (!heatmap[courseId]) {
                heatmap[courseId] = { title: courseTitle, completed: 0, total: 0 }
            }

            heatmap[courseId].total++
            if (progress.completed) heatmap[courseId].completed++
        })

        // 3. User Retention (Simple cohort for now)
        const cohorts = await prisma.user.groupBy({
            by: ['createdAt'],
            _count: { id: true },
            where: {
                createdAt: {
                    gte: subDays(new Date(), 90) // Last 3 months
                }
            }
        })

        return NextResponse.json({
            success: true,
            dau: Array.from(dailyActive.entries()).map(([date, count]) => ({ date, count })),
            heatmap: Object.values(heatmap),
            totalUsers: await prisma.user.count()
        })
    } catch (error: any) {
        console.error('Analytics Error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
