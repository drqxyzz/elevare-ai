import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getOrCreateUser, getUserPosts } from '@/lib/db/actions';

export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await getOrCreateUser(session.user.sub, session.user.email || '');
        const posts = await getUserPosts(dbUser.id);

        return NextResponse.json(posts);
    } catch (error) {
        console.error('History API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
