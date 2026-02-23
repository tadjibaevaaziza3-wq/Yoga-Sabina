import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

        const decoded = verifyToken(token) as any
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })

        const userId = decoded.id || decoded.sub
        const { newPassword } = await request.json()

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 })
        }

        // Hash with SHA-256 for consistency with existing system
        const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex')

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                forcePasswordChange: false,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
