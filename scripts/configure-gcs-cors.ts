
import { storage } from '../src/lib/gcs/config';

async function configureCors() {
    const bucketName = process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza';
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
        console.log(`CORS configuration updated for bucket ${bucketName}`);

        // Verify
        const [metadata] = await bucket.getMetadata();
        console.log('Current CORS config:', JSON.stringify(metadata.cors, null, 2));

    } catch (error) {
        console.error('Error configuring CORS:', error);
    }
}

configureCors();
