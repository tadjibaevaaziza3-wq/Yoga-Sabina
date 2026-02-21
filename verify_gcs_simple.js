const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

async function verify() {
    console.log("Verifying GCS using SIMPLE string replacement...");

    // Read .env directly to see what we actually have
    const envContent = fs.readFileSync('.env', 'utf8');
    const keyLine = envContent.split('\n').find(l => l.startsWith('GCS_PRIVATE_KEY='));
    let rawKey = keyLine.replace('GCS_PRIVATE_KEY=', '').trim();

    if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
        rawKey = rawKey.substring(1, rawKey.length - 1);
    }

    const privateKey = rawKey.replace(/\\n/g, '\n');

    console.log("Key Start:", JSON.stringify(privateKey.substring(0, 50)));

    const storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
        credentials: {
            client_email: process.env.GCS_CLIENT_EMAIL,
            private_key: privateKey,
        },
    });

    try {
        const bucketName = process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza';
        console.log(`Checking bucket: ${bucketName} in project ${process.env.GCS_PROJECT_ID}`);

        const bucket = storage.bucket(bucketName);
        // Skip existence check to see if signing works (since we know credentials are good)
        // const [exists] = await bucket.exists(); 
        // console.log(`Bucket exists? ${exists}`);

        console.log("Attempting to sign URL without checking bucket metadata...");
        const [url] = await bucket.file('test-blind.jpg').getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000,
            contentType: 'image/jpeg',
        });
        console.log("✅ SUCCESS! Signed URL generated:", url.substring(0, 50) + "...");

    } catch (e) {
        console.error("❌ FAILED:", e.message);
        // If it's the unsupported error, we'll see it here
    }
}

verify();
