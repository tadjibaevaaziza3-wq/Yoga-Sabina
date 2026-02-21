
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// Simple .env parser since we can't rely on dotenv flow in standalone easily if not installed/configured
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let value = match[2].trim();
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                env[match[1].trim()] = value;
            }
        });
        return env;
    } catch (e) {
        console.error('Could not load .env file', e);
        return {};
    }
}

const env = loadEnv();

const projectId = env.GCS_PROJECT_ID || 'gen-lang-client-0720351345';
const clientEmail = env.GCS_CLIENT_EMAIL || 'baxtli-men@gen-lang-client-0720351345.iam.gserviceaccount.com';
const privateKey = (env.GCS_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!privateKey) {
    console.error('GCS_PRIVATE_KEY not found in .env');
    process.exit(1);
}

const storage = new Storage({
    projectId,
    credentials: {
        client_email: clientEmail,
        private_key: privateKey,
    },
});

async function configureCors() {
    const bucketName = env.GCS_BUCKET_NAME || 'antigravity-videos-aziza';
    console.log(`Configuring CORS for bucket: ${bucketName}`);

    const bucket = storage.bucket(bucketName);

    const corsConfiguration = [
        {
            maxAgeSeconds: 3600,
            method: ['GET', 'PUT', 'POST', 'HEAD', 'DELETE', 'OPTIONS'],
            origin: ['*'],
            responseHeader: ['Content-Type', 'Authorization', 'Content-Range', 'Access-Control-Allow-Origin', 'x-goog-resumable'],
        },
    ];

    try {
        await bucket.setCorsConfiguration(corsConfiguration);
        console.log(`SUCCESS: CORS configuration updated for bucket ${bucketName}`);

        // Verify
        const [metadata] = await bucket.getMetadata();
        console.log('Current CORS config:', JSON.stringify(metadata.cors, null, 2));

    } catch (error) {
        console.error('Error configuring CORS:', error);
        process.exit(1);
    }
}

configureCors();
