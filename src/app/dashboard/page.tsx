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
    outputs: {
        platform: string;
        title?: string;
        content?: string;
        description?: string;
        caption?: string;
        media_suggestion?: string;
        hashtags?: string[];
        monetization?: string;
    }[];
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
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter']);
    const [showMonetization, setShowMonetization] = useState(false);

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    };

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
                    purpose,
                    platforms: selectedPlatforms,
                    monetization: showMonetization
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

                                    <div className="space-y-3">
                                        <Label>Target Platforms</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: 'twitter', label: 'Twitter / X' },
                                                { id: 'youtube', label: 'YouTube' },
                                                { id: 'instagram', label: 'Instagram' },
                                                { id: 'tiktok', label: 'TikTok' }
                                            ].map(platform => (
                                                <Button
                                                    key={platform.id}
                                                    variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => togglePlatform(platform.id)}
                                                    className="gap-2"
                                                >
                                                    {platform.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 py-2">
                                        <input
                                            type="checkbox"
                                            id="monetization"
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={showMonetization}
                                            onChange={(e) => setShowMonetization(e.target.checked)}
                                        />
                                        <Label htmlFor="monetization" className="cursor-pointer">
                                            Include Monetization Suggestions? (Upsells, Downsells)
                                        </Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Button
                                            className="w-full"
                                            onClick={handleGenerate}
                                            disabled={loading || !!isLimitReached || selectedPlatforms.length === 0}
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
                                    {/* Generated Outputs */}
                                    <div className="grid gap-8">
                                        {result.outputs.map((output, i) => (
                                            <div key={i} className="space-y-2">
                                                <h3 className="text-lg font-bold capitalize text-center">{output.platform}</h3>
                                                <Card className="overflow-hidden border-muted">
                                                    <CardContent className="p-4 space-y-4">
                                                        {/* Title / Hook (if present) */}
                                                        {output.title && (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-xs text-muted-foreground uppercase">Title / Hook</Label>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(output.title || '')} title="Copy Title">
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                                <div className="font-bold text-lg leading-tight">{output.title}</div>
                                                            </div>
                                                        )}

                                                        {/* YouTube Description */}
                                                        {output.description && (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-xs text-muted-foreground uppercase">Description</Label>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(output.description || '')} title="Copy Description">
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                                <div className="whitespace-pre-wrap text-sm bg-muted/30 p-3 rounded-md">
                                                                    {output.description}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Main Content / Script */}
                                                        {output.content && (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-xs text-muted-foreground uppercase">
                                                                        {output.platform === 'tiktok' ? 'Script / Concept' : 'Content'}
                                                                    </Label>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(output.content || '')} title="Copy Content">
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                                <div className="whitespace-pre-wrap text-sm bg-muted/30 p-3 rounded-md">
                                                                    {output.content}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* TikTok Caption */}
                                                        {output.caption && (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-xs text-muted-foreground uppercase">Caption</Label>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(output.caption || '')} title="Copy Caption">
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                                <div className="text-sm bg-muted/30 p-3 rounded-md">
                                                                    {output.caption}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Media Suggestion */}
                                                        {output.media_suggestion && (
                                                            <div className="space-y-1">
                                                                <Label className="text-xs text-muted-foreground uppercase">Media Idea 🖼️</Label>
                                                                <div className="text-sm italic text-muted-foreground bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded-md border border-blue-100 dark:border-blue-900/20">
                                                                    {output.media_suggestion}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Hashtags (if present) */}
                                                        {output.hashtags && output.hashtags.length > 0 && (
                                                            <div className="space-y-1">
                                                                <Label className="text-xs text-muted-foreground uppercase">Hashtags</Label>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {output.hashtags.map((tag, idx) => (
                                                                        <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Monetization (if present) */}
                                                        {output.monetization && (
                                                            <div className="mt-4 pt-4 border-t border-dashed">
                                                                <div className="flex items-center gap-2 mb-2 text-green-600">
                                                                    <Sparkles className="w-4 h-4" />
                                                                    <span className="font-semibold text-sm">Monetization Tip</span>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground italic">
                                                                    {output.monetization}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))}
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
