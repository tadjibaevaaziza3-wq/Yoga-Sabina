
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const rawPrivateKey = process.env.GCS_PRIVATE_KEY || '';
const privateKey = rawPrivateKey
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n')
    .trim();

console.log('Project ID:', process.env.GCS_PROJECT_ID);
console.log('Client Email:', process.env.GCS_CLIENT_EMAIL);
console.log('Bucket Name:', process.env.GCS_BUCKET_NAME);
console.log('Key length:', privateKey.length);
console.log('Key start:', privateKey.substring(0, 50));
console.log('Key end:', privateKey.substring(privateKey.length - 50));
