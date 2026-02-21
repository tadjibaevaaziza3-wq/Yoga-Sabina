import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const authToken = cookieStore.get('auth_token')?.value

        if (!authToken) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
        }

        const userId = verifyToken(authToken)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                telegramUsername: true
            }
        })

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, user })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
