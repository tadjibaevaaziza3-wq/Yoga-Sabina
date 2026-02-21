import { Storage } from '@google-cloud/storage';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const projectId = process.env.GCS_PROJECT_ID;
const clientEmail = process.env.GCS_CLIENT_EMAIL;
// Handle both string literal "\n" and actual newlines
// Also handle potential double escaping from .env parser
const privateKey = process.env.GCS_PRIVATE_KEY
    ?.replace(/\\n/g, '\n')
    ?.replace(/"/g, ''); // Remove any potential surrounding quotes if they were included in the value
const bucketName = process.env.GCS_UPLOAD_BUCKET || 'antigravity-videos-yoga';

console.log('--- GCS Configuration Check ---');
console.log(`Project ID: ${projectId}`);
console.log(`Client Email: ${clientEmail}`);
console.log(`Bucket Name: ${bucketName}`);
console.log(`Private Key Present: ${!!privateKey}`);

if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing GCS environment variables');
    process.exit(1);
}

const storage = new Storage({
    projectId,
    credentials: {
        client_email: clientEmail,
        private_key: privateKey,
    },
});

async function verify() {
    try {
        console.log('\nTesting Signed URL generation...');
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(`test-verification-${Date.now()}.txt`);

        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'resumable',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: 'text/plain',
        });

        console.log('✅ Signed URL generated successfully!');
        console.log(`URL: ${url.substring(0, 50)}...`);
    } catch (error: any) {
        console.error('❌ Verification Failed:', error.message);
        process.exit(1);
    }
}

verify();
