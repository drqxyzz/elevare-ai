import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                            <div className="bg-primary text-primary-foreground p-1 rounded-lg">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            Elevare AI
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Supercharge your social media marketing with AI-powered content generation.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/#features">Features</Link></li>
                            <li><Link href="/#pricing">Pricing</Link></li>
                            <li><Link href="/dashboard">Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">About</Link></li>
                            <li><Link href="#">Blog</Link></li>
                            <li><Link href="#">Careers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">Privacy Policy</Link></li>
                            <li><Link href="#">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Elevare AI. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
