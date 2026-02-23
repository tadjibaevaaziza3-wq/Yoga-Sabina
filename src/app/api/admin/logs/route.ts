import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth/admin-auth'

// GET /api/admin/logs — All admin activity logs (SUPER_ADMIN or logs.view)
export async function GET(req: Request) {
    const { error, admin } = await requirePermission(req, 'logs.view')
    if (error || !admin) return error!

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action') || undefined

    const where: any = {}
    if (action) where.action = action

    const [logs, total] = await Promise.all([
        prisma.adminActionLog.findMany({
            where,
            include: {
                admin: { select: { displayName: true, username: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: (page - 1) * limit,
        }),
        prisma.adminActionLog.count({ where })
    ])

    return NextResponse.json({ logs, total, page, totalPages: Math.ceil(total / limit) })
}
