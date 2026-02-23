import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromSession } from '@/lib/auth/admin-auth'

// GET /api/admin/profile/activity — Own activity log
export async function GET(req: Request) {
    const admin = await getAdminFromSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const [logs, total] = await Promise.all([
        prisma.adminActionLog.findMany({
            where: { adminId: admin.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: (page - 1) * limit,
        }),
        prisma.adminActionLog.count({ where: { adminId: admin.id } })
    ])

    return NextResponse.json({ logs, total, page, totalPages: Math.ceil(total / limit) })
}
