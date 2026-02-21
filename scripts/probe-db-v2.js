const { Client } = require('pg');

const projectRef = 'jbiqvhnnzftrjnxapgdp';
const pass = 'AzizaTuraeva12@25';
const dbName = 'postgres';
const user = `postgres.${projectRef}`;
// Try both project-specific user and simple 'postgres'
const usersToTry = [
    `postgres.${projectRef}`,
    'postgres'
];

const regions = [
    'eu-central-1', // Frankfurt (Common for EU)
    'eu-west-1',    // Ireland
    'us-east-1',    // N. Virginia
    'ap-southeast-1', // Singapore
];

const formats = [
    {
        name: 'Direct (Port 5432)',
        port: 5432,
        hostTemplate: (region) => `aws-0-${region}.pooler.supabase.com`
    },
    {
        name: 'Pooler (Port 6543)',
        port: 6543,
        hostTemplate: (region) => `aws-0-${region}.pooler.supabase.com`
    },
    {
        name: 'Direct DB Host',
        port: 5432,
        hostTemplate: () => `db.${projectRef}.supabase.co`
    }
];

async function probe() {
    console.log("🔍 Starting Database Connectivity Probe...");

    // 1. Try DB Host directly first (it usually resolves to the correct IP)
    console.log(`\n--- Probing Main DB Host: db.${projectRef}.supabase.co ---`);
    await tryConnect(`db.${projectRef}.supabase.co`, 5432, 'postgres');

    // 2. Iterate Regions
    for (const region of regions) {
        console.log(`\n--- Probing Region: ${region} ---`);
        for (const format of formats) {
            // Skip DB Host in region loop as it's region-agnostic
            if (format.name === 'Direct DB Host') continue;

            const host = format.hostTemplate(region);

            for (const dbUser of usersToTry) {
                await tryConnect(host, format.port, dbUser);
            }
        }
    }
}

async function tryConnect(host, port, user) {
    const connectionString = `postgresql://${user}:${encodeURIComponent(pass)}@${host}:${port}/${dbName}?connect_timeout=3`;
    // Mask password for logs
    const safeString = connectionString.replace(pass, '****');

    console.log(`Trying: ${host}:${port} as ${user} ...`);

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
    });

    try {
        await client.connect();
        console.log(`✅ SUCCESS! Connected to ${host}:${port}`);
        console.log(`Suggested Connection String:\n${connectionString}`);
        // If successful, we might want to stop or just log it forcefully
        process.exit(0);
    } catch (err) {
        let msg = err.message;
        if (msg.includes('getaddrinfo ENOTFOUND')) msg = 'Host not found';
        if (msg.includes('timeout')) msg = 'Connection timed out';
        console.log(`❌ Failed: ${msg}`);
    } finally {
        try { await client.end(); } catch (e) { }
    }
}

probe().catch(console.error);
