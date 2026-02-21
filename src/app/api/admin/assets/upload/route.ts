import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/gcs/upload-manager';
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
        // if (!await isAdmin()) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const path = formData.get('path') as string || 'uploads';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${path}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const contentType = file.type;

        console.log('Attempting upload to GCS...');
        console.log('Filename:', fileName);
        console.log('ContentType:', contentType);

        const url = await uploadFile(buffer, fileName, contentType);

        console.log('Upload successful! URL:', url);
        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Upload failed with error details:', {
            message: error.message,
            code: error.code,
            errors: error.errors,
            stack: error.stack
        });
        return NextResponse.json({
            error: error.message || String(error),
            code: error.code,
            details: error.errors,
            stack: error.stack
        }, { status: 500 });
    }
}
