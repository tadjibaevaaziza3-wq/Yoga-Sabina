
const http = require('http');

const url = 'http://localhost:3000/uz/tma';

http.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const asosiyIndex = data.indexOf('Asosiy');

        console.log('--- Context Debug ---');
        if (asosiyIndex !== -1) {
            console.log('Found "Asosiy" at index:', asosiyIndex);
            // Print 100 chars before and after
            const start = Math.max(0, asosiyIndex - 100);
            const end = Math.min(data.length, asosiyIndex + 100);
            console.log('Context:\n', data.substring(start, end));
        } else {
            console.log('"Asosiy" NOT found.');
        }

        const orqagaIndex = data.indexOf('Orqaga');
        if (orqagaIndex !== -1) {
            console.log('Found "Orqaga" at index:', orqagaIndex);
        } else {
            console.log('"Orqaga" NOT found.');
        }
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});
