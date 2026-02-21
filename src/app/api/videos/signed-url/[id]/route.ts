import { NextRequest, NextResponse } from 'next/server';
import { getLocalUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { bucket } from '@/lib/gcs/config';

/**
 * Secure Signed-URL Generator
 * Validates user session and subscription status before granting access to private GCS media.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getLocalUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // 1. Fetch the asset/lesson to get the file name
        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: { course: true }
        });

        if (!lesson || !lesson.videoUrl) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        // 2. Validate Subscription
        const now = new Date();
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: user.id,
                courseId: lesson.courseId,
                status: 'ACTIVE',
                endsAt: { gt: now }
            }
        });

        // 3. Allow access if subscription is active OR if lesson is free
        if (!subscription && !lesson.isFree) {
            return NextResponse.json({
                error: 'Subscription required',
                needsRenewal: true
            }, { status: 403 });
        }

        // 4. Generate GCS Signed URL
        const fileName = lesson.videoUrl; // Assuming videoUrl stores the GCS file name/path
        const file = bucket.file(fileName);

        const [exists] = await file.exists();
        if (!exists) {
            console.error(`GCS File not found: ${fileName}`);
            return NextResponse.json({ error: 'Media file missing' }, { status: 410 });
        }

        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 30 * 60 * 1000, // 30 minutes
        });

        // 5. Check for simultaneous streams (Exclusive to Baxtli Men)
        const { reserveStream } = await import('@/lib/security/device-management')
        const deviceId = request.headers.get('x-device-id') || 'unknown-web-client'
        const canStream = await reserveStream(user.id, deviceId)

        if (!canStream) {
            return NextResponse.json({
                success: false,
                error: 'STREAM_BUSY',
                message: 'Account is already streaming on another device.'
            }, { status: 409 })
        }

        // 6. Log Access for security auditing
        await prisma.videoAccessLog.create({
            data: {
                userId: user.id,
                lessonId: lesson.id,
                ip: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown',
            }
        });

        return NextResponse.json({
            success: true,
            url,
            watermark: {
                userId: user.id,
                phone: user.phone || 'N/A'
            }
        });

    } catch (error: any) {
        console.error('Signed URL Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
