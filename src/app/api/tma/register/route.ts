import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { telegramId, firstName, lastName, phone, location, healthGoals } = await request.json()

        if (!telegramId) {
            return NextResponse.json({ success: false, error: 'Missing telegramId' }, { status: 400 })
        }

        // 1. Find or create user
        let user = await (prisma as any).user.findUnique({
            where: { telegramId: String(telegramId) },
            include: { profile: true }
        })

        if (!user) {
            user = await (prisma as any).user.create({
                data: {
                    telegramId: String(telegramId),
                    name: `${firstName} ${lastName || ''}`.trim(),
                    phone: phone || null,
                    profile: {
                        create: {
                            location: location || null,
                            healthIssues: healthGoals || null,
                            totalYogaTime: 0,
                        }
                    }
                },
                include: { profile: true }
            })
        } else {
            // Update existing user
            await (prisma as any).user.update({
                where: { id: user.id },
                data: {
                    phone: phone || user.phone,
                    profile: {
                        update: {
                            location: location || user.profile?.location,
                            healthIssues: healthGoals || user.profile?.healthIssues,
                        }
                    }
                }
            })
        }

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

    const user = await (prisma as any).user.findUnique({
        where: { telegramId: String(telegramId) },
        include: { profile: true }
    })

    return NextResponse.json({
        success: true,
        isRegistered: !!user?.phone,
        user: user
    })
}
