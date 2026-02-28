/**
 * Admin-only endpoint to generate a short-lived signed URL for video thumbnail preview.
 * GET /api/admin/video-thumbnail?url=<videoUrl>
 * 
 * No subscription checks — admin only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { bucket } from '@/lib/gcs/config';

function extractPathFromUrl(url: string): string {
    try {
        if (!url.startsWith('http')) {
            return decodeURIComponent(url);
        }
        const urlObj = new URL(url);
        if (urlObj.hostname === 'storage.googleapis.com') {
            const parts = urlObj.pathname.split('/');
            return decodeURIComponent(parts.slice(2).join('/'));
        }
        return decodeURIComponent(urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname);
    } catch {
        return url;
    }
}

export async function GET(request: NextRequest) {
    // Admin auth check
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get('admin_session');
    if (!adminCookie?.value) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoUrl = request.nextUrl.searchParams.get('url');
    if (!videoUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const storagePath = extractPathFromUrl(videoUrl);
        const file = bucket.file(storagePath);

        const ext = storagePath.split('.').pop()?.toLowerCase() || '';
        let responseType = 'video/mp4';
        if (ext === 'webm') responseType = 'video/webm';
        else if (ext === 'mov') responseType = 'video/quicktime';

        const [signedUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 5 * 60 * 1000, // 5 minutes — just for thumbnail preview
            responseType,
            responseDisposition: 'inline',
        });

        return NextResponse.json({ signedUrl });
    } catch (error: any) {
        console.error('[admin/video-thumbnail] Error:', error.message);
        return NextResponse.json({ error: 'Failed to generate thumbnail URL' }, { status: 500 });
    }
}
