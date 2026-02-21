const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const rawPrivateKey = process.env.GCS_PRIVATE_KEY || '';

// Best-effort cleaning logic
let cleanedKey = rawPrivateKey.trim();
if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
    cleanedKey = cleanedKey.substring(1, cleanedKey.length - 1);
}
cleanedKey = cleanedKey.replace(/\\n/g, '\n');

const keyFileContent = {
    type: "service_account",
    project_id: process.env.GCS_PROJECT_ID,
    private_key_id: "unknown", // Not strictly required for basic auth
    private_key: cleanedKey,
    client_email: process.env.GCS_CLIENT_EMAIL,
    client_id: "unknown",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GCS_CLIENT_EMAIL)}`
};

fs.writeFileSync('gcs-key-temp.json', JSON.stringify(keyFileContent, null, 2));
console.log('✅ Created gcs-key-temp.json');
