import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { flagContent, getOrCreateUser, getUserPosts } from '@/lib/db/actions';

export async function POST(req: Request) {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { postId, reason } = await req.json();
        if (!postId || !reason) {
            return NextResponse.json({ error: 'Missing postId or reason' }, { status: 400 });
        }

        // Verify ownership (optional but recommended)
        const dbUser = await getOrCreateUser(session.user.sub, session.user.email || '');
        const userPosts = await getUserPosts(dbUser.id);
        const isOwner = userPosts.some(p => p.id === postId);

        if (!isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await flagContent(postId, reason);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Report API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
