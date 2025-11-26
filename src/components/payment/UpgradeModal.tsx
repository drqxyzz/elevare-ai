'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ isOpen, onOpenChange }: UpgradeModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Sparkles className="w-8 h-8 text-yellow-300" />
                        </div>
                        <DialogTitle className="text-2xl font-bold mb-2">Unlock Unlimited Power</DialogTitle>
                        <DialogDescription className="text-indigo-100 text-base">
                            You've reached your free limit. Upgrade to Premium to keep creating viral content without boundaries.
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-6 space-y-6 bg-background">
                    <div className="space-y-3">
                        {[
                            'Unlimited AI Generations',
                            'Access to all platforms (LinkedIn, Twitter, etc.)',
                            'Advanced Viral Predictions',
                            'Priority Support'
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full flex-shrink-0">
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-sm font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50 flex items-start gap-3">
                        <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Did you know?</span> Premium users see 3x higher engagement on their posts.
                        </p>
                    </div>

                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Link href="/pricing" className="w-full">
                            <Button className="w-full h-12 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all">
                                Upgrade Now - $10/mo
                            </Button>
                        </Link>
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full text-muted-foreground">
                            Maybe Later
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
