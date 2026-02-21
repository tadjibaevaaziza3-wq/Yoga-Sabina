const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.jbiqvhnnzftrjnxapgdp:AzizaTuraeva12%4025@aws-0-eu-central-1.pooler.supabase.com:5432/postgres";

async function testConnection() {
    console.log('Testing with string:', connectionString.replace(/:[^@]+@/, ':***@'));

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting...');
        await client.connect();
        console.log('✅ SUCCESS: Connected!');
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Result:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('❌ FAILED:', err.message);
        process.exit(1);
    }
}

testConnection();
