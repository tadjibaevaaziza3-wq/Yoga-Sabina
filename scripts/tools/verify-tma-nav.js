
const http = require('http');

const url = 'http://localhost:3000/uz/tma';

http.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const hasBack = data.includes('Orqaga');
        const hasMain = data.includes('Asosiy');
        const hasFooter = data.includes('©') && data.includes('BAXTLI MEN');

        console.log('--- TMA Verification ---');
        console.log('Has "Orqaga" button:', hasBack);
        console.log('Has "Asosiy" button:', hasMain);
        console.log('Has Footer (Should be FALSE):', hasFooter);

        if (hasBack && hasMain && !hasFooter) {
            console.log('SUCCESS: TMA changes verified.');
            process.exit(0);
        } else {
            console.log('FAILURE: Verification failed.');
            process.exit(1);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching page:', err.message);
    process.exit(1);
});
