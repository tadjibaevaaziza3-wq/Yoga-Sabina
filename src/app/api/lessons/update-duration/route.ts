import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocalUser } from '@/lib/auth/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * POST /api/lessons/update-duration
 * Auto-updates lesson duration when the video player detects it from metadata.
 * Only updates if the current duration is 0 or null (to avoid overwriting manual entries).
 */
export async function POST(request: NextRequest) {
    try {
        // Authenticate
        const supabase = await createServerClient();
        const { data, error: authError } = await supabase.auth.getUser();
        let userId: string | null = data?.user?.id || null;

        if (authError || !userId) {
            const localUser = await getLocalUser();
            userId = localUser?.id || null;
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { lessonId, duration } = body;

        if (!lessonId || typeof duration !== 'number' || duration <= 0) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Only update if duration is currently 0 or null
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { duration: true }
        });

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        if (lesson.duration && lesson.duration > 0) {
            // Duration already set, skip (don't overwrite manual entries)
            return NextResponse.json({ success: true, updated: false });
        }

        await prisma.lesson.update({
            where: { id: lessonId },
            data: { duration: Math.floor(duration) }
        });

        return NextResponse.json({ success: true, updated: true, duration: Math.floor(duration) });

    } catch (error) {
        console.error('[update-duration] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
