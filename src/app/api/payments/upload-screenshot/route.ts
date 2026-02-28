import { NextRequest, NextResponse } from 'next/server';
import { getUploadUrl } from '@/lib/gcs/upload-manager';
import { getLocalUser } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
    try {
        // Allow any authenticated user (not just admin)
        const user = await getLocalUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileName, contentType } = await request.json();

        if (!fileName || !contentType) {
            return NextResponse.json({ error: 'Missing fileName or contentType' }, { status: 400 });
        }

        // Only allow images for payment screenshots
        if (!contentType.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        // Max 5MB check is done client-side, but we prefix with payments/ for organization
        const safeName = `payments/${user.id}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '-')}`;

        const result = await getUploadUrl(safeName, contentType);
        const bucketName = process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza';
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${safeName}`;
        return NextResponse.json({ url: result.url, publicUrl });
    } catch (error: any) {
        console.error('Payment upload URL error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
