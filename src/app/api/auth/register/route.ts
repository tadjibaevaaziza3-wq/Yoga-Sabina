
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

import { generateToken } from '@/lib/auth/server'
import { checkRateLimit, getResetTime } from '@/lib/security/rate-limit'

export async function POST(request: Request) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        if (!checkRateLimit(`register:${ip}`)) {
            return NextResponse.json({
                success: false,
                error: 'Too many registration attempts. Please try again later.',
                retryAfter: getResetTime(`register:${ip}`)
            }, { status: 429 })
        }

        const body = await request.json()
        const { name, email, phone, telegramUsername, location, healthIssues, password } = body

        if (!phone || !password) {
            return NextResponse.json({ success: false, error: 'Phone and password are required' }, { status: 400 })
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone }
                ]
            }
        })

        if (existingUser) {
            const field = existingUser.phone === phone ? 'phone' : 'email'
            return NextResponse.json({ success: false, error: `Account with this ${field} already exists` }, { status: 400 })
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                phone,
                telegramUsername: telegramUsername || undefined,
                firstName: name.split(' ')[0],
                lastName: name.split(' ').slice(1).join(' '),
                profile: {
                    create: {
                        name,
                        location,
                        healthIssues,
                        totalYogaTime: 0,
                        bodyParams: {},
                        cycleData: []
                    }
                }
            }
        })

        // Set Auth Cookie with signed token
        const token = generateToken(user.id)
        const cookieStore = await cookies()
        cookieStore.set('auth_token', token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        })

        return NextResponse.json({ success: true, user })
    } catch (error: any) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { success: false, error: process.env.NODE_ENV === 'production' ? 'Registration failed' : (error.message || 'Registration failed') },
            { status: 500 }
        )
    }
}
