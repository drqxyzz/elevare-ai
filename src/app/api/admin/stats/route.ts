import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getGlobalStats, getUserUsage } from '@/lib/db/actions';

async function isAdmin() {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) return false;

        const dbUser = await getUserUsage(session.user.sub);
        return dbUser && dbUser.role === 'developer';
    } catch (e) {
        console.error('Admin Check Error:', e);
        return false;
    }
}

export async function GET() {
    console.log('GET /api/admin/stats called');
    if (!(await isAdmin())) {
        console.log('GET /api/admin/stats: Unauthorized');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const stats = await getGlobalStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
