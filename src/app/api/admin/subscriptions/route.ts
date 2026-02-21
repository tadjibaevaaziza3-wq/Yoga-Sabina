import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

import { verifyToken } from '@/lib/auth/server'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function GET(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const userId = searchParams.get('userId')
        const courseId = searchParams.get('courseId')

        const where: any = {}

        if (status) {
            where.status = status
        }
        if (userId) {
            where.userId = userId
        }
        if (courseId) {
            where.courseId = courseId
        }

        const subscriptions = await prisma.subscription.findMany({
            where,
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                course: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Calculate additional info for each subscription
        const enrichedSubscriptions = subscriptions.map(sub => {
            const now = new Date()
            const daysRemaining = Math.ceil((sub.endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            const isExpired = sub.endsAt < now

            return {
                ...sub,
                daysRemaining,
                isExpired
            }
        })

        return NextResponse.json({
            success: true,
            subscriptions: enrichedSubscriptions,
            total: subscriptions.length
        })
    } catch (error: any) {
        console.error('Error fetching subscriptions:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { userId, courseId, durationDays } = body

        if (!userId || !courseId || !durationDays) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: userId, courseId, durationDays'
            }, { status: 400 })
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'User not found'
            }, { status: 404 })
        }

        // Verify course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        })

        if (!course) {
            return NextResponse.json({
                success: false,
                error: 'Course not found'
            }, { status: 404 })
        }

        // Calculate end date
        const startsAt = new Date()
        const endsAt = new Date()
        endsAt.setDate(endsAt.getDate() + parseInt(durationDays))

        // Create subscription
        const subscription = await prisma.subscription.create({
            data: {
                userId,
                courseId,
                startsAt,
                endsAt,
                status: 'ACTIVE'
            },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                course: true
            }
        })

        return NextResponse.json({
            success: true,
            subscription,
            message: 'Subscription created successfully'
        })
    } catch (error: any) {
        console.error('Error creating subscription:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
