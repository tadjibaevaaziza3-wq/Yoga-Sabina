
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

async function testGCS() {
    console.log('--- GCS Multi-Project Test (Using keyFilename) ---');

    const keysToTest = [
        'c:/Users/user/Downloads/gen-lang-client-0720351345-49bd89adcf63.json',
        'c:/Users/user/Documents/yoga/baxtli-men/gcs-key-temp.json'
    ];

    for (const keyPath of keysToTest) {
        if (!fs.existsSync(keyPath)) {
            console.log(`\nSkipping ${keyPath} (not found)`);
            continue;
        }

        console.log(`\nTesting Key: ${keyPath}`);
        try {
            const storage = new Storage({ keyFilename: keyPath });
            const [buckets] = await storage.getBuckets();
            console.log('Available buckets:', buckets.map(b => b.name));

            for (const bucket of buckets) {
                console.log(`Testing write access to ${bucket.name}...`);
                try {
                    const file = bucket.file(`test-${Date.now()}.txt`);
                    await file.save('test', { resumable: false });
                    console.log(`- ✅ Write success!`);
                    await file.delete();
                } catch (e) {
                    console.log(`- ❌ Write failed: ${e.message}`);
                }
            }
        } catch (error) {
            console.error('Failed to list buckets:', error.message);
        }
    }
}

testGCS();
