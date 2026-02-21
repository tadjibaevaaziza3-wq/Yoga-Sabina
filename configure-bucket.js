const { Storage } = require('@google-cloud/storage');
const path = require('path');

async function configureBucket() {
    try {
        const storage = new Storage({
            projectId: 'ai-telco-forecast',
            keyFilename: path.join(require('os').homedir(), 'Downloads', 'ai-telco-forecast-28a33811ae5f.json')
        });

        const bucket = storage.bucket('yoga_antigravity');

        console.log('1. Setting Public Access Prevention to "unspecified"...');
        await bucket.setMetadata({
            iamConfiguration: {
                publicAccessPrevention: 'unspecified'
            }
        });

        console.log('2. Setting CORS rules...');
        await bucket.setCorsConfiguration([
            {
                maxAgeSeconds: 3600,
                method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                origin: ['*'],
                responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'x-goog-resumable'],
            }
        ]);

        console.log('3. Making bucket public (allUsers = roles/storage.objectViewer)...');
        await bucket.iam.setPolicy({
            bindings: [
                {
                    role: 'roles/storage.objectViewer',
                    members: ['allUsers']
                }
            ]
        });

        console.log('Bucket configured successfully!');

        // Output new status
        const [metadata] = await bucket.getMetadata();
        console.log('New Public Access Prevention:', metadata.iamConfiguration?.publicAccessPrevention);
        console.log('New CORS rules:', JSON.stringify(metadata.cors, null, 2));

    } catch (e) {
        console.error('Error configuring bucket:', e);
    }
}
configureBucket();
