const fs = require('fs');

const content = fs.readFileSync('.env', 'utf8');
const lines = content.split('\n');

const newLines = lines.map(line => {
    if (line.startsWith('GCS_PRIVATE_KEY=')) {
        let value = line.replace('GCS_PRIVATE_KEY=', '').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
        }
        // Replace literal \n with real newlines
        const cleanedValue = value.replace(/\\n/g, '\n');
        // Wrap in quotes with real newlines (standard .env format for multiline)
        return `GCS_PRIVATE_KEY="${cleanedValue}"`;
    }
    return line;
});

fs.writeFileSync('.env', newLines.join('\n'));
console.log('✅ .env reformatted successfully!');
