import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const feedback = await prisma.feedback.findMany({
            where: {
                isApproved: true
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profile: {
                            select: {
                                location: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(feedback)
    } catch (error) {
        console.error('Feedback fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, message, rating } = body

        if (!userId || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const feedback = await prisma.feedback.create({
            data: {
                userId,
                message,
                rating: rating || 5,
                isApproved: false // Requires moderation
            }
        })

        return NextResponse.json({ success: true, feedback })
    } catch (error) {
        console.error('Feedback creation error:', error)
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
    }
}
