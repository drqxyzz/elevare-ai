import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/db/actions';
import { auth0 } from '@/lib/auth0';

export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user } = session;
        const dbUser = await getOrCreateUser(user.sub as string, user.email as string);

        return NextResponse.json({
            usage: dbUser.usage_count,
            role: dbUser.role,
            limit: 3
        });

    } catch (error) {
        console.error('Usage API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
