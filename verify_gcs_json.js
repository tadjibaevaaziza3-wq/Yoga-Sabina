const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');
dotenv.config();

async function verify() {
    console.log("Verifying GCS using keyFilename (gcs-key-temp.json)...");

    // Initialize storage using the key file directly
    const storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
        keyFilename: 'gcs-key-temp.json'
    });

    try {
        const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza');
        const [url] = await bucket.file('test-json.jpg').getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000,
            contentType: 'image/jpeg',
        });
        console.log("✅ SUCCESS! Signed URL generated with key file:", url.substring(0, 50) + "...");
    } catch (e) {
        console.error("❌ FAILED with key file:", e.message);
    }
}

verify();
