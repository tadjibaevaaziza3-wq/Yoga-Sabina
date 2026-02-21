
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

async function testGCS() {
    console.log('--- GCS Multi-Project Test ---');

    const keyPath = 'c:/Users/user/Documents/yoga/baxtli-men/gcs-key-temp.json';
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    console.log('Testing Project:', key.project_id);

    const storage = new Storage({
        projectId: key.project_id,
        credentials: {
            client_email: key.client_email,
            private_key: key.private_key,
        },
    });

    try {
        const [buckets] = await storage.getBuckets();
        console.log('Available buckets:', buckets.map(b => b.name));
    } catch (error) {
        console.error('Failed to list buckets:', error.message);
    }

    const testBuckets = ['baxtli-men-assets', 'antigravity-videos-aziza', 'antigravity-videos-yoga'];
    for (const b of testBuckets) {
        try {
            const bucket = storage.bucket(b);
            const [exists] = await bucket.exists();
            console.log(`Bucket "${b}" exists: ${exists}`);
        } catch (e) {
            console.log(`Bucket "${b}" check error: ${e.message}`);
        }
    }
}

testGCS();
