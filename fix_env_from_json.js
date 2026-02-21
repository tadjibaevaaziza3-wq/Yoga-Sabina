const fs = require('fs');
const path = require('path');

const jsonPath = 'c:/Users/user/Downloads/gen-lang-client-0720351345-49bd89adcf63.json';
const envPath = '.env';

try {
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Helper to replace or append
    function updateEnv(key, value) {
        const regex = new RegExp(`^${key}=.*`, 'm');
        const newLine = `${key}=${value}`;
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, newLine);
        } else {
            envContent += `\n${newLine}`;
        }
    }

    updateEnv('GCS_PROJECT_ID', jsonContent.project_id);
    updateEnv('GCS_CLIENT_EMAIL', jsonContent.client_email);

    // For private key, we need to handle the string safely
    // The JSON value has literal \n characters (escaped in the JSON string as \\n, but in memory as \n)
    // We want to write it to .env as "Line1\nLine2\n..." with literal \n characters in the file
    // So we need to replace real newlines with \n literals
    const safeKey = jsonContent.private_key.replace(/\n/g, '\\n');
    updateEnv('GCS_PRIVATE_KEY', `"${safeKey}"`);

    // Verify bucket name too - we'll just keep the existing one for now as we don't know the new one
    // But let's log what we did
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Successfully updated .env from JSON file.');
    console.log(`Project ID: ${jsonContent.project_id}`);
    console.log(`Client Email: ${jsonContent.client_email}`);

} catch (e) {
    console.error('❌ Failed to update .env:', e.message);
}
