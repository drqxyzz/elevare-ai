import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getAllUsers, updateUserRole, getUserUsage, toggleUserSuspension } from '@/lib/db/actions';

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
        const { userId, role, isSuspended } = await req.json();

        if (userId && role) {
            const updatedUser = await updateUserRole(userId, role);
            return NextResponse.json(updatedUser);
        }

        if (userId && isSuspended !== undefined) {
            await toggleUserSuspension(userId, isSuspended);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Failed to update user role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
