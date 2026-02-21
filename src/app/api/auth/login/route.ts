
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { cookies } from 'next/headers'

// In a real app, this would be in .env
const AUTH_SECRET = process.env.AUTH_SECRET || 'baxtli-men-secret-key-2024'

import { generateToken } from '@/lib/auth/server'
import { checkRateLimit, getResetTime } from '@/lib/security/rate-limit'

export async function POST(request: Request) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        if (!checkRateLimit(`login:${ip}`)) {
            return NextResponse.json({
                success: false,
                error: 'Too many login attempts. Please try again later.',
                retryAfter: getResetTime(`login:${ip}`)
            }, { status: 429 })
        }

        const body = await request.json()
        const { login, password } = body // Changed 'email' to 'login' to correctly reflect UnifiedAuthForm

        if (!login || !password) {
            return NextResponse.json({ success: false, error: 'Login and password are required' }, { status: 400 })
        }

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')

        // 2. Admin Bootstrap Check (Requested by user)
        if (login === 'admin123123' && password === '123123') {
            const adminUser = await prisma.user.upsert({
                where: { email: 'admin123123' },
                update: {
                    password: hashedPassword,
                    role: 'ADMIN'
                },
                create: {
                    email: 'admin123123',
                    phone: 'admin123123',
                    password: hashedPassword,
                    role: 'ADMIN',
                    firstName: 'Admin',
                    lastName: 'User'
                }
            })

            // Set Auth Cookie
            const token = generateToken(adminUser.id)
            const cookieStore = await cookies()
            cookieStore.set('auth_token', token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })

            // Set Admin Session for specialized admin routes
            cookieStore.set('admin_session', token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })

            const { password: _, ...userWithoutPassword } = adminUser
            return NextResponse.json({ success: true, user: userWithoutPassword })
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: login },
                    { phone: login }
                ]
            }
        })

        if (!user || !user.password) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
        }

        if (hashedPassword !== user.password) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
        }

        // Set Auth Cookie with a signed token
        const token = generateToken(user.id)
        const cookieStore = await cookies()
        cookieStore.set('auth_token', token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        })

        // Also set admin session if role is admin
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            cookieStore.set('admin_session', token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })
        }

        // Don't send password back
        const { password: _, ...userWithoutPassword } = user
        return NextResponse.json({ success: true, user: userWithoutPassword })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Login failed' },
            { status: 500 }
        )
    }
}
