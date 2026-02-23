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

        // Security check: Allow video, audio, and common document formats
        const allowedPrefixes = ['video/', 'audio/', 'image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'];
        const isAllowed = allowedPrefixes.some(prefix => contentType.startsWith(prefix)) ||
            ['application/zip', 'application/x-rar-compressed'].includes(contentType);

        if (!isAllowed) {
            return NextResponse.json({ error: 'Faqat video, audio va hujjat fayllari ruxsat etilgan' }, { status: 400 });
        }

        const { url, publicUrl } = await getUploadUrl(fileName, contentType);
        return NextResponse.json({ url, publicUrl });
    } catch (error: any) {
        console.error('Failed to generate upload URL:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
