import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getGlobalStats, getUserUsage } from '@/lib/db/actions';

async function isAdmin() {
    const session = await auth0.getSession();
    if (!session || !session.user) return false;

    const dbUser = await getUserUsage(session.user.sub);
    return dbUser && dbUser.role === 'developer';
}

export async function GET() {
    if (!(await isAdmin())) {
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
