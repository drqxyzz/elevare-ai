import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    let client;
    try {
        client = await pool.connect();
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS daily_usage_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_usage_date DATE DEFAULT CURRENT_DATE;
        `);
        return NextResponse.json({ message: 'Migration successful: Added daily usage columns' });
    } catch (error: any) {
        console.error('Migration API Error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
