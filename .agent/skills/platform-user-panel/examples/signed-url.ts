/**
 * GCS Signed URL Generation (v4)
 * For secure, time-limited video access.
 */

import { Storage } from '@google-cloud/storage';

const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

export async function getSignedUrl(fileName) {
    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
    const file = bucket.file(fileName);

    // v4 Signatures
    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 30 * 60 * 1000, // 30 Minutes
    });

    return url;
}
