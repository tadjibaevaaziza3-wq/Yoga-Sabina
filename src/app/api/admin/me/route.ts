import { NextResponse } from 'next/server'
import { getAdminFromSession } from '@/lib/auth/admin-auth'

export async function GET() {
    try {
        const admin = await getAdminFromSession()
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
