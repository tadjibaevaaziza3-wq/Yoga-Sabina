import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

        const userId = verifyToken(token)
        if (!userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
        const { newPassword } = await request.json()

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 })
        }

        // Hash with bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                forcePasswordChange: false,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Change password error:', error)
        return NextResponse.json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Password change failed' : error.message }, { status: 500 })
    }
}
