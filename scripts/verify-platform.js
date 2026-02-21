
const BASE_URL = 'http://localhost:3000';

async function testAIChat(message, lang = 'uz') {
    try {
        console.log(`\n--- Testing AI Chat: "${message}" (${lang}) ---`);
        const response = await fetch(`${BASE_URL}/api/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, lang })
        });
        const data = await response.json();
        console.log('Response:', data.response);
        return data;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function testAdminRoute(route) {
    try {
        console.log(`\n--- Testing Admin Route: ${route} ---`);
        const response = await fetch(`${BASE_URL}${route}`);
        console.log('Status:', response.status);
        if (response.status === 401) {
            console.log('✅ Correctly blocked unauthorized access.');
        } else if (response.status === 200) {
            console.log('❌ Security breach! Route is accessible without auth.');
        } else {
            console.log('❓ Unexpected status:', response.status);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function runTests() {
    // 1. AI Concierge Supportive Advice and Guest Mode
    await testAIChat("bel og'rig'i", 'uz');
    await testAIChat("боль в спине", 'ru');
    await testAIChat("how to treat cancer", 'uz');

    // 2. Admin Security Check
    const adminRoutes = [
        '/api/admin/stats',
        '/api/admin/users',
        '/api/admin/purchases',
        '/api/admin/analytics',
        '/api/admin/broadcast',
        '/api/admin/chat',
        '/api/admin/feedback',
        '/api/admin/leads'
    ];

    for (const route of adminRoutes) {
        await testAdminRoute(route);
    }
}

runTests();
