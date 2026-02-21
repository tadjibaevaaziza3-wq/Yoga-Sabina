import pg from 'pg';

const connectionString = 'postgresql://postgres.jbiqvhnnzftrjnxapgdp:Baxtli_Men!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=disable';

const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
});

async function run() {
    try {
        console.log('Testing port 5432...');
        await client.connect();
        console.log('✅ Connected to port 5432!');
        await client.end();
    } catch (e) {
        console.log('❌ Port 5432 failed:', e.message);
        process.exit(1);
    }
}

run();
