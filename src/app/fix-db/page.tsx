import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function FixDbPage() {
    let status = 'Initializing...';
    let dbUrl = process.env.DATABASE_URL || 'NOT SET';
    let error = null;

    try {
        const client = await pool.connect();
        try {
            await client.query(`
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS daily_usage_count INTEGER DEFAULT 0,
                ADD COLUMN IF NOT EXISTS last_usage_date DATE DEFAULT CURRENT_DATE;
            `);
            status = 'Migration Successful!';
        } finally {
            client.release();
        }
    } catch (e: any) {
        status = 'Migration Failed';
        error = e.message + '\n' + JSON.stringify(e, null, 2);
    }

    return (
        <div className="p-8 font-mono space-y-4">
            <h1 className="text-2xl font-bold">Database Fixer</h1>
            <div>
                <strong>DATABASE_URL:</strong> {dbUrl.substring(0, 15)}...
            </div>
            <div className={`p-4 rounded ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                <div className="font-bold">{status}</div>
                {error && <pre className="mt-2 text-xs whitespace-pre-wrap">{error}</pre>}
            </div>
        </div>
    );
}
