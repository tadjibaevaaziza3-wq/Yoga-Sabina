import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    let lang = 'uz'
    try {
        const body = await request.json()
        const { telegramId, telegramUsername, firstName, lastName, fullName, phone, password, location, healthGoals } = body
        lang = body.lang || 'uz'

        if (!telegramId) {
            return NextResponse.json({ success: false, error: 'Missing telegramId' }, { status: 400 })
        }

        // 1. Find user by telegramId first
        let user = await prisma.user.findUnique({
            where: { telegramId: String(telegramId) },
            include: { profile: true }
        })

        // 2. If no user found by telegramId, check by phone number
        //    (handles users who registered via web panel)
        if (!user && phone) {
            const cleanPhone = phone.replace(/\+/g, '')
            user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { phone },
                        { phone: cleanPhone },
                        { phone: `+${cleanPhone}` },
                    ]
                },
                include: { profile: true }
            })

            // Link telegramId to the existing web-registered user
            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        telegramId: String(telegramId),
                        telegramUsername: telegramUsername || user.telegramUsername,
                        firstName: firstName || user.firstName,
                        lastName: lastName || user.lastName,
                    }
                })
                // Update profile with TMA data
                if (user.profile) {
                    await prisma.profile.update({
                        where: { userId: user.id },
                        data: {
                            name: fullName || user.profile.name,
                            location: location || user.profile.location,
                            healthIssues: healthGoals || user.profile.healthIssues,
                            bodyParams: {
                                ...(user.profile.bodyParams as any || {}),
                                telegramUsername: telegramUsername || (user.profile.bodyParams as any)?.telegramUsername,
                                region: location || (user.profile.bodyParams as any)?.region,
                                source: (user.profile.bodyParams as any)?.source || 'WEB+TMA'
                            } as any
                        }
                    })
                }
                console.log(`[TMA] Linked telegramId ${telegramId} to existing web user ${user.id}`)
            }
        }

        // 3. If user found (by telegramId or phone), update and login
        if (user) {
            // Update existing user's info
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    firstName: firstName || user.firstName,
                    lastName: lastName || user.lastName,
                    phone: phone || user.phone,
                    telegramUsername: telegramUsername || user.telegramUsername,
                    ...(password && !user.password ? { password: await bcrypt.hash(password, 10) } : {}),
                    ...(user.profile ? {
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
                    } : {})
                }
            })
        } else {
            // 4. Create new user (no existing user found by telegramId or phone)
            user = await prisma.user.create({
                data: {
                    email: `${telegramId}@tma.local`,
                    telegramId: String(telegramId),
                    telegramUsername: telegramUsername || null,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    phone: phone || null,
                    password: password ? await bcrypt.hash(password, 10) : null,
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
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        })

        return NextResponse.json({ success: true, isRegistered: !!user.phone })
    } catch (error: any) {
        console.error('TMA Register error:', error)
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
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        })
    }

    return NextResponse.json({
        success: true,
        isRegistered: !!user?.phone,
        user: user
    })
}
