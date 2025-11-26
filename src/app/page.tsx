import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Sparkles,
  ArrowRight,
  Target,
  Layout,
  Lightbulb,
  ClipboardList,
  Settings2,
  CheckCircle2,
  Star,
  Zap
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background dark:from-primary/10"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-muted/50 backdrop-blur-sm border border-border px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-Powered Marketing Assistant</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Elevate Your Brand with <br className="hidden md:block" />
              <span className="text-primary">AI-Powered Marketing</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Generate viral social media content, professional headers, and actionable marketing strategies in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Everything You Need Section */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Comprehensive tools to elevate your brand and streamline your content creation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                    <Target className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">Marketing Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get 3 unique, actionable marketing strategies tailored to your niche and goals.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                    <Layout className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">Social Headers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Professional headers for Twitter and LinkedIn that capture attention instantly.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">Content Ideas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Never run out of ideas with 5 AI-generated post suggestions optimized for engagement.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From idea to viral post in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-border via-primary/20 to-border -z-10"></div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-background border-2 border-border rounded-full flex items-center justify-center mb-6 group-hover:border-primary transition-colors shadow-sm">
                  <ClipboardList className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Input Context</h3>
                <p className="text-muted-foreground">
                  Paste a URL or enter manual text about your topic or business.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-background border-2 border-border rounded-full flex items-center justify-center mb-6 group-hover:border-primary transition-colors shadow-sm">
                  <Settings2 className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Select Purpose</h3>
                <p className="text-muted-foreground">
                  Define your goal (e.g., &quot;Launch Product&quot;, &quot;Thought Leadership&quot;).
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-background border-2 border-border rounded-full flex items-center justify-center mb-6 group-hover:border-primary transition-colors shadow-sm">
                  <Sparkles className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Generate</h3>
                <p className="text-muted-foreground">
                  Get instant titles, headlines, and post suggestions ready to share.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get Section (MacBook Style) */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
                <p className="text-muted-foreground text-lg">
                  High-quality output designed for professional use.
                </p>
              </div>

              <div className="relative rounded-xl bg-background shadow-2xl border border-border overflow-hidden">
                {/* Window Controls */}
                <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-muted/10">

                  {/* Left: Input Form */}
                  <div className="space-y-6">
                    <Card className="border-muted/60 shadow-sm h-full">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Content Generator</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                          <div className="h-10 w-full bg-muted/50 rounded border border-border/50 flex items-center px-3 text-sm text-muted-foreground">
                            https://techcrunch.com/ai-marketing...
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                          <div className="h-32 w-full bg-muted/50 rounded border border-border/50 p-3 text-sm font-mono text-foreground/80 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/10 pointer-events-none"></div>
                            <span className="animate-typing">
                              Summarize this article and create a viral LinkedIn post about the future of AI in marketing. Focus on the benefits for small businesses...
                            </span>
                            <span className="inline-block w-1.5 h-4 bg-primary ml-1 animate-blink"></span>
                          </div>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                          <Sparkles className="w-4 h-4 mr-2" /> Generate Magic
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right: Results */}
                  <div className="space-y-6">
                    <Card className="border-muted shadow-lg h-full">
                      <CardContent className="p-6 space-y-6">
                        {/* Mock Tabs */}
                        <div className="grid grid-cols-3 gap-1 mb-4 bg-muted/20 p-1 rounded-lg">
                          <div className="bg-background shadow-sm rounded-md py-1.5 text-center text-xs font-medium text-foreground">LinkedIn</div>
                          <div className="text-center py-1.5 text-xs font-medium text-muted-foreground">Twitter</div>
                          <div className="text-center py-1.5 text-xs font-medium text-muted-foreground">Instagram</div>
                        </div>

                        {/* Result Content */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="h-3 w-24 bg-muted rounded"></div>
                              <div className="h-6 w-6 bg-muted rounded-full"></div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg text-sm font-medium border border-border/50">
                              🚀 AI isn't coming for your job, it's coming to upgrade it.
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="h-3 w-16 bg-muted rounded"></div>
                            <div className="p-4 bg-muted/30 rounded-lg border border-muted/50 text-sm leading-relaxed text-muted-foreground">
                              <p className="mb-2">Small businesses are often overwhelmed by marketing. But with new AI tools, you can now compete with the big players.</p>
                              <p>Imagine generating a week's worth of content in minutes. That's the power of automation.</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <div className="h-6 w-20 bg-purple-100 dark:bg-purple-900/30 rounded-full border border-purple-200 dark:border-purple-800 flex items-center justify-center text-[10px] font-bold text-purple-600 dark:text-purple-400">
                              <Zap className="w-3 h-3 mr-1" /> 9.2/10
                            </div>
                            <div className="h-6 w-24 bg-pink-100 dark:bg-pink-900/30 rounded-full border border-pink-200 dark:border-pink-800 flex items-center justify-center text-[10px] font-bold text-pink-600 dark:text-pink-400">
                              <Target className="w-3 h-3 mr-1" /> Trending
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Trusted by Creators</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-muted/20 border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-1 text-yellow-500 mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    &quot;Elevare AI has completely transformed my LinkedIn workflow. I used to spend hours brainstorming, now it takes minutes.&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      SJ
                    </div>
                    <div>
                      <div className="font-semibold">Sarah Jenkins</div>
                      <div className="text-xs text-muted-foreground">Marketing Director</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-1 text-yellow-500 mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    &quot;The headline variations are a game changer. My engagement rate has doubled since I started using these suggestions.&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                      MR
                    </div>
                    <div>
                      <div className="font-semibold">Mike Ross</div>
                      <div className="text-xs text-muted-foreground">Founder, TechStart</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-1 text-yellow-500 mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    &quot;Simple, clean, and effective. Exactly what I needed to keep my personal brand active while running my business.&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                      AL
                    </div>
                    <div>
                      <div className="font-semibold">Alex Lee</div>
                      <div className="text-xs text-muted-foreground">Freelance Consultant</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-b from-background to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Elevate Your Brand Today</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join the new wave of creators using AI to build their audience faster.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
                Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
