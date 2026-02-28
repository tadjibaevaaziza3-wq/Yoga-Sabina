import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromSession, logAdminAction } from '@/lib/auth/admin-auth'
import * as bcrypt from 'bcrypt'

// GET /api/admin/profile — Current admin profile
export async function GET() {
    const admin = await getAdminFromSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get action count (non-critical — don't fail the profile endpoint if this errors)
    let actionCount = 0
    try {
        actionCount = await prisma.adminActionLog.count({
            where: { adminId: admin.id }
        })
    } catch (e) {
        console.error('Failed to get action count:', e)
    }

    return NextResponse.json({
        id: admin.id,
        username: admin.username,
        displayName: admin.displayName,
        email: admin.email,
        avatar: admin.avatar,
        role: admin.role,
        permissions: admin.permissions,
        lastLoginAt: admin.lastLoginAt,
        createdAt: admin.createdAt,
        actionCount,
    })
}

// PATCH /api/admin/profile — Update own profile
export async function PATCH(req: Request) {
    const admin = await getAdminFromSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { displayName, avatar } = body

    const updateData: any = {}
    if (displayName) updateData.displayName = displayName
    if (avatar !== undefined) updateData.avatar = avatar

    const updated = await prisma.adminUser.update({
        where: { id: admin.id },
        data: updateData,
    })

    await logAdminAction(admin.id, 'PROFILE_UPDATED', {
        details: { changes: Object.keys(updateData) },
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, displayName: updated.displayName, avatar: updated.avatar })
}
