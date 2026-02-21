const http = require('http');

const putData = JSON.stringify({
    title: "DoYogaStudios",
    titleRu: "DoYogaStudios",
    description: "Профессиональная студия йоги. Тажрибали мураббийлар билан чуқур амалиёт.",
    descriptionRu: "Профессиональная студия йоги. Глубокая практика с опытными инструкторами.",
    price: 1600000,
    type: "OFFLINE",
    isActive: true,
    coverImage: "/images/studios/do-yoga.png",
    location: "Махтумқули кўчаси",
    locationRu: "Махтумкули",
    schedule: "Душанба",
    scheduleRu: "Понедельник",
    durationDays: 30,
    features: ["Премиум"],
    featuresRu: ["Премиум"],
    status: "PUBLISHED",
    region: "GLOBAL",
    language: "uz",
    modules: [{
        title: "", // intentional failing field?
        description: "",
        lessons: []
    }]
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/courses/offline-do-yoga',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putData),
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
