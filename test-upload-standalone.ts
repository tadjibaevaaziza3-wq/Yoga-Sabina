import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
dotenv.config();

const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: (process.env.GCS_PRIVATE_KEY || '').replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim(),
    },
});

async function testUpload(bucketName: string) {
    if (!bucketName) return;
    console.log(`Trying direct upload to bucket = ${bucketName}`);
    try {
        const bucket = storage.bucket(bucketName);
        const file = bucket.file('admin-upload-test.txt');
        await file.save('hello test', {
            contentType: 'text/plain',
            metadata: { cacheControl: 'public, max-age=31536000' }
        });
        console.log(`SUCCESS in ${bucketName}`);
    } catch (err: any) {
        console.error(`ERROR in ${bucketName}:`, err.message);
    }
}

// Test direct upload
async function run() {
    // Just test the new bucket from .env
    const bucketNames = [
        process.env.GCS_BUCKET_NAME || 'yoga_antigravity',
        process.env.GCS_UPLOAD_BUCKET || 'yoga_antigravity'
    ];

    for (const b of bucketNames) {
        await testUpload(b);
    }
}
run();
