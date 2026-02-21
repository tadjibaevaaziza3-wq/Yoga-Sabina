import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'
import { getLocalUser } from '@/lib/auth/server'

// GET - Fetch chat messages for a course
export async function GET(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params
        const user = await getLocalUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

        // Check if user has active subscription or purchase to this course
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: user.id,
                courseId,
                status: 'ACTIVE',
                endsAt: { gt: new Date() }
            }
        })

        const purchase = await prisma.purchase.findFirst({
            where: {
                userId: user.id,
                courseId,
                status: 'PAID'
            }
        })

        if (!subscription && !purchase && !isAdmin) {
            return NextResponse.json({ error: 'No active subscription or purchase' }, { status: 403 })
        }

        // Fetch messages with user info
        const messages = await prisma.courseChat.findMany({
            where: { courseId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: 100 // Last 100 messages
        })

        return NextResponse.json({ success: true, messages })
    } catch (error: any) {
        console.error('Error fetching chat messages:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - Send a chat message
export async function POST(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params
        const body = await req.json()
        const { message } = body

        if (!message || message.trim().length === 0) {
            return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
        }

        const user = await getLocalUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

        // Check if user has active subscription or purchase
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: user.id,
                courseId,
                status: 'ACTIVE',
                endsAt: { gt: new Date() }
            }
        })

        const purchase = await prisma.purchase.findFirst({
            where: {
                userId: user.id,
                courseId,
                status: 'PAID'
            }
        })

        if (!subscription && !purchase && !isAdmin) {
            return NextResponse.json({ error: 'No active subscription or purchase' }, { status: 403 })
        }

        // Create message
        const chatMessage = await prisma.courseChat.create({
            data: {
                courseId,
                userId: user.id,
                message: message.trim()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        return NextResponse.json({ success: true, message: chatMessage })
    } catch (error: any) {
        console.error('Error sending chat message:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
