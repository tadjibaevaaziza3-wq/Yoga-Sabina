import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateToken } from '@/lib/auth/server'
import { checkRateLimit, getResetTime } from '@/lib/security/rate-limit'

export async function POST(req: Request) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        if (!checkRateLimit(`admin-login:${ip}`)) {
            return NextResponse.json({
                success: false,
                error: 'Too many attempts. Please try again later.',
                retryAfter: getResetTime(`admin-login:${ip}`)
            }, { status: 429 })
        }

        const body = await req.json()
        const { username, password } = body

        const adminUser = process.env.ADMIN_USER || 'admin123'
        const adminPass = process.env.ADMIN_PASS || '123123'

        if (username === adminUser && password === adminPass) {
            const cookieStore = await cookies()
            // Set a signed token for admin session
            const token = generateToken('admin-master-account')

            cookieStore.set('admin_session', token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
