
// Using native fetch (Node 18+)

const BASE_URL = 'http://localhost:3000'

async function main() {
    console.log('🧪 Testing TMA Auth & AI API End-to-End...')
    const telegramId = 999000111 + Math.floor(Math.random() * 1000)

    try {
        // 1. Register User (POST)
        console.log(`1. Registering TMA user (ID: ${telegramId})...`)
        const regRes = await fetch(`${BASE_URL}/api/tma/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegramId,
                firstName: 'TMA',
                lastName: 'Tester',
                phone: '+998901234567'
            })
        })

        if (!regRes.ok) {
            const errText = await regRes.text()
            console.error('❌ Registration Error Body:', errText)
            throw new Error(`Registration failed: ${regRes.status} ${regRes.statusText}`)
        }
        const regData = await regRes.json()
        console.log('✅ Registration response:', regData)

        // 2. Check for Auth Cookie
        const cookies = regRes.headers.get('set-cookie')
        console.log('🍪 Set-Cookie Header:', cookies)

        if (!cookies || !cookies.includes('auth_token=')) {
            throw new Error('❌ No auth_token cookie received from registration!')
        }

        // Extract auth_token for next request
        // node-fetch cookies are comma separated string if multiple, but here likely one
        const authToken = cookies.split(';')[0] // simplistic extraction
        console.log('🔑 Extracted Cookie:', authToken)

        // 3. Call AI Chat (Protected)
        console.log('3. Calling Protected AI API...')
        const aiRes = await fetch(`${BASE_URL}/api/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authToken
            },
            body: JSON.stringify({
                message: "Salom, mening ismim nima?",
                lang: 'uz'
            })
        })

        const aiData = await aiRes.json()
        console.log('🤖 AI Response Status:', aiRes.status)

        if (aiRes.status === 401) {
            throw new Error('❌ AI API returned 401 Unauthorized - Cookie not accepted!')
        }

        if (aiData.success) {
            console.log('✅ AI Reply:', aiData.response)
        } else {
            console.log('⚠️ AI Success false:', aiData)
        }

        console.log('🎉 E2E Authentication Test Passed!')

    } catch (e: any) {
        console.error('❌ Test Failed:', e.message)
        // If fetch failed connection refused, remind user
        if (e.message.includes('ECONNREFUSED')) {
            console.error('⚠️ Make sure the dev server is running on port 3000!')
        }
        process.exit(1)
    }
}

main()
