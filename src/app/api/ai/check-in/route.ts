
import { NextResponse } from 'next/server'
import { getLocalUser } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { MasterAgent } from '@/lib/ai/master-agent'

export async function POST(req: Request) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { mood, symptoms, lang = 'uz' } = body

        // 1. Get AI Recommendation
        const aiResult = await MasterAgent.getPersonalizedRecommendation(symptoms, mood, lang)

        // 2. Save Check-in
        const checkIn = await prisma.checkIn.create({
            data: {
                userId: user.id,
                moodRating: mood,
                symptoms: symptoms,
                aiRecommendation: aiResult
            }
        })

        // 3. Update Profile lastActivity (optional, or handled by progress)

        return NextResponse.json({
            success: true,
            recommendation: aiResult,
            checkInId: checkIn.id
        })

    } catch (error: any) {
        console.error('Check-in error:', error)
        return NextResponse.json({ success: false, error: 'Failed to process check-in' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user checked in today
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const todayCheckIn = await prisma.checkIn.findFirst({
            where: {
                userId: user.id,
                createdAt: {
                    gte: startOfDay
                }
            }
        })

        return NextResponse.json({
            checkedIn: !!todayCheckIn,
            data: todayCheckIn
        })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Error checking status' }, { status: 500 })
    }
}
