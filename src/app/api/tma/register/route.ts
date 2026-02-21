import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    let lang = 'uz'
    try {
        const body = await request.json()
        const { telegramId, telegramUsername, firstName, lastName, fullName, phone, location, healthGoals } = body
        lang = body.lang || 'uz'

        if (!telegramId) {
            return NextResponse.json({ success: false, error: 'Missing telegramId' }, { status: 400 })
        }

        // 1. Find or create user
        let user = await prisma.user.findUnique({
            where: { telegramId: String(telegramId) },
            include: { profile: true }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: `${telegramId}@tma.local`, // Dummy email for TMA users
                    telegramId: String(telegramId),
                    firstName: firstName || null,
                    lastName: lastName || null,
                    phone: phone || null,
                    profile: {
                        create: {
                            name: fullName || `${firstName || ''} ${lastName || ''}`.trim(),
                            location: location || null,
                            healthIssues: healthGoals || null,
                            totalYogaTime: 0,
                            bodyParams: {
                                telegramUsername: telegramUsername || null,
                                region: location || null,
                                source: 'TMA'
                            } as any
                        }
                    }
                },
                include: { profile: true }
            })
        } else {
            // Update existing user
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    firstName: firstName || user.firstName,
                    lastName: lastName || user.lastName,
                    phone: phone || user.phone,
                    profile: {
                        update: {
                            name: fullName || user.profile?.name,
                            location: location || user.profile?.location,
                            healthIssues: healthGoals || user.profile?.healthIssues,
                            bodyParams: {
                                ...(user.profile?.bodyParams as any || {}),
                                telegramUsername: telegramUsername || (user.profile?.bodyParams as any)?.telegramUsername,
                                region: location || (user.profile?.bodyParams as any)?.region,
                            } as any
                        }
                    }
                }
            })
        }

        if (!user) {
            return NextResponse.json({ success: false, error: 'Failed to create/find user' }, { status: 500 })
        }

        // Issue Auth Token
        const token = generateToken(user.id)
        const cookieStore = await cookies()
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
        })

        return NextResponse.json({ success: true, isRegistered: !!user.phone })
    } catch (error: any) {
        console.error('TMA Register error:', error)

        // Handle Prisma Unique Constraint error
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'ma\'lumotlar'
            const message = lang === 'ru'
                ? (field === 'phone' ? "Этот номер телефона уже зарегистрирован." : "Этот пользователь уже зарегистрирован.")
                : (field === 'phone' ? "Bu telefon raqami allaqachon ro'yxatdan o'tgan." : "Bu foydalanuvchi allaqachon ro'yxatdan o'tgan.")
            return NextResponse.json({ success: false, error: message }, { status: 400 })
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('telegramId')

    if (!telegramId) {
        return NextResponse.json({ success: false, error: 'Missing telegramId' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
        where: { telegramId: String(telegramId) },
        include: { profile: true }
    })

    if (user) {
        // Issue Auth Token if user exists
        const token = generateToken(user.id)
        const cookieStore = await cookies()
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
        })
    }

    return NextResponse.json({
        success: true,
        isRegistered: !!user?.phone,
        user: user
    })
}
