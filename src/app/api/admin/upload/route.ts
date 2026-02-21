import { NextRequest, NextResponse } from 'next/server';
import { bucket } from '@/lib/gcs/config';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';

// Removed duplicate initialization
// const bucketName = process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

/**
 * POST /api/admin/upload
 * 
 * Replaces Supabase Storage with Google Cloud Storage.
 * Supports:
 * - Videos (bucket: videos -> GCS 'videos/' folder)
 * - Images (bucket: assets -> GCS 'assets/' folder)
 */
export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const targetFolder = formData.get('bucket') as string || 'assets'; // 'videos' or 'assets'
        const pathPrefix = formData.get('path') as string || '';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${sanitizedName}`;

        // Construct full GCS path
        // e.g., 'assets/images/my-image.jpg' or 'videos/my-video.mp4'
        const fullPath = pathPrefix
            ? `${targetFolder}/${pathPrefix}/${fileName}`
            : `${targetFolder}/${fileName}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const gcsFile = bucket.file(fullPath);

        // Upload to GCS
        await gcsFile.save(buffer, {
            contentType: file.type,
            resumable: false, // Simple upload for images/small files
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });

        // Make publicly accessible (if your bucket allows public reads or you use signed URLs)
        // For assets like images, we usually want them public.
        // For videos, we might want them private (handled by signed URLs skill), but this endpoint represents general file upload.
        // Assuming 'assets' are public-read. 
        // If not, you might need: await gcsFile.makePublic(); 

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fullPath}`;

        return NextResponse.json({
            success: true,
            file: {
                path: fullPath,
                fullPath: fullPath,
                bucket: targetFolder,
                publicUrl: publicUrl,
                size: file.size,
                type: file.type,
            },
        });

    } catch (error: any) {
        console.error('Error uploading to GCS:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/upload
 * 
 * Delete file from GCS
 */
export async function DELETE(request: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { bucket: targetFolder, path } = body;

        // Note: The client probably sends 'path' as the relative path from the bucket root or just the filename?
        // In the POST response above, 'path' is the full path. Let's assume input 'path' is the full object name.
        if (!path) {
            return NextResponse.json(
                { success: false, error: 'Path required' },
                { status: 400 }
            );
        }

        await bucket.file(path).delete();

        return NextResponse.json({
            success: true,
            message: 'File deleted successfully',
        });

    } catch (error: any) {
        console.error('Error deleting from GCS:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
