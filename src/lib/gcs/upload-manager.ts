import { storage } from './config';

/**
 * Generates a signed URL for uploading a file directly to GCS.
 * This uses a resumable upload session for better reliability with large videos.
 */
export async function getUploadUrl(fileName: string, contentType: string) {
    // Use the main bucket name from env, or fallback to the one user created
    const bucketName = process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza';
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    // Generate a signed URL for a resumable upload
    // This does NOT check if the bucket exists, which is good for performance and permission handling
    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType,
    });

    return url;
}

/**
 * Uploads a buffer directly to GCS.
 * internal use for proxy uploads.
 */
export async function uploadFile(buffer: Buffer, fileName: string, contentType: string) {
    const bucketName = process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza';
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    await file.save(buffer, {
        contentType,
        metadata: {
            cacheControl: 'public, max-age=31536000',
        },
    });

    // Make it public explicitly if needed, or rely on bucket settings.
    // Ideally we use signed URLs for private content, but for course covers they might be public.
    // The previous code assumed public access or signed URL access.
    // We'll return the public URL.
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}
