import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { userId, text, rating } = await request.json()

        if (!userId || !text) {
            return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 })
        }

        const feedback = await (prisma as any).feedback.create({
            data: {
                userId,
                text,
                rating: rating ? parseInt(rating) : null
            }
        })

        return NextResponse.json({ success: true, feedback })
    } catch (error: any) {
        console.error('Feedback error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function GET(request: Request) {
    // Admin list of feedback
    const feedbacks = await (prisma as any).feedback.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, feedbacks })
}
