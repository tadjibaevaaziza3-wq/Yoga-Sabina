import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, logAdminAction, hasPermission } from '@/lib/auth/admin-auth'
import * as bcrypt from 'bcrypt'

// GET /api/admin/admins — List all admins (SUPER_ADMIN only)
export async function GET(req: Request) {
    const { error, admin } = await requirePermission(req, 'users.view')
    if (error || !admin) return error!

    // Only SUPER_ADMIN can see admin list
    if (admin.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admins = await prisma.adminUser.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatar: true,
            role: true,
            permissions: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            _count: { select: { actionLogs: true } }
        }
    })

    return NextResponse.json({ admins })
}

// POST /api/admin/admins — Create new admin (SUPER_ADMIN only)
export async function POST(req: Request) {
    const { error, admin } = await requirePermission(req, 'users.create')
    if (error || !admin) return error!

    if (admin.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only Super Admin can create admins' }, { status: 403 })
    }

    try {
        const body = await req.json()
        const { username, password, displayName, email, role, permissions } = body

        if (!username || !password || !displayName) {
            return NextResponse.json({ error: 'Username, password, and display name are required' }, { status: 400 })
        }

        // Check for existing
        const existing = await prisma.adminUser.findUnique({ where: { username } })
        if (existing) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
        }

        if (email) {
            const emailExists = await prisma.adminUser.findUnique({ where: { email } })
            if (emailExists) {
                return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
            }
        }

        const passwordHash = await bcrypt.hash(password, 12)

        const newAdmin = await prisma.adminUser.create({
            data: {
                username,
                passwordHash,
                displayName,
                email: email || null,
                role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN_ROLE',
                permissions: Array.isArray(permissions) ? permissions : [],
                createdById: admin.id,
            }
        })

        await logAdminAction(admin.id, 'ADMIN_CREATED', {
            entity: 'AdminUser',
            entityId: newAdmin.id,
            details: { username, role: newAdmin.role },
            ipAddress: req.headers.get('x-forwarded-for') || undefined,
        })

        return NextResponse.json({
            success: true,
            admin: {
                id: newAdmin.id,
                username: newAdmin.username,
                displayName: newAdmin.displayName,
                role: newAdmin.role,
            }
        }, { status: 201 })
    } catch (error: any) {
        console.error('Create admin error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
