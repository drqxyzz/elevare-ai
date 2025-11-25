'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

import { ModeToggle } from '@/components/mode-toggle';

export function Navbar() {
    const { user, isLoading } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="bg-primary text-primary-foreground p-1 rounded-lg">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    Elevare AI
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                        Features
                    </Link>
                    <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                        How It Works
                    </Link>

                    <ModeToggle />

                    {!isLoading && (
                        <div className="flex items-center gap-4">
                            {user ? (
                                <>
                                    <Link href="/dashboard">
                                        <Button variant="ghost">Dashboard</Button>
                                    </Link>
                                    <Link href="/api/auth/logout">
                                        <Button variant="outline">Log Out</Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/api/auth/login">
                                        <Button variant="ghost">Log In</Button>
                                    </Link>
                                    <Link href="/api/auth/login?screen_hint=signup">
                                        <Button>Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-background">
                    <Link href="/#features" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>
                        Features
                    </Link>
                    <Link href="/#pricing" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>
                        Pricing
                    </Link>
                    <div className="pt-4 border-t space-y-2">
                        {!isLoading && user ? (
                            <>
                                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full" variant="ghost">Dashboard</Button>
                                </Link>
                                <Link href="/api/auth/logout" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full" variant="outline">Log Out</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/api/auth/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full" variant="ghost">Log In</Button>
                                </Link>
                                <Link href="/api/auth/login?screen_hint=signup" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
