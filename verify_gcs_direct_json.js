const { Storage } = require('@google-cloud/storage');

async function verify() {
    console.log("Verifying GCS using direct JSON file path...");
    const keyPath = 'c:/Users/user/Downloads/gen-lang-client-0720351345-49bd89adcf63.json';

    // Initialize storage using the key file path
    const storage = new Storage({
        projectId: 'gen-lang-client-0720351345',
        keyFilename: keyPath
    });

    try {
        const bucketName = 'antigravity-videos-aziza'; // Try the old name first, or we can try listing
        console.log(`Using bucket: ${bucketName}`);
        const bucket = storage.bucket(bucketName);

        // Try to LIST files (requires real API call, verifies auth + permissions)
        console.log("Attempting to get bucket metadata (verifies auth + permissions)...");
        const [metadata] = await bucket.getMetadata();
        console.log("✅ SUCCESS! Bucket exists and we have permissions.");
        console.log("Bucket location:", metadata.location);

        // Try signed URL as well
        const [url] = await bucket.file('test-direct.jpg').getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000,
            contentType: 'image/jpeg',
        });
        console.log("✅ SUCCESS! Signed URL generated:", url.substring(0, 50) + "...");

    } catch (e) {
        console.error("❌ FAILED:", e.message);
        if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
    }
}

verify();
