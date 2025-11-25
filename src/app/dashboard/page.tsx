'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Loader2, Copy, AlertCircle, Sparkles } from 'lucide-react';
import { LoginModal } from '@/components/auth/LoginModal';
import ReactMarkdown from 'react-markdown';

interface GeneratedResult {
    posts: { title: string; headline: string }[];
    suggestions: string;
}

export default function Dashboard() {
    const { user, isLoading } = useUser();
    const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState<{ usage: number; limit: number; role: string } | null>(null);
    const [result, setResult] = useState<GeneratedResult | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Form State
    const [inputType, setInputType] = useState<'url' | 'text'>('url');
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [purpose, setPurpose] = useState('');

    // Load saved state on mount
    useEffect(() => {
        const savedState = localStorage.getItem('dashboardState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            setInputType(parsed.inputType || 'url');
            setUrl(parsed.url || '');
            setText(parsed.text || '');
            setPurpose(parsed.purpose || '');
            // Clear state after restoring
            localStorage.removeItem('dashboardState');
        }
    }, []);

    const fetchUsage = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/user/usage');
            if (res.ok) {
                const data = await res.json();
                setUsage(data);
            }
        } catch (error) {
            console.error('Failed to fetch usage', error);
        }
    }, [user]);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    const handleGenerate = async () => {
        if (!user) {
            // Save state and show login modal
            localStorage.setItem('dashboardState', JSON.stringify({
                inputType,
                url,
                text,
                purpose
            }));
            setShowLoginModal(true);
            return;
        }

        if (!purpose) {
            toast.error('Please enter a purpose for your post');
            return;
        }
        if (inputType === 'url' && !url) {
            toast.error('Please enter a URL');
            return;
        }
        if (inputType === 'text' && !text) {
            toast.error('Please enter some text');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: inputType === 'url' ? url : undefined,
                    text: inputType === 'text' ? text : undefined,
                    purpose
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 403 && data.limitReached) {
                    toast.error('Free limit reached. Please upgrade.');
                    // Refresh usage to show updated state
                    fetchUsage();
                    return;
                }
                throw new Error(data.details || data.error || 'Generation failed');
            }

            setResult(data);
            toast.success('Content generated successfully!');
            fetchUsage(); // Update usage count
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const isLimitReached = usage && usage.role === 'free' && usage.usage >= usage.limit;

    return (
        <div className="min-h-screen flex flex-col bg-muted/10">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header & Usage */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Dashboard</h1>
                            <p className="text-muted-foreground">Create your next viral post.</p>
                        </div>


                    </div>

                    {/* Limit Alert */}
                    {isLimitReached && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Limit Reached</AlertTitle>
                            <AlertDescription>
                                You have used all your free generations. Please upgrade to the Pro plan to continue.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Input Section */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Input Details</CardTitle>
                                    <CardDescription>Provide context for the AI.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Tabs defaultValue="url" value={inputType} onValueChange={(v: string) => setInputType(v as 'url' | 'text')}>
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="url">Website URL</TabsTrigger>
                                            <TabsTrigger value="text">Manual Text</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="url" className="space-y-2">
                                            <Label htmlFor="url">URL</Label>
                                            <Input
                                                id="url"
                                                placeholder="https://example.com/article"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                disabled={loading || !!isLimitReached}
                                            />
                                        </TabsContent>
                                        <TabsContent value="text" className="space-y-2">
                                            <Label htmlFor="text">Context</Label>
                                            <Textarea
                                                id="text"
                                                placeholder="Paste your content or notes here..."
                                                className="h-32"
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                disabled={loading || !!isLimitReached}
                                            />
                                        </TabsContent>
                                    </Tabs>

                                    <div className="space-y-2">
                                        <Label htmlFor="purpose">Purpose / Goal</Label>
                                        <Textarea
                                            id="purpose"
                                            placeholder="e.g. Announce a new product launch..."
                                            value={purpose}
                                            onChange={(e) => setPurpose(e.target.value)}
                                            disabled={loading || !!isLimitReached}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Button
                                            className="w-full"
                                            onClick={handleGenerate}
                                            disabled={loading || !!isLimitReached}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Generate Content
                                                </>
                                            )}
                                        </Button>
                                        {usage && (
                                            <p className="text-xs text-center text-muted-foreground">
                                                {usage.limit > 1000
                                                    ? 'Unlimited generations'
                                                    : `${usage.usage} / ${usage.limit} generations used`
                                                }
                                            </p>
                                        )}
                                        {!user && (
                                            <p className="text-xs text-center text-muted-foreground">
                                                Login required to generate posts.
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Results Section */}
                        <div className="lg:col-span-2 space-y-6">
                            {!result && !loading && (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl p-8">
                                    <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Your generated content will appear here.</p>
                                </div>
                            )}

                            {loading && (
                                <div className="space-y-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-32 w-full" />
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            )}

                            {result && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Generated Posts */}
                                    <div className="grid gap-4">
                                        <h2 className="text-xl font-semibold">Generated Options</h2>
                                        {result.posts.map((post, i) => (
                                            <Card key={i}>
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Option {i + 1}</span>
                                                            <div className="flex gap-2">
                                                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(post.title)} title="Copy Title">
                                                                    <Copy className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <h3 className="font-bold text-lg">{post.title}</h3>
                                                    </div>
                                                    <div className="p-3 bg-muted/50 rounded-lg">
                                                        <p className="text-sm text-muted-foreground mb-1">Headline / Hook:</p>
                                                        <p className="font-medium">{post.headline}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Suggestions */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>AI Suggestions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown>{result.suggestions}</ReactMarkdown>
                                            </div>
                                            <Button variant="outline" className="mt-4" onClick={() => copyToClipboard(result.suggestions)}>
                                                <Copy className="mr-2 w-4 h-4" /> Copy Suggestions
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <LoginModal isOpen={showLoginModal} onOpenChange={setShowLoginModal} />
        </div>
    );
}
