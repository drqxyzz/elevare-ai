import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getAllGenerations, getUserUsage } from '@/lib/db/actions';

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
    console.log('GET /api/admin/generations called');
    if (!(await isAdmin())) {
        console.log('GET /api/admin/generations: Unauthorized');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const generations = await getAllGenerations();
        return NextResponse.json(generations);
    } catch (error) {
        console.error('Failed to fetch generations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
