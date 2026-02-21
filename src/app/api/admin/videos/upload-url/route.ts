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

        // Security check: Only allow video formats
        if (!contentType.startsWith('video/')) {
            return NextResponse.json({ error: 'Only video files are allowed' }, { status: 400 });
        }

        const url = await getUploadUrl(fileName, contentType);
        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Failed to generate upload URL:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
