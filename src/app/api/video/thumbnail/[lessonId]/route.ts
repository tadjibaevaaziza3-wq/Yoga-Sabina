import { NextRequest, NextResponse } from 'next/server';
import { getLocalUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { bucket } from '@/lib/gcs/config';

/**
 * Video Proxy for Thumbnail Generation
 * 
 * Streams the first few MB of a video through our own server so the browser
 * can load it without CORS issues and capture a frame using canvas.
 * 
 * Only streams the first 3MB — enough to decode a keyframe for thumbnail.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const user = await getLocalUser();
        if (!user) {
            console.log('[Thumbnail] Unauthorized - no user session');
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { lessonId } = await params;
        console.log('[Thumbnail] Request for lesson:', lessonId);

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { id: true, videoUrl: true }
        });

        console.log('[Thumbnail] Lesson found:', lesson ? `id=${lesson.id}, videoUrl=${lesson.videoUrl}` : 'NOT FOUND');

        if (!lesson || !lesson.videoUrl) {
            return new NextResponse('Not found', { status: 404 });
        }

        // videoUrl may be a full GCS URL like:
        // https://storage.googleapis.com/bucket-name/path/to/file.mp4
        // OR just a relative path like: path/to/file.mp4
        // Extract just the file path for bucket.file()
        let filePath = lesson.videoUrl;
        try {
            const url = new URL(lesson.videoUrl);
            // Remove leading slash and bucket name from pathname
            // URL pathname: /bucket-name/file.mp4 → file.mp4
            const pathParts = url.pathname.split('/').filter(Boolean);
            if (pathParts.length > 1) {
                // Skip bucket name (first segment)
                filePath = pathParts.slice(1).join('/');
            } else if (pathParts.length === 1) {
                filePath = pathParts[0];
            }
        } catch {
            // Not a URL, use as-is (it's already a path)
        }
        console.log('[Thumbnail] Resolved file path:', filePath);

        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        console.log('[Thumbnail] GCS file exists:', exists);
        if (!exists) {
            return new NextResponse('Video file not found in storage', { status: 404 });
        }

        // Stream only the first 3MB for thumbnail generation
        const maxBytes = 3 * 1024 * 1024;
        const readStream = file.createReadStream({ start: 0, end: maxBytes - 1 });

        const chunks: Buffer[] = [];
        for await (const chunk of readStream) {
            chunks.push(Buffer.from(chunk));
        }
        const videoBuffer = Buffer.concat(chunks);

        return new NextResponse(videoBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Length': videoBuffer.length.toString(),
                'Cache-Control': 'public, max-age=86400', // cache 24 hours
                'Access-Control-Allow-Origin': '*',
            }
        });

    } catch (error: any) {
        console.error('Video proxy error:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
