import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export async function POST(req: Request) {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { items } = await req.json();

        // Calculate order amount
        // In a real app, you'd look up the price from your database or Stripe Products
        const calculateOrderAmount = (items: any[]) => {
            return 1000; // $10.00
        };

        const paymentIntent = await stripe.paymentIntents.create({
            amount: calculateOrderAmount(items),
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: session.user.sub,
                email: session.user.email || null,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Stripe Intent Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
