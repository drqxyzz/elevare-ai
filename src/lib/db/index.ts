import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
});

export default pool;
