import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NETLIFY_DATABASE_URL exists:', !!process.env.NETLIFY_DATABASE_URL);

const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (connectionString) {
    console.log('Using connection string starting with:', connectionString.substring(0, 10) + '...');
} else {
    console.error('No connection string found!');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: true
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running migration...');
        await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS daily_usage_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_usage_date DATE DEFAULT CURRENT_DATE;
    `);
        console.log('Migration successful: Added daily usage columns');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
