import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth0 } from '@/lib/auth0';
import { getUserUsage } from '@/lib/db/actions';

export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await getUserUsage(session.user.sub);
        if (!dbUser || dbUser.role !== 'developer') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        try {
            await client.query(`
                ALTER TABLE generated_posts ADD COLUMN IF NOT EXISTS response_json JSONB;
            `);
            return NextResponse.json({ success: true, message: 'Schema updated successfully: added response_json' });
        } finally {
            client.release();
        }
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
