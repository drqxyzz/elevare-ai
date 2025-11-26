'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CheckoutForm } from '@/components/payment/CheckoutForm';
import { Check, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PricingPage() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/api/auth/login?returnTo=/pricing');
            return;
        }

        if (user) {
            // Create PaymentIntent as soon as the page loads
            fetch('/api/stripe/create-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [{ id: 'premium-plan' }] }),
            })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret));
        }
    }, [user, isLoading, router]);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#7c3aed',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col bg-muted/10">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
                        <p className="text-xl text-muted-foreground">Unlock unlimited potential for your brand.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Plan Details */}
                        <Card className="border-primary/20 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                                MOST POPULAR
                            </div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                    Premium Plan
                                </CardTitle>
                                <CardDescription>Everything you need to scale.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">$29</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>

                                <ul className="space-y-3">
                                    {[
                                        'Unlimited AI Generations',
                                        'Access to all platforms (LinkedIn, Twitter, etc.)',
                                        'Advanced Viral Predictions',
                                        'Priority Support',
                                        'Custom Tone of Voice',
                                        'Trend Analysis'
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                                                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-sm">Why upgrade?</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Premium users see 3x more engagement on average due to our advanced viral prediction algorithms.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Form */}
                        <div className="space-y-6">
                            {clientSecret ? (
                                <Elements options={options} stripe={stripePromise}>
                                    <CheckoutForm />
                                </Elements>
                            ) : (
                                <div className="flex items-center justify-center h-[400px] bg-card rounded-xl border shadow-sm">
                                    <div className="animate-pulse flex flex-col items-center gap-4">
                                        <div className="h-8 w-8 bg-muted rounded-full"></div>
                                        <div className="text-sm text-muted-foreground">Loading secure payment...</div>
                                    </div>
                                </div>
                            )}

                            <div className="text-center text-xs text-muted-foreground">
                                By subscribing, you agree to our Terms of Service and Privacy Policy.
                                You can cancel anytime from your dashboard.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
