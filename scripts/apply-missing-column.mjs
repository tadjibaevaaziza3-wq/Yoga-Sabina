import pg from 'pg';

const connectionString = 'postgresql://postgres.jbiqvhnnzftrjnxapgdp:Baxtli_Men!@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=disable';

const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Connecting...');
        await client.connect();
        console.log('Connected! Listing tables...');
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log('Tables found:', res.rows.map(r => r.table_name));
        await client.end();
        process.exit(0);
    } catch (e) {
        console.error('❌ Failed:', e);
        await client.end().catch(() => { });
        process.exit(1);
    }
}

run();
