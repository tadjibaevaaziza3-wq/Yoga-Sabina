import { NextRequest, NextResponse } from 'next/server';
import { getUploadUrl } from '@/lib/gcs/upload-manager';
import { getLocalUser } from '@/lib/auth/server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileName, contentType } = await request.json();

        if (!fileName || !contentType) {
            return NextResponse.json({ error: 'Missing fileName or contentType' }, { status: 400 });
        }

        // Allowed types
        const allowedTypes = [
            'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a',
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg', 'image/png', 'image/webp'
        ];

        // Basic check (can be expanded)
        if (!allowedTypes.includes(contentType) && !contentType.startsWith('image/') && !contentType.startsWith('audio/')) {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        const url = await getUploadUrl(fileName, contentType);
        const bucketName = process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza';
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        return NextResponse.json({ url, publicUrl });
    } catch (error: any) {
        console.error('Failed to generate upload URL:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
