const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');
const crypto = require('crypto');
dotenv.config();

async function verify() {
    console.log("Verifying GCS Signed URL generation with Robust Reconstruction...");

    const rawPrivateKey = process.env.GCS_PRIVATE_KEY || '';

    // EXTREMELY ROBUST RECONSTRUCTION
    // Extract everything between the headers, ignoring all whitespace/escapes
    const match = rawPrivateKey.match(/-----BEGIN PRIVATE KEY-----([\s\S]*)-----END PRIVATE KEY-----/);
    let privateKey = '';

    if (match) {
        // Remove all whitespace, including escaped \n or real \n
        const content = match[1].replace(/\\n/g, '').replace(/\s/g, '');
        // Rebuild with real newlines every 64 chars (standard PEM)
        privateKey = `-----BEGIN PRIVATE KEY-----\n${content.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----\n`;
    } else {
        console.error("❌ Headers not found in rawPrivateKey!");
        return;
    }

    console.log("Reconstructed Key Sample (End):", JSON.stringify(privateKey.substring(privateKey.length - 40)));

    const storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
        credentials: {
            client_email: process.env.GCS_CLIENT_EMAIL,
            private_key: privateKey,
        },
    });

    try {
        const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza');
        const [url] = await bucket.file('test.jpg').getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000,
            contentType: 'image/jpeg',
        });
        console.log("✅ SUCCESS! Signed URL generated:", url.substring(0, 50) + "...");
    } catch (e) {
        console.error("❌ FAILED:", e.message);
    }
}

verify();
