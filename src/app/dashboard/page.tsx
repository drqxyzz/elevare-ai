'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
    Loader2, Sparkles, Copy, AlertCircle, Check,
    Twitter, Linkedin, Youtube, Instagram, Video,
    Zap, TrendingUp, Clock
} from 'lucide-react';
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
        tags?: string[];
        cta_variations?: string[];
        trend_matching?: string;
        engagement_prediction?: { score: number; reason: string };
        best_posting_time?: string;
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
    const [tone, setTone] = useState('Professional');
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
                    tone,
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
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Limit Alert */}
                    {isLimitReached && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Limit Reached</AlertTitle>
                            <AlertDescription>
                                You have reached your free tier limit of {usage?.limit} generations.
                                Please upgrade to continue creating content.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Left Column: Input Section */}
                        <div className="space-y-6">
                            <Card className="border-muted/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Content Generator</CardTitle>
                                    <CardDescription>Provide context for the AI to generate magic.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Tabs defaultValue="url" value={inputType} onValueChange={(v: string) => setInputType(v as 'url' | 'text')} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-4">
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
                                                placeholder="Paste your topic, notes, or rough draft here..."
                                                className="min-h-[120px] resize-y"
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                disabled={loading || !!isLimitReached}
                                            />
                                        </TabsContent>
                                    </Tabs>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="purpose">Goal / Purpose</Label>
                                            <Input
                                                id="purpose"
                                                placeholder="e.g. Drive traffic..."
                                                value={purpose}
                                                onChange={(e) => setPurpose(e.target.value)}
                                                disabled={loading || !!isLimitReached}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tone / Vibe 🎭</Label>
                                            <Select value={tone} onValueChange={setTone}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a tone" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['Professional', 'Casual', 'Funny', 'Educational', 'Inspirational', 'Controversial'].map((t) => (
                                                        <SelectItem key={t} value={t}>
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Target Platforms</Label>
                                        <div className="flex flex-wrap gap-3 justify-center p-4 bg-muted/20 rounded-lg border border-dashed">
                                            {[
                                                { id: 'twitter', label: 'Twitter', icon: Twitter },
                                                { id: 'instagram', label: 'Instagram', icon: Instagram },
                                                { id: 'youtube', label: 'YouTube', icon: Youtube },
                                                { id: 'tiktok', label: 'TikTok', icon: Video },
                                            ].map((platform) => {
                                                const Icon = platform.icon;
                                                const isSelected = selectedPlatforms.includes(platform.id);
                                                return (
                                                    <Button
                                                        key={platform.id}
                                                        variant={isSelected ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => togglePlatform(platform.id)}
                                                        className={`gap-2 transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        {platform.label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Monetization Tips</Label>
                                            <p className="text-xs text-muted-foreground">Get ideas to make money from this post.</p>
                                        </div>
                                        <Switch
                                            checked={showMonetization}
                                            onCheckedChange={setShowMonetization}
                                        />
                                    </div>

                                    <Button
                                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                                        onClick={handleGenerate}
                                        disabled={loading || (!url && !text) || !!isLimitReached}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Generating Magic...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-5 w-5" />
                                                {usage && usage.role === 'free' ? `Generate (${usage.usage}/${usage.limit})` : 'Generate Content'}
                                            </>
                                        )}
                                    </Button>

                                    {usage && (
                                        <p className="text-xs text-center text-muted-foreground">
                                            {usage.role === 'developer' || usage.role === 'vip'
                                                ? 'Unlimited Generations'
                                                : `${usage.usage} / ${usage.limit} generations used`
                                            }
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Results Section */}
                        <div className="space-y-6">
                            {!result && !loading && (
                                <div className="flex flex-col items-center justify-center text-muted-foreground py-12 opacity-50 border-2 border-dashed rounded-xl h-full min-h-[400px]">
                                    <Sparkles className="w-12 h-12 mb-4" />
                                    <p>Your generated content will appear here.</p>
                                </div>
                            )}

                            {loading && (
                                <div className="space-y-4">
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                    <Skeleton className="h-[400px] w-full rounded-xl" />
                                </div>
                            )}

                            {result && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <Tabs defaultValue={result.outputs[0]?.platform.toLowerCase()} className="w-full">
                                        <TabsList className="flex flex-wrap w-full h-auto gap-2 bg-transparent p-0 mb-4 justify-start">
                                            {result.outputs.map((output) => (
                                                <TabsTrigger
                                                    key={output.platform}
                                                    value={output.platform.toLowerCase()}
                                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card capitalize"
                                                >
                                                    {output.platform}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>

                                        {result.outputs.map((output, i) => (
                                            <TabsContent key={i} value={output.platform.toLowerCase()}>
                                                <Card className="border-muted shadow-lg">
                                                    <CardContent className="p-6 space-y-6">

                                                        {/* Header with Time */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="capitalize">{output.platform}</Badge>
                                                                {output.best_posting_time && (
                                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" /> {output.best_posting_time}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Title / Hook */}
                                                        {output.title && (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Title / Hook</h3>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(output.title || '')}>
                                                                        <Copy className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                                <div className="p-3 bg-muted/50 rounded-lg text-sm font-medium">
                                                                    {output.title}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Main Content */}
                                                        {(output.content || output.description || output.caption) && (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Content</h3>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(output.content || output.description || output.caption || '')}>
                                                                        <Copy className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                                <div className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg border border-muted/50 leading-relaxed">
                                                                    {output.content || output.description || output.caption}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Hashtags */}
                                                        {(output.hashtags?.length || output.tags?.length) ? (
                                                            <div className="space-y-2">
                                                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Hashtags</h3>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {(output.hashtags || output.tags || []).map((tag, idx) => (
                                                                        <Badge key={idx} variant="secondary" className="text-xs font-normal">
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : null}

                                                        {/* Media Suggestion */}
                                                        {output.media_suggestion && (
                                                            <div className="space-y-2">
                                                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Media Idea 🖼️</h3>
                                                                <div className="text-sm italic text-muted-foreground bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                                                    {output.media_suggestion}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Monetization */}
                                                        {output.monetization && (
                                                            <div className="mt-6 pt-4 border-t border-dashed">
                                                                <div className="flex items-center gap-2 mb-2 text-green-600">
                                                                    <Sparkles className="w-4 h-4" />
                                                                    <span className="font-semibold text-sm">Monetization Suggestion</span>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground italic">
                                                                    {output.monetization}
                                                                </p>
                                                            </div>
                                                        )}

                                                    </CardContent>
                                                </Card>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <LoginModal isOpen={showLoginModal} onOpenChange={setShowLoginModal} />
        </div >
    );
}
