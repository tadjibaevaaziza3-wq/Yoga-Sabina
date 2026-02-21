
const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testGCS() {
    console.log('--- GCS Detailed Bucket Test ---');

    const rawPrivateKey = process.env.GCS_PRIVATE_KEY || '';
    const privateKey = rawPrivateKey
        .replace(/^["']|["']$/g, '')
        .replace(/\\n/g, '\n')
        .trim();

    const storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
        credentials: {
            client_email: process.env.GCS_CLIENT_EMAIL,
            private_key: privateKey,
        },
    });

    const bucketsToTest = [
        'antigravity-videos-aziza',
        'antigravity-videos-yoga',
        'baxtli-men-assets-v1',
        'baxtli-men-assets'
    ];

    for (const bucketName of bucketsToTest) {
        console.log(`\nTesting bucket: ${bucketName}`);
        try {
            const bucket = storage.bucket(bucketName);
            const [exists] = await bucket.exists();
            console.log(`- Exists: ${exists}`);
            if (exists) {
                // Try a dummy write
                const file = bucket.file(`test-${Date.now()}.txt`);
                await file.save('test', { resumable: false });
                console.log(`- ✅ Write success!`);
                await file.delete();
            }
        } catch (error) {
            console.error(`- ❌ Error: ${error.message}`);
        }
    }
}

testGCS();
