const { Storage } = require('@google-cloud/storage');
const path = require('path');

async function checkBucket() {
    try {
        const storage = new Storage({
            projectId: 'ai-telco-forecast',
            keyFilename: path.join(require('os').homedir(), 'Downloads', 'ai-telco-forecast-28a33811ae5f.json')
        });

        const bucket = storage.bucket('yoga_antigravity');
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
