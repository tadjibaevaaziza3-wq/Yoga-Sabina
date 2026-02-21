import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'

// GET - Get user's progress for a lesson
export async function GET(
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch progress
        const progress = await prisma.enhancedVideoProgress.findUnique({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId
                }
            }
        })

        return NextResponse.json({ success: true, progress })
    } catch (error: any) {
        console.error('Error fetching progress:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - Update user's progress for a lesson
export async function POST(
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params
        const body = await req.json()
        const { progress, duration, completed, preferredQuality, preferredSpeed, preferredAudio } = body

        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Upsert progress
        const videoProgress = await prisma.enhancedVideoProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId
                }
            },
            update: {
                progress: progress !== undefined ? progress : undefined,
                duration: duration !== undefined ? duration : undefined,
                completed: completed !== undefined ? completed : undefined,
                preferredQuality: preferredQuality || undefined,
                preferredSpeed: preferredSpeed !== undefined ? preferredSpeed : undefined,
                preferredAudio: preferredAudio || undefined,
                lastWatched: new Date()
            },
            create: {
                userId: user.id,
                lessonId,
                progress: progress || 0,
                duration: duration || 0,
                completed: completed || false,
                preferredQuality: preferredQuality || 'AUTO',
                preferredSpeed: preferredSpeed || 1.0,
                preferredAudio: preferredAudio || null
            }
        })

        return NextResponse.json({ success: true, progress: videoProgress })
    } catch (error: any) {
        console.error('Error updating progress:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
