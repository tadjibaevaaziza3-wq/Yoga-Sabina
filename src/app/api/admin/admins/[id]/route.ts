import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, logAdminAction } from '@/lib/auth/admin-auth'
import * as bcrypt from 'bcrypt'

// PATCH /api/admin/admins/[id] — Update admin
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { error, admin } = await requirePermission(req, 'users.edit')
    if (error || !admin) return error!

    if (admin.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only Super Admin can modify admins' }, { status: 403 })
    }

    // Prevent self-deactivation
    if (id === admin.id) {
        const body = await req.json()
        if (body.isActive === false) {
            return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
        }
    }

    try {
        const body = await req.json()
        const { displayName, email, role, permissions, isActive, password } = body

        const updateData: any = {}
        if (displayName !== undefined) updateData.displayName = displayName
        if (email !== undefined) updateData.email = email || null
        if (role !== undefined) updateData.role = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN_ROLE'
        if (permissions !== undefined) updateData.permissions = Array.isArray(permissions) ? permissions : []
        if (isActive !== undefined) updateData.isActive = isActive
        if (password) updateData.passwordHash = await bcrypt.hash(password, 12)

        const updated = await prisma.adminUser.update({
            where: { id },
            data: updateData,
            select: {
                id: true, username: true, displayName: true,
                role: true, permissions: true, isActive: true,
            }
        })

        await logAdminAction(admin.id, 'ADMIN_UPDATED', {
            entity: 'AdminUser',
            entityId: id,
            details: { changes: Object.keys(updateData) },
            ipAddress: req.headers.get('x-forwarded-for') || undefined,
        })

        return NextResponse.json({ success: true, admin: updated })
    } catch (error: any) {
        console.error('Update admin error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/admin/admins/[id] — Deactivate admin
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { error, admin } = await requirePermission(req, 'users.delete')
    if (error || !admin) return error!

    if (admin.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only Super Admin can delete admins' }, { status: 403 })
    }

    if (id === admin.id) {
        return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    await prisma.adminUser.update({
        where: { id },
        data: { isActive: false }
    })

    await logAdminAction(admin.id, 'ADMIN_DEACTIVATED', {
        entity: 'AdminUser',
        entityId: id,
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true })
}
