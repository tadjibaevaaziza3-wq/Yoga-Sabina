import { storage } from './src/lib/gcs/config';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

async function checkBucket() {
    try {
        const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || 'yoga_antigravity');
        const [metadata] = await bucket.getMetadata();
        console.log('Bucket Info:', metadata.name);
        console.log('Location:', metadata.location);
        console.log('Public Access Prevention:', metadata.iamConfiguration?.publicAccessPrevention);
        console.log('CORS rules:', JSON.stringify(metadata.cors, null, 2));
    } catch (e) {
        console.error('Error fetching bucket info', e);
    }
}
checkBucket();
