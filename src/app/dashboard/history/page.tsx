'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag, Copy, Check, ExternalLink } from 'lucide-react';
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
                            if ((item as any).response_json) {
                                try {
                                    structuredData = (item as any).response_json;
                                    // Handle case where it might be double-stringified or just the object
                                    if (typeof structuredData === 'string') {
                                        structuredData = JSON.parse(structuredData);
                                    }
                                } catch (e) {
                                    console.error("Error parsing response_json", e);
                                }
                            }

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
                                        <Tabs defaultValue="youtube" className="w-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <TabsList>
                                                    <TabsTrigger value="youtube">YouTube</TabsTrigger>
                                                    <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                                                    <TabsTrigger value="instagram">Instagram</TabsTrigger>
                                                    <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                                                    <TabsTrigger value="twitter">Twitter</TabsTrigger>
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
                                            {['youtube', 'tiktok', 'instagram', 'linkedin', 'twitter'].map((platform) => {
                                                // Find data for this platform
                                                const platformData = structuredData?.outputs?.find((o: any) => o.platform.toLowerCase() === platform);

                                                return (
                                                    <TabsContent key={platform} value={platform} className="space-y-4">
                                                        {platformData ? (
                                                            // NEW DATA DISPLAY
                                                            <div className="space-y-4">
                                                                {platformData.title && (
                                                                    <div className="space-y-1">
                                                                        <h3 className="font-semibold text-sm">Title / Hook</h3>
                                                                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded text-sm">
                                                                            <span>{platformData.title}</span>
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(platformData.title)}>
                                                                                <Copy className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {(platformData.content || platformData.description || platformData.caption) && (
                                                                    <div className="space-y-1">
                                                                        <h3 className="font-semibold text-sm">Content</h3>
                                                                        <div className="relative p-3 bg-muted/50 rounded text-sm whitespace-pre-wrap">
                                                                            {platformData.content || platformData.description || platformData.caption}
                                                                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleCopy(platformData.content || platformData.description || platformData.caption)}>
                                                                                <Copy className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {platformData.hashtags && platformData.hashtags.length > 0 && (
                                                                    <div className="space-y-1">
                                                                        <h3 className="font-semibold text-sm">Hashtags</h3>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {platformData.hashtags.map((tag: string, i: number) => (
                                                                                <Badge key={i} variant="secondary">{tag}</Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            // FALLBACK FOR OLD DATA (or missing platform)
                                                            <div className="space-y-2">
                                                                <p className="text-xs text-muted-foreground italic mb-2">Legacy data view (Platform details may be mixed)</p>
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

                                        <div className="mt-6 pt-4 border-t">
                                            <h3 className="font-semibold text-sm mb-2">AI Suggestions</h3>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.suggestions}</p>
                                        </div>
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
