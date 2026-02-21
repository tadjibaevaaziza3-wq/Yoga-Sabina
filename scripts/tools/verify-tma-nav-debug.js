
const http = require('http');

const url = 'http://localhost:3000/uz/tma';

http.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const hasBackUz = data.includes('Orqaga');
        const hasBackRu = data.includes('Назад');
        const hasMainUz = data.includes('Asosiy');
        const hasMainRu = data.includes('Главная');
        const hasDevLogin = data.includes('Dev: Mock Login');
        console.log('Has "Dev: Mock Login":', hasDevLogin);

        const hasFooter = data.includes('©') && data.includes('BAXTLI MEN');

        console.log('--- TMA Verification Debug ---');
        console.log('Has "Orqaga":', hasBackUz);
        console.log('Has "Назад":', hasBackRu);
        console.log('Has "Asosiy":', hasMainUz);
        console.log('Has "Главная":', hasMainRu);
        console.log('Has "Dev: Mock Login":', hasDevLogin);
        console.log('Has Footer:', hasFooter);

        // Print the bottom of the body to see what's actually rendered
        console.log('\n--- Page Content Snippet (Bottom) ---');
        console.log(data.slice(-1000));

        if ((hasBackUz || hasBackRu) && (hasMainUz || hasMainRu) && !hasFooter) {
            console.log('SUCCESS: TMA changes verified.');
        } else {
            console.log('FAILURE: Verification failed.');
        }
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});
