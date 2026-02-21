
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

async function testGCS() {
    console.log('--- GCS Multi-Project Test (Fixed Key) ---');

    const keyPath = 'c:/Users/user/Documents/yoga/baxtli-men/gcs-key-temp.json';
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    // Fix the key format
    const privateKey = key.private_key.replace(/\\n/g, '\n');

    console.log('Testing Project:', key.project_id);

    const storage = new Storage({
        projectId: key.project_id,
        credentials: {
            client_email: key.client_email,
            private_key: privateKey,
        },
    });

    try {
        const [buckets] = await storage.getBuckets();
        console.log('Available buckets:', buckets.map(b => b.name));
    } catch (error) {
        console.error('Failed to list buckets:', error.message);
    }
}

testGCS();
