const http = require('http');

const putData = JSON.stringify({
    title: 'DoYogaStudios',
    description: 'Профессиональная студия йоги',
    price: 250000,
    type: 'OFFLINE',
    isActive: true,
    status: 'DRAFT',
    region: 'GLOBAL',
    language: 'uz'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/courses/offline-do-yoga', // Ensure this ID exists or replace it
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putData),
        'Cookie': 'admin_session=test' // You might get unauthorized if this fails, but we want to see Zod first if we can. Note: We might need a real token or temporarily disable isAdmin check in route.ts.
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', (e) => { console.error(`Problem with request: ${e.message}`); });
req.write(putData);
req.end();
