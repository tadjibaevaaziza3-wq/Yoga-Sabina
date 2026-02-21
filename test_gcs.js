
const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testGCS() {
    console.log('--- GCS Direct Upload Test ---');

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
        'gen-lang-client-0720351345',
        'baxtli-men-assets'
    ];

    for (const bucketName of bucketsToTest) {
        console.log(`\nTesting bucket: ${bucketName}`);
        try {
            const bucket = storage.bucket(bucketName);
            const fileName = `test-upload-${Date.now()}.txt`;
            const file = bucket.file(fileName);

            await file.save('Hello from test script', {
                metadata: { contentType: 'text/plain' }
            });
            console.log(`✅ Successfully uploaded to ${bucketName}/${fileName}`);
            await file.delete();
        } catch (error) {
            console.error(`❌ Failed for bucket ${bucketName}:`, error.message);
        }
    }
}

testGCS();
