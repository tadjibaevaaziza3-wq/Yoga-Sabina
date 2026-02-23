import { Storage } from '@google-cloud/storage';

// Lazy initialization to prevent build crashes when env vars are missing
let _storage: Storage | null = null;
let _bucket: ReturnType<Storage['bucket']> | null = null;

function getStorage(): Storage {
    if (!_storage) {
        if (!process.env.GCS_PROJECT_ID || !process.env.GCS_CLIENT_EMAIL || !process.env.GCS_PRIVATE_KEY) {
            throw new Error('Missing GCS environment variables (GCS_PROJECT_ID, GCS_CLIENT_EMAIL, GCS_PRIVATE_KEY)');
        }

        const rawPrivateKey = process.env.GCS_PRIVATE_KEY || '';
        const privateKey = rawPrivateKey
            .replace(/^["']|["']$/g, '')
            .replace(/\\n/g, '\n')
            .trim();

        _storage = new Storage({
            projectId: process.env.GCS_PROJECT_ID,
            credentials: {
                client_email: process.env.GCS_CLIENT_EMAIL,
                private_key: privateKey,
            },
        });
    }
    return _storage;
}

function getBucket() {
    if (!_bucket) {
        _bucket = getStorage().bucket(process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza');
    }
    return _bucket;
}

// Export as getters so they are lazily initialized on first use, not at import time
export const storage = new Proxy({} as Storage, {
    get: (_, prop) => {
        const s = getStorage();
        const val = (s as any)[prop];
        return typeof val === 'function' ? val.bind(s) : val;
    }
});

export const bucket = new Proxy({} as ReturnType<Storage['bucket']>, {
    get: (_, prop) => {
        const b = getBucket();
        const val = (b as any)[prop];
        return typeof val === 'function' ? val.bind(b) : val;
    }
});
