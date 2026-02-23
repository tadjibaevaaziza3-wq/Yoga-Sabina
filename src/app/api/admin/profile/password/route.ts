import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromSession, logAdminAction } from '@/lib/auth/admin-auth'
import * as bcrypt from 'bcrypt'

// POST /api/admin/profile/password — Change own password
export async function POST(req: Request) {
    const admin = await getAdminFromSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Current and new password required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, admin.passwordHash)
    if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.adminUser.update({
        where: { id: admin.id },
        data: { passwordHash }
    })

    await logAdminAction(admin.id, 'PASSWORD_CHANGED', {
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true })
}
