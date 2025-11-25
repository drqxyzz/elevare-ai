import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getAllUsers, updateUserRole, getUserUsage } from '@/lib/db/actions';

async function isAdmin() {
    const session = await auth0.getSession();
    if (!session || !session.user) return false;

    // Check DB role
    const dbUser = await getUserUsage(session.user.sub);
    return dbUser && dbUser.role === 'developer';
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await getAllUsers();
        return NextResponse.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, role } = await req.json();
        if (!userId || !role) {
            return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
        }

        const updatedUser = await updateUserRole(userId, role);
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Failed to update user role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
