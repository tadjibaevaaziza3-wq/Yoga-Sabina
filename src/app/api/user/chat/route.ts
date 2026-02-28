import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

// GET: Fetch user's subscribed courses with chat info
export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = verifyToken(token)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get courses the user has access to
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            role: true,
            purchases: {
                where: { status: 'PAID' },
                select: { courseId: true }
            },
            subscriptions: {
                where: { status: 'ACTIVE' },
                select: { courseId: true }
            }
        }
    })

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const courseIds = [
        ...new Set([
            ...user.purchases.map(p => p.courseId),
            ...user.subscriptions.map(s => s.courseId)
        ])
    ]

    // If admin, show all courses
    const courses = user.role === 'ADMIN'
        ? await prisma.course.findMany({
            where: { isActive: true },
            select: {
                id: true,
                title: true,
                titleRu: true,
                coverImage: true,
                type: true,
                _count: { select: { courseChats: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        : await prisma.course.findMany({
            where: { id: { in: courseIds }, isActive: true },
            select: {
                id: true,
                title: true,
                titleRu: true,
                coverImage: true,
                type: true,
                _count: { select: { courseChats: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

    return NextResponse.json({ success: true, courses })
}
