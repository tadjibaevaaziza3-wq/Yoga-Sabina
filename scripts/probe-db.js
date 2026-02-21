const { Client } = require('pg');

const projectRef = 'jbiqvhnnzftrjnxapgdp';
const pass = 'AzizaTuraeva12@25';

const hosts = [
    { h: `aws-0-eu-central-1.pooler.supabase.com`, p: 5432, u: `postgres.${projectRef}` },
    { h: `aws-0-eu-central-1.pooler.supabase.com`, p: 6543, u: `postgres.${projectRef}` },
    { h: `db.${projectRef}.supabase.co`, p: 5432, u: `postgres` },
    { h: `${projectRef}.supabase.co`, p: 5432, u: `postgres` },
    { h: `aws-0-eu-west-1.pooler.supabase.com`, p: 5432, u: `postgres.${projectRef}` },
];

async function testAll() {
    for (const { h: host, p: port, u: user } of hosts) {
        console.log(`--- Testing ${user}@${host}:${port} ---`);

        const client = new Client({
            host: host,
            user: user,
            password: pass,
            database: 'postgres',
            port: port,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        });

        try {
            await client.connect();
            console.log(`✅ SUCCESS on ${host}`);
            const res = await client.query('SELECT current_database(), current_user');
            console.log('Result:', res.rows[0]);
            await client.end();
            console.log('--- DONE ---');
            return;
        } catch (err) {
            console.error(`❌ FAILED:`, err.message);
        }
    }
}

testAll();
