/**
 * API Route: Get Signed URL for Video Asset
 * 
 * POST /api/video/get-signed-url
 * 
 * Security checks:
 * 1. User is authenticated
 * 2. User has accepted latest user agreement
 * 3. User has active subscription to course
 * 4. Rate limit not exceeded
 * 5. Log access attempt
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getLocalUser } from '@/lib/auth/server';
import { generateSignedUrl, logVideoAccess } from '@/lib/security/signed-urls';
import { checkRateLimit, getRemainingRequests, getResetTime } from '@/lib/security/rate-limit';
import { generateWatermarkText } from '@/lib/security/watermark';
import { checkSessionLimit } from '@/lib/security/session-limiter';
import { z } from 'zod';

const requestSchema = z.object({
    assetId: z.string().optional().nullable(),
    lessonId: z.string().min(1),
    type: z.enum(['video', 'audio']).optional().default('video'),
});

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createServerClient();
        const { data, error: authError } = await supabase.auth.getUser();
        let user: { id: string, email?: string | null } | null = data?.user || null;

        if (authError || !user) {
            const localUser = await getLocalUser();
            if (localUser) {
                user = { id: localUser.id, email: localUser.email };
            } else {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        // Check concurrent session limit (max 2 devices) — skip if DB unavailable
        try {
            const sessionCheck = await checkSessionLimit(user.id);
            if (!sessionCheck.allowed) {
                return NextResponse.json(
                    {
                        error: 'Too many active sessions',
                        message: `Maximum ${sessionCheck.maxDevices} concurrent sessions allowed. You have ${sessionCheck.activeDevices} active devices.`,
                        activeDevices: sessionCheck.activeDevices,
                        maxDevices: sessionCheck.maxDevices,
                    },
                    { status: 429 }
                );
            }
        } catch (sessionErr) {
            console.warn('[get-signed-url] Session limit check failed, proceeding:', sessionErr instanceof Error ? sessionErr.message : sessionErr);
        }

        // Get request body
        const body = await request.json();
        const validation = requestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validation.error.issues },
                { status: 400 }
            );
        }

        const { assetId, lessonId, type } = validation.data;

        // Get IP address for rate limiting and logging
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Check rate limit
        if (!checkRateLimit(ip)) {
            const resetTime = getResetTime(ip);
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    message: 'Too many video requests. Please try again later.',
                    retryAfter: resetTime,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': resetTime.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': (Date.now() + resetTime * 1000).toString(),
                    },
                }
            );
        }

        // Get user agent and referer for logging
        const userAgent = request.headers.get('user-agent');
        const referer = request.headers.get('referer');

        // Validate referer (prevent hotlinking)
        const allowedOrigins = [
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
            'http://localhost:3000',
        ].filter(Boolean);

        if (referer && !allowedOrigins.some(origin => referer.startsWith(origin!))) {
            return NextResponse.json(
                { error: 'Invalid referer' },
                { status: 403 }
            );
        }

        // Generate signed URL (this also checks subscription and agreement)
        const expiryMinutes = parseInt(process.env.SIGNED_URL_EXPIRY_MINUTES || '30', 10);

        let signedUrlResult;
        try {
            signedUrlResult = await generateSignedUrl(
                assetId || null,
                lessonId,
                user.id,
                expiryMinutes,
                type
            );
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('subscription')) {
                    return NextResponse.json(
                        { error: 'No active subscription', message: 'You need an active subscription to access this content.' },
                        { status: 403 }
                    );
                }
                if (error.message.includes('agreement')) {
                    return NextResponse.json(
                        { error: 'Agreement not accepted', message: 'You must accept the user agreement before accessing videos.' },
                        { status: 403 }
                    );
                }
            }
            throw error;
        }

        // Log access attempt
        await logVideoAccess(
            user.id,
            lessonId,
            assetId || null,
            ip,
            userAgent,
            referer
        );

        // Generate watermark data
        const watermarkData = {
            userId: user.id,
            email: user.email || 'unknown',
            timestamp: new Date().toISOString(),
            text: generateWatermarkText({
                userId: user.id,
                email: user.email || 'unknown',
                timestamp: new Date(),
            }),
        };

        // Return signed URL and watermark data
        return NextResponse.json({
            signedUrl: signedUrlResult.signedUrl,
            expiresAt: signedUrlResult.expiresAt.toISOString(),
            watermarkData,
        }, {
            headers: {
                'X-RateLimit-Remaining': getRemainingRequests(ip).toString(),
            },
        });

    } catch (error) {
        console.error('[get-signed-url] Error:', error);
        if (error instanceof Error) {
            console.error('[get-signed-url] Stack:', error.stack);
        }

        // Detect Prisma connection errors
        const errMsg = error instanceof Error ? error.message : String(error);
        const errCode = (error as any)?.code;
        if (errCode === 'P1001' || errMsg.includes("Can't reach database")) {
            return NextResponse.json(
                { error: 'Service temporarily unavailable', message: 'Database connection issue. Please try again in a moment.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error', details: errMsg },
            { status: 500 }
        );
    }
}
