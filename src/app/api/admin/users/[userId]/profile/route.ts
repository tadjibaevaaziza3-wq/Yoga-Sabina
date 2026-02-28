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

// GET - Fetch user profile for admin view
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId } = await params

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            telegramId: true,
            telegramUsername: true,
            role: true,
            region: true,
            language: true,
            createdAt: true,
            subscriptions: {
                select: {
                    status: true,
                    endsAt: true,
                    course: { select: { title: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
            purchases: {
                select: {
                    status: true,
                    amount: true,
                    course: { select: { title: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Convert Decimal amount to number for JSON serialization
    const sanitized = {
        ...user,
        purchases: user.purchases.map(p => ({
            ...p,
            amount: Number(p.amount),
        })),
    }

    return NextResponse.json(sanitized)
}
