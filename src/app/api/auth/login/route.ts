
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const AUTH_SECRET = process.env.AUTH_SECRET || 'baxtli-men-secret-key-2024'

import { generateToken } from '@/lib/auth/server'
import { checkRateLimit, getResetTime } from '@/lib/security/rate-limit'
import { checkAndRegisterDevice } from '@/lib/security/device-tracker'

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
        const { login, password, fingerprint } = body

        if (!login || !password) {
            return NextResponse.json({ success: false, error: 'Login and password are required' }, { status: 400 })
        }

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
        const userAgent = request.headers.get('user-agent') || 'Unknown'

        // 2. Admin Bootstrap Check
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

            const token = generateToken(adminUser.id)
            const cookieStore = await cookies()
            cookieStore.set('auth_token', token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })
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

        // Check if user is blocked
        if (user.isBlocked) {
            return NextResponse.json({
                success: false,
                error: 'Akkaunt bloklangan. Admin bilan bog\'lanish uchun Telegram orqali murojaat qiling.'
            }, { status: 403 })
        }

        // Check password — support both SHA-256 (legacy) and bcrypt
        const sha256Hash = crypto.createHash('sha256').update(password).digest('hex')
        let passwordValid = sha256Hash === user.password
        if (!passwordValid && user.password.startsWith('$2')) {
            passwordValid = await bcrypt.compare(password, user.password)
        }
        if (!passwordValid) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
        }

        // ===== DEVICE TRACKING (Max 3 devices) =====
        // Admins bypass device limit
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            const deviceResult = await checkAndRegisterDevice(
                user.id, userAgent, ip, fingerprint
            )

            if (!deviceResult.allowed) {
                if (deviceResult.fraudAlert) {
                    return NextResponse.json({
                        success: false,
                        error: 'Akkaunt shubhali faoliyat tufayli bloklandi. Admin bilan bog\'lanish uchun Telegram orqali murojaat qiling.',
                        reason: 'ACCOUNT_BLOCKED',
                    }, { status: 403 })
                }

                return NextResponse.json({
                    success: false,
                    error: 'Siz 3 ta qurilmadan foydalanmoqdasiz. Yangi qurilma qo\'shish uchun mavjud qurilmalardan birini o\'chiring.',
                    reason: 'DEVICE_LIMIT_EXCEEDED',
                    currentDevices: deviceResult.currentDevices,
                    maxDevices: 3,
                }, { status: 403 })
            }
        }

        // Set Auth Cookie with a signed token
        const token = generateToken(user.id)
        const cookieStore = await cookies()
        cookieStore.set('auth_token', token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        })

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            cookieStore.set('admin_session', token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })
        }

        const { password: _, ...userWithoutPassword } = user
        return NextResponse.json({
            success: true,
            user: userWithoutPassword,
            forcePasswordChange: user.forcePasswordChange || false,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Login failed' },
            { status: 500 }
        )
    }
}
