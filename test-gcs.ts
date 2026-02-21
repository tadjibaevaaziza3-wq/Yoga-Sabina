import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GCS_PROJECT_ID || !process.env.GCS_CLIENT_EMAIL || !process.env.GCS_PRIVATE_KEY) {
    throw new Error('Missing GCS environment variables');
}

const rawPrivateKey = process.env.GCS_PRIVATE_KEY || '';
const privateKey = rawPrivateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim();

const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: privateKey,
    },
});

async function testGCS() {
    try {
        const bucketName = process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza';
        const bucket = storage.bucket(bucketName);
        console.log(`Checking bucket: ${bucketName}`);
        const [exists] = await bucket.exists();
        console.log('Bucket exists:', exists);
        if (exists) {
            const file = bucket.file('test-upload.txt');
            await file.save('hello world', {
                contentType: 'text/plain',
                metadata: { cacheControl: 'public, max-age=31536000' }
            });
            console.log('File saved successfully. Public URL:', `https://storage.googleapis.com/${bucketName}/test-upload.txt`);
        } else {
            console.log("Bucket does not exist or we lack permissions to see it.");
        }
    } catch (err: any) {
        console.error('GCS Error:', err.message, err.code, err.errors);
    }
}
testGCS();
