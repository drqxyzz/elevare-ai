import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    const client = await pool.connect();
    try {
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
            ALTER TABLE generated_posts ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;
            ALTER TABLE generated_posts ADD COLUMN IF NOT EXISTS flag_reason TEXT;
        `);
        return NextResponse.json({ success: true, message: 'Schema updated successfully' });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
        client.release();
    }
}
