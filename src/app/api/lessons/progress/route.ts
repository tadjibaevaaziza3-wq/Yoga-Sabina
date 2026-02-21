import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@/lib/supabase/server';
import { checkRateLimit, getResetTime } from '@/lib/security/rate-limit';


export async function GET(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        if (!checkRateLimit(`progress:${ip}`)) {
            return NextResponse.json({
                success: false,
                error: 'Too many requests. Please try again later.',
                retryAfter: getResetTime(`progress:${ip}`)
            }, { status: 429 })
        }

        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const lessonId = searchParams.get('lessonId');

        if (!lessonId) {
            return NextResponse.json({ success: false, error: 'Lesson ID is required' }, { status: 400 });
        }

        const progress = await prisma.enhancedVideoProgress.findUnique({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId: lessonId,
                },
            },
        });

        return NextResponse.json({ success: true, progress });
    } catch (error: any) {
        console.error('Error fetching progress:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        if (!checkRateLimit(`progress:${ip}`)) {
            return NextResponse.json({
                success: false,
                error: 'Too many requests. Please try again later.',
                retryAfter: getResetTime(`progress:${ip}`)
            }, { status: 429 })
        }

        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { lessonId, watchedSeconds, totalSeconds, completed, preferredQuality, preferredSpeed } = await request.json();

        if (!lessonId) {
            return NextResponse.json({ success: false, error: 'Lesson ID is required' }, { status: 400 });
        }

        // Upsert progress using enhanced model
        const progress = await prisma.enhancedVideoProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId: lessonId,
                },
            },
            update: {
                progress: Math.floor(watchedSeconds),
                duration: Math.floor(totalSeconds),
                completed: completed || (watchedSeconds / totalSeconds > 0.9),
                preferredQuality: preferredQuality || 'AUTO',
                preferredSpeed: preferredSpeed || 1.0,
                lastWatched: new Date(),
            },
            create: {
                userId: user.id,
                lessonId: lessonId,
                progress: Math.floor(watchedSeconds),
                duration: Math.floor(totalSeconds),
                completed: completed || (watchedSeconds / totalSeconds > 0.9),
                preferredQuality: preferredQuality || 'AUTO',
                preferredSpeed: preferredSpeed || 1.0,
            },
        });

        // GAMIFICATION HOOK
        try {
            const { GamificationService } = await import('@/lib/gamification/gamification-service');
            await GamificationService.updateStreaks(user.id);
            const newAchievements = await GamificationService.checkAchievements(user.id);

            return NextResponse.json({ success: true, progress, newAchievements });
        } catch (gError) {
            console.error('Gamification error:', gError);
            // Don't fail the request if gamification fails
            return NextResponse.json({ success: true, progress });
        }
    } catch (error: any) {
        console.error('Error saving progress:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
