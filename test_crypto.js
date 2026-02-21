const crypto = require('crypto');
const fs = require('fs');

function test() {
    console.log("Generating fresh RSA key...");
    const { privateKey: freshKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    console.log("Fresh Key Sample:", freshKey.substring(0, 50));
    try {
        crypto.createPrivateKey(freshKey);
        console.log("✅ Freshly generated key is valid!");
    } catch (e) {
        console.log("❌ Freshly generated key is INVALID (system issue?):", e.message);
    }

    // Now analyze the user key from .env
    const content = fs.readFileSync('.env', 'utf8');
    const lines = content.split('\n');
    const keyLine = lines.find(l => l.startsWith('GCS_PRIVATE_KEY='));

    // Extraction logic (robust)
    let raw = content.split('GCS_PRIVATE_KEY=')[1].trim();
    if (raw.startsWith('"')) {
        // Find closing quote
        let endIdx = raw.indexOf('"', 1);
        while (endIdx !== -1 && raw[endIdx - 1] === '\\') {
            endIdx = raw.indexOf('"', endIdx + 1);
        }
        raw = raw.substring(1, endIdx);
    }

    const base64 = raw.replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\\n/g, '')
        .replace(/\s/g, '');

    const buffer = Buffer.from(base64, 'base64');
    console.log('User Key First 16 bytes:', buffer.slice(0, 16).toString('hex'));

    const freshBase64 = freshKey.replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\s/g, '');
    const freshBuf = Buffer.from(freshBase64, 'base64');

    console.log('Fresh Key First 16 bytes:', freshBuf.slice(0, 16).toString('hex'));
}

test();
