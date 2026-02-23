import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'
import bcrypt from 'bcryptjs'

async function getAdminId(): Promise<string | null> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return null;
    const decoded = verifyToken(adminSession);
    return decoded ? (decoded as any).id || (decoded as any).sub || adminSession : null;
}

// GET /api/admin/users — List with search, filter, pagination
export async function GET(request: Request) {
    const adminId = await getAdminId()
    if (!adminId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const subscription = searchParams.get('subscription') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    try {
        const where: any = {}

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { telegramUsername: { contains: search, mode: 'insensitive' } },
            ]
            if (!isNaN(parseInt(search))) {
                where.OR.push({ userNumber: parseInt(search) })
            }
        }

        if (status === 'active') where.isBlocked = false
        if (status === 'blocked') where.isBlocked = true

        if (subscription === 'active') {
            where.subscriptions = { some: { status: 'ACTIVE' } }
        } else if (subscription === 'none') {
            where.subscriptions = { none: {} }
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    userNumber: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    telegramUsername: true,
                    role: true,
                    isBlocked: true,
                    createdAt: true,
                    registrationSource: true,
                    subscriptions: {
                        select: { id: true, status: true, startsAt: true, endsAt: true },
                        orderBy: { createdAt: 'desc' as const },
                    },
                    purchases: { select: { id: true } },
                },
            }),
            prisma.user.count({ where }),
        ])

        const formattedUsers = users.map(u => ({
            ...u,
            fullName: [u.firstName, u.lastName].filter(Boolean).join(' ') || '—',
            activeSubscription: u.subscriptions.find((s: any) => s.status === 'ACTIVE') || null,
            totalPurchases: u.purchases.length,
        }))

        return NextResponse.json({
            success: true,
            users: formattedUsers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST /api/admin/users — Create new user
export async function POST(request: Request) {
    const adminId = await getAdminId()
    if (!adminId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    try {
        const { firstName, lastName, email, phone, password } = await request.json()

        if (!firstName || !password) {
            return NextResponse.json({ success: false, error: 'Name and password required' }, { status: 400 })
        }

        if (email) {
            const existing = await prisma.user.findUnique({ where: { email } })
            if (existing) return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
        }
        if (phone) {
            const existing = await prisma.user.findUnique({ where: { phone } })
            if (existing) return NextResponse.json({ success: false, error: 'Phone already exists' }, { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: {
                firstName,
                lastName: lastName || null,
                email: email || null,
                phone: phone || null,
                password: hashedPassword,
                forcePasswordChange: true,
            },
        })

        await prisma.adminActionLog.create({
            data: {
                adminId,
                action: 'USER_CREATED',
                entity: 'User',
                entityId: user.id,
                details: { message: `Created user: ${firstName} ${lastName || ''}`.trim() },
            },
        })

        return NextResponse.json({ success: true, user: { id: user.id, firstName: user.firstName } })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
