/**
 * Admin User Details API
 * GET /api/admin/users/[id]/details — Aggregated user details
 * POST /api/admin/users/[id]/details — Add subscription for user
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            purchases: {
                include: { course: { select: { id: true, title: true } } },
                orderBy: { createdAt: 'desc' },
            },
            subscriptions: {
                include: { course: { select: { id: true, title: true, type: true, times: true } } },
                orderBy: { endsAt: 'desc' },
            },
        },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Calculate total spent
    const totalSpent = user.purchases
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0)

    // Active subscriptions count
    const now = new Date()
    const activeSubscriptions = user.subscriptions.filter(
        s => s.status === 'ACTIVE' && new Date(s.endsAt) > now
    )

    // Payment screenshots
    const screenshots = user.purchases
        .filter(p => p.screenshotUrl)
        .map(p => ({
            id: p.id,
            url: p.screenshotUrl!,
            courseTitle: p.course.title,
            amount: Number(p.amount),
            status: p.status,
            date: p.createdAt,
        }))

    return NextResponse.json({
        totalSpent,
        activeCourses: activeSubscriptions.length,
        activeSubscriptions: activeSubscriptions.map(s => ({
            id: s.id,
            courseId: s.courseId,
            courseTitle: s.course.title,
            courseType: (s.course as any).type,
            courseTimes: (s.course as any).times,
            timeSlot: s.timeSlot,
            startsAt: s.startsAt,
            endsAt: s.endsAt,
            status: s.status,
        })),
        allSubscriptions: user.subscriptions.map(s => ({
            id: s.id,
            courseId: s.courseId,
            courseTitle: s.course.title,
            courseType: (s.course as any).type,
            courseTimes: (s.course as any).times,
            timeSlot: s.timeSlot,
            startsAt: s.startsAt,
            endsAt: s.endsAt,
            status: s.status,
        })),
        purchases: user.purchases.map(p => ({
            id: p.id,
            courseId: p.courseId,
            courseTitle: p.course.title,
            amount: Number(p.amount),
            status: p.status,
            provider: p.provider,
            screenshotUrl: p.screenshotUrl,
            verifiedByAdmin: p.verifiedByAdmin,
            createdAt: p.createdAt,
        })),
        screenshots,
    })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { courseId, startsAt, endsAt, status, timeSlot } = await request.json()

    if (!courseId || !endsAt) {
        return NextResponse.json({ error: 'courseId and endsAt required' }, { status: 400 })
    }

    const subscription = await prisma.subscription.create({
        data: {
            userId: id,
            courseId,
            startsAt: startsAt ? new Date(startsAt) : new Date(),
            endsAt: new Date(endsAt),
            status: status || 'ACTIVE',
            timeSlot: timeSlot || null,
        },
        include: { course: { select: { title: true } } },
    })

    return NextResponse.json(subscription)
}
