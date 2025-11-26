import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import pool from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const sig = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log('PaymentIntent was successful!', paymentIntent.id);

            // Update user role to premium
            const userId = paymentIntent.metadata.userId;
            const email = paymentIntent.metadata.email;

            if (userId) {
                await updateUserRoleByAuth0Id(userId, 'premium');
                console.log(`User ${userId} upgraded to premium`);
            } else if (email) {
                // Fallback to email if userId is missing (shouldn't happen with our setup)
                await updateUserRoleByEmail(email, 'premium');
                console.log(`User ${email} upgraded to premium`);
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

// Helper functions for DB updates
async function updateUserRoleByAuth0Id(auth0Id: string, role: string) {
    const client = await pool.connect();
    try {
        await client.query('UPDATE users SET role = $1, subscription_status = $2 WHERE auth0_id = $3', [role, 'active', auth0Id]);
    } finally {
        client.release();
    }
}

async function updateUserRoleByEmail(email: string, role: string) {
    const client = await pool.connect();
    try {
        await client.query('UPDATE users SET role = $1, subscription_status = $2 WHERE email = $3', [role, 'active', email]);
    } finally {
        client.release();
    }
}
