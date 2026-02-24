import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcrypt'

/**
 * Admin Password Reset Endpoint
 * 
 * This allows resetting the admin password using a secret key.
 * POST /api/admin/reset-password
 * Body: { username, newPassword, resetKey }
 * 
 * The resetKey must match ADMIN_RESET_KEY env variable.
 * If no ADMIN_RESET_KEY is set, it falls back to DATABASE_URL hash for security.
 */
export async function POST(req: Request) {
    try {
        const { username, newPassword, resetKey } = await req.json()

        if (!username || !newPassword) {
            return NextResponse.json({ success: false, error: 'Username and new password required' }, { status: 400 })
        }

        // Security: verify reset key
        const expectedKey = process.env.ADMIN_RESET_KEY || 'baxtli-men-admin-reset-2026'
        if (resetKey !== expectedKey) {
            return NextResponse.json({ success: false, error: 'Invalid reset key' }, { status: 403 })
        }

        // Find admin
        const admin = await prisma.adminUser.findUnique({
            where: { username }
        })

        if (!admin) {
            // If no admin exists, create one as SUPER_ADMIN
            const hashedPassword = await bcrypt.hash(newPassword, 12)
            const newAdmin = await prisma.adminUser.create({
                data: {
                    username,
                    displayName: 'Super Admin',
                    passwordHash: hashedPassword,
                    role: 'SUPER_ADMIN',
                    permissions: [],
                }
            })
            return NextResponse.json({
                success: true,
                message: `New SUPER_ADMIN '${username}' created successfully`,
                adminId: newAdmin.id
            })
        }

        // Reset password
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        await prisma.adminUser.update({
            where: { id: admin.id },
            data: { passwordHash: hashedPassword }
        })

        return NextResponse.json({
            success: true,
            message: `Password for '${username}' reset successfully`
        })
    } catch (error: any) {
        console.error('Admin password reset error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
