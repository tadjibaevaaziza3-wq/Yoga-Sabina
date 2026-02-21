const fs = require('fs');

function test() {
    console.log("Comparing .env key vs JSON key...");

    // 1. Read .env
    const envContent = fs.readFileSync('.env', 'utf8');
    const keyLine = envContent.split('\n').find(l => l.startsWith('GCS_PRIVATE_KEY='));
    let rawEnvKey = keyLine.replace('GCS_PRIVATE_KEY=', '').trim();
    if (rawEnvKey.startsWith('"') && rawEnvKey.endsWith('"')) {
        rawEnvKey = rawEnvKey.substring(1, rawEnvKey.length - 1);
    }
    const envKey = rawEnvKey.replace(/\\n/g, '\n');

    // 2. Read JSON
    const jsonPath = 'c:/Users/user/Downloads/gen-lang-client-0720351345-49bd89adcf63.json';
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const jsonKey = jsonContent.private_key;

    // 3. Compare
    console.log(`Env Key Length: ${envKey.length}`);
    console.log(`JSON Key Length: ${jsonKey.length}`);

    if (envKey === jsonKey) {
        console.log("✅ Keys are IDENTICAL.");
    } else {
        console.log("❌ Keys are DIFFERENT.");
        for (let i = 0; i < Math.max(envKey.length, jsonKey.length); i++) {
            if (envKey[i] !== jsonKey[i]) {
                console.log(`Difference at index ${i}:`);
                console.log(`Env: ${envKey.charCodeAt(i)} (${JSON.stringify(envKey[i])})`);
                console.log(`JSON: ${jsonKey.charCodeAt(i)} (${JSON.stringify(jsonKey[i])})`);
                break;
            }
        }
    }
}

test();
