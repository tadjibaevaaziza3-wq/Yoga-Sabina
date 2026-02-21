const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

async function createBucket() {
    console.log("Attempting to create GCS bucket...");

    // Read .env directly to ensure we have the cleaned key
    const envContent = fs.readFileSync('.env', 'utf8');
    const keyLine = envContent.split('\n').find(l => l.startsWith('GCS_PRIVATE_KEY='));
    let rawKey = keyLine.replace('GCS_PRIVATE_KEY=', '').trim();
    if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
        rawKey = rawKey.substring(1, rawKey.length - 1);
    }
    const privateKey = rawKey.replace(/\\n/g, '\n');

    const storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
        credentials: {
            client_email: process.env.GCS_CLIENT_EMAIL,
            private_key: privateKey,
        },
    });

    // Try a unique name based on the project to avoid conflicts if global names are taken
    const bucketName = 'baxtli-men-assets-v1';

    try {
        const [bucket] = await storage.createBucket(bucketName, {
            location: 'US', // or ASIA-SOUTHEAST1 given your previous DB location? Let's stick to US for cheapest/standard unless requested
            cors: [
                {
                    origin: ['*'], // For development/production ease, or specify domains
                    method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                    responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
                    maxAgeSeconds: 3600
                }
            ],
            standard: true
        });

        console.log(`✅ Bucket ${bucket.name} created.`);

        // Make it public for reading course images? 
        // Usually course covers are public. 
        // Let's make the bucket uniform bucket level access = true (default now)
        // And maybe make it public readable?
        // For now, let's just make sure it exists. 

        console.log(`Bucket ${bucketName} is ready.`);

    } catch (e) {
        if (e.code === 409) {
            console.log(`⚠️ Bucket ${bucketName} already exists (maybe we created it or someone else did). We'll use it.`);
        } else {
            console.error("❌ Failed to create bucket:", e.message);
            // Try a fallback with random suffix
            const fallbackName = `baxtli-men-${Date.now()}`;
            console.log(`Trying fallback: ${fallbackName}`);
            try {
                const [bucket] = await storage.createBucket(fallbackName, {
                    cors: [{ origin: ['*'], method: ['GET', 'PUT', 'POST'] }]
                });
                console.log(`✅ Fallback bucket ${bucket.name} created.`);
                console.log(`PLEASE UPDATE .env WITH: GCS_BUCKET_NAME=${bucket.name}`);
                return;
            } catch (err) {
                console.error("❌ Fallback failed too:", err.message);
            }
        }
    }
}

createBucket();
