import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { name, email, phone, location, healthIssues, supabaseUserId } = await request.json()

        // 1. Create a User in Prisma
        // @ts-ignore - Prisma types might need a full build/restart to sync
        const user = await prisma.user.create({
            data: {
                id: supabaseUserId, // Link to Supabase Auth ID
                email,
                firstName: name.split(' ')[0],
                lastName: name.split(' ').slice(1).join(' '),
                phone,
                profile: {
                    create: {
                        location,
                        healthIssues,
                        totalYogaTime: 0,
                        bodyParams: {},
                        cycleData: []
                    }
                }
            }
        })

        return NextResponse.json({ success: true, user })
    } catch (error: any) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Registration failed' },
            { status: 500 }
        )
    }
}
