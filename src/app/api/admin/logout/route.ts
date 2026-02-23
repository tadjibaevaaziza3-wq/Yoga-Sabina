import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminFromSession, logAdminAction } from '@/lib/auth/admin-auth'

export async function POST() {
    try {
        const admin = await getAdminFromSession()
        if (admin) {
            await logAdminAction(admin.id, 'LOGOUT')
        }

        const cookieStore = await cookies()
        cookieStore.delete('admin_session')

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ success: true })
    }
}
