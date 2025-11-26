import { NextResponse } from 'next/server';
import { getUserUsage } from '@/lib/db/actions';
import { auth0 } from '@/lib/auth0';

export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user } = session;
        const dbUser = await getUserUsage(user.sub as string);

        let limit = 3; // Default Free
        if (dbUser.role === 'premium') limit = 1000;
        if (dbUser.role === 'developer' || dbUser.role === 'vip') limit = 999999; // Unlimited

        return NextResponse.json({
            usage_count: dbUser.usage_count,
            daily_usage_count: dbUser.daily_usage_count || 0,
            last_usage_date: dbUser.last_usage_date,
            role: dbUser.role,
            limit: limit
        });

    } catch (error) {
        console.error('Usage API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
