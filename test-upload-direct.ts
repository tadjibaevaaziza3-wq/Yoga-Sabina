import { storage } from './src/lib/gcs/config';
import dotenv from 'dotenv';
dotenv.config();

async function testUpload(bucketName: string) {
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

async function main() {
    await testUpload('antigravity-videos-aziza');
    await testUpload('antigravity-videos-yoga');
    // also try from env
    if (process.env.GCS_BUCKET_NAME) {
        await testUpload(process.env.GCS_BUCKET_NAME);
    }
}
main();
