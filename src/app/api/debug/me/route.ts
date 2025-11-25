import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getOrCreateUser } from '@/lib/db/actions';

export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'No session' });
        }

        const dbUser = await getOrCreateUser(session.user.sub, session.user.email);
        return NextResponse.json({
            auth0_sub: session.user.sub,
            email: session.user.email,
            db_record: dbUser
        });
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
}
