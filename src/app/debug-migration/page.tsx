import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DebugMigrationPage() {
    let message = '';
    let error = '';

    const client = await pool.connect();
    try {
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS daily_usage_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_usage_date DATE DEFAULT CURRENT_DATE;
        `);
        message = 'Migration successful: Added daily usage columns';
    } catch (e: any) {
        error = e.message + '\n' + e.stack;
    } finally {
        client.release();
    }

    return (
        <div className="p-10 font-mono">
            <h1 className="text-2xl font-bold mb-4">Migration Debug</h1>
            {message && <div className="bg-green-100 p-4 rounded text-green-800">{message}</div>}
            {error && <div className="bg-red-100 p-4 rounded text-red-800 whitespace-pre-wrap">{error}</div>}
        </div>
    );
}
