import { Storage } from '@google-cloud/storage';

if (!process.env.GCS_PROJECT_ID || !process.env.GCS_CLIENT_EMAIL || !process.env.GCS_PRIVATE_KEY) {
    throw new Error('Missing GCS environment variables');
}

// Ensure the private key is properly formatted
const rawPrivateKey = process.env.GCS_PRIVATE_KEY || '';

// Diagnostic logging
console.log('[GCS Config] Runtime raw key length:', rawPrivateKey.length);
console.log('[GCS Config] Runtime raw key sample:', JSON.stringify(rawPrivateKey.substring(0, 50)));

// Clean up the key: remove surrounding quotes and handle escaped newlines
const privateKey = rawPrivateKey
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n')
    .trim();

console.log('[GCS Config] Parsed key length:', privateKey.length);
// console.log('[GCS Config] Parsed key ends with header:', privateKey.endsWith('-----END PRIVATE KEY-----'));

export const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: privateKey,
    },
});

export const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza');
