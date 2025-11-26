'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag, Copy, Check, ExternalLink, Zap, TrendingUp, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface GeneratedPost {
    id: number;
    input_text: string;
    input_url: string;
    purpose: string;
    titles: string[];
    headlines: string[];
    suggestions: string;
    created_at: string;
    is_flagged: boolean;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<GeneratedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportReason, setReportReason] = useState('');
    const [reportingId, setReportingId] = useState<number | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/user/history');
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            } else {
                toast.error('Failed to load history');
            }
        } catch (error) {
            console.error('History fetch error:', error);
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleReport = async () => {
        if (!reportingId || !reportReason.trim()) return;

        try {
            const res = await fetch('/api/user/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: reportingId, reason: reportReason }),
            });

            if (res.ok) {
                toast.success('Content reported. Thank you.');
                setReportReason('');
                setReportingId(null);
                // Update local state to show flagged status immediately
                setHistory(prev => prev.map(item => item.id === reportingId ? { ...item, is_flagged: true } : item));
            } else {
                toast.error('Failed to report content');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-muted/10">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">History</h1>
                        <p className="text-muted-foreground">View and manage your past generations.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        No history found. Start generating content!
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="space-y-4">
                        {history.map((item) => {
                            // Parse response_json if available
                            let structuredData: any = null;
                            let availablePlatforms: string[] = [];

                            if ((item as any).response_json) {
                                try {
                                    structuredData = (item as any).response_json;
                                    // Handle case where it might be double-stringified or just the object
                                    if (typeof structuredData === 'string') {
                                        structuredData = JSON.parse(structuredData);
                                    }
                                    if (structuredData?.outputs) {
                                        availablePlatforms = structuredData.outputs.map((o: any) => o.platform.toLowerCase());
                                    }
                                } catch (e) {
                                    console.error("Error parsing response_json", e);
                                }
                            }

                            // Fallback for legacy data (excluding LinkedIn as requested)
                            if (availablePlatforms.length === 0) {
                                availablePlatforms = ['youtube', 'tiktok', 'instagram', 'twitter'];
                            }

                            // Filter out LinkedIn if it somehow got in (user requested removal)
                            availablePlatforms = availablePlatforms.filter(p => p !== 'linkedin');

                            const defaultTab = availablePlatforms[0] || 'youtube';

                            return (
                                <AccordionItem key={item.id} value={`item-${item.id}`} className="border rounded-lg bg-card px-4">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex flex-col items-start gap-1 text-left">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{item.purpose}</Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </span>
                                                    {item.is_flagged && <Badge variant="destructive" className="text-xs">Reported</Badge>}
                                                </div>
                                                <span className="text-sm font-medium line-clamp-1 text-muted-foreground">
                                                    {item.input_text || item.input_url || 'No input'}
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 pb-6 border-t">
                                        <Tabs defaultValue={defaultTab} className="w-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <TabsList>
                                                    {availablePlatforms.map(p => (
                                                        <TabsTrigger key={p} value={p} className="capitalize">
                                                            {p}
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500" onClick={() => setReportingId(item.id)}>
                                                            <Flag className="w-4 h-4 mr-2" />
                                                            Report Issue
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Report Content</DialogTitle>
                                                            <DialogDescription>
                                                                Please describe why this content is problematic. We will review it shortly.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <Textarea
                                                            placeholder="Describe the issue..."
                                                            value={reportReason}
                                                            onChange={(e) => setReportReason(e.target.value)}
                                                        />
                                                        <DialogFooter>
                                                            <Button onClick={handleReport}>Submit Report</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>

                                            {/* Content Display Logic */}
                                            {availablePlatforms.map((platform) => {
                                                // Find data for this platform
                                                const platformData = structuredData?.outputs?.find((o: any) => o.platform.toLowerCase() === platform);

                                                return (
                                                    <TabsContent key={platform} value={platform} className="space-y-4">
                                                        {platformData ? (
                                                            // NEW DATA DISPLAY
                                                            <div className="space-y-6">
                                                                {/* Header with Time */}
                                                                {platformData.best_posting_time && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full border">
                                                                            <Clock className="w-3 h-3" /> {platformData.best_posting_time}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {platformData.title && (
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center justify-between">
                                                                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Title / Hook</h3>
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(platformData.title)}>
                                                                                <Copy className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                        <div className="p-3 bg-muted/50 rounded-lg text-sm font-medium">
                                                                            {platformData.title}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {(platformData.content || platformData.description || platformData.caption) && (
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center justify-between">
                                                                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Content</h3>
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(platformData.content || platformData.description || platformData.caption)}>
                                                                                <Copy className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                        <div className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg border border-muted/50 leading-relaxed">
                                                                            {platformData.content || platformData.description || platformData.caption}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* CTAs */}
                                                                {platformData.cta_variations && platformData.cta_variations.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">CTA Options</h3>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {platformData.cta_variations.map((cta: string, idx: number) => (
                                                                                <Button
                                                                                    key={idx}
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="text-xs h-auto py-2 px-3 whitespace-normal text-left justify-between group"
                                                                                    onClick={() => handleCopy(cta)}
                                                                                >
                                                                                    <span className="line-clamp-2">{cta}</span>
                                                                                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0 ml-2" />
                                                                                </Button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {platformData.hashtags && platformData.hashtags.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Hashtags</h3>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {platformData.hashtags.map((tag: string, i: number) => (
                                                                                <Badge key={i} variant="secondary" className="text-xs font-normal">{tag}</Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Media Suggestion */}
                                                                {platformData.media_suggestion && (
                                                                    <div className="space-y-2">
                                                                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Media Idea 🖼️</h3>
                                                                        <div className="text-sm italic text-muted-foreground bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                                                            {platformData.media_suggestion}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Engagement & Trends */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {platformData.engagement_prediction && (
                                                                        <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-900/20">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <Zap className="w-4 h-4 text-purple-600" />
                                                                                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">Virality Score</span>
                                                                            </div>
                                                                            <div className="text-2xl font-black text-purple-600">{platformData.engagement_prediction.score}/10</div>
                                                                            <p className="text-xs text-muted-foreground mt-1 leading-tight">
                                                                                {platformData.engagement_prediction.reason}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {platformData.trend_matching && (
                                                                        <div className="bg-pink-50 dark:bg-pink-900/10 p-3 rounded-lg border border-pink-100 dark:border-pink-900/20">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <TrendingUp className="w-4 h-4 text-pink-600" />
                                                                                <span className="text-xs font-bold text-pink-700 dark:text-pink-400 uppercase">Trend Match</span>
                                                                            </div>
                                                                            <p className="text-xs text-muted-foreground leading-tight">
                                                                                {platformData.trend_matching}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Monetization */}
                                                                {platformData.monetization && (
                                                                    <div className="mt-6 pt-4 border-t border-dashed">
                                                                        <div className="flex items-center gap-2 mb-2 text-green-600">
                                                                            <Sparkles className="w-4 h-4" />
                                                                            <span className="font-semibold text-sm">Monetization Suggestion</span>
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground italic">
                                                                            {platformData.monetization}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            // FALLBACK FOR OLD DATA
                                                            <div className="space-y-2">
                                                                <p className="text-xs text-muted-foreground italic mb-2">Legacy data view</p>
                                                                {platform === 'youtube' && item.titles?.map((t, i) => (
                                                                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                                                                        <span>{t}</span>
                                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(t)}><Copy className="h-3 w-3" /></Button>
                                                                    </div>
                                                                ))}
                                                                {platform !== 'youtube' && item.headlines?.map((h, i) => (
                                                                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                                                                        <span>{h}</span>
                                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(h)}><Copy className="h-3 w-3" /></Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </TabsContent>
                                                );
                                            })}
                                        </Tabs>


                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}
            </main>
            <Footer />
        </div>
    );
}
