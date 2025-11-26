'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setErrorMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard`,
            },
        });

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.');
            setLoading(false);
        } else {
            // The UI will auto-redirect to the return_url
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card p-6 rounded-xl border shadow-sm">
                <PaymentElement />

                {errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm rounded-md">
                        {errorMessage}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={!stripe || loading}
                    className="w-full mt-6 h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Lock className="mr-2 h-4 w-4" />
                            Pay Securely
                        </>
                    )}
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    Payments are secure and encrypted
                </p>
            </div>
        </form>
    );
}
