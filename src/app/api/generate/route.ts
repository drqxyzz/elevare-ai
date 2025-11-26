import { NextResponse } from 'next/server';
import { model } from '@/lib/ai/gemini';
import { scrapeUrl } from '@/lib/scraper';
import { getOrCreateUser, incrementUsage, saveGeneratedPost, getUserUsage } from '@/lib/db/actions';
import { auth0 } from '@/lib/auth0';

export async function POST(req: Request) {
    console.log("Generate API Triggered");
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            console.warn("Unauthorized access attempt");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user } = session;
        console.log(`User authenticated: ${user.sub}`);


        const { url, text, purpose, tone = 'Professional', platforms = ['linkedin'], monetization = false } = await req.json();
        console.log(`Input received - URL: ${!!url}, Text: ${!!text}, Purpose: ${!!purpose}, Tone: ${tone}, Platforms: ${platforms}, Monetization: ${monetization}`);

        if (!url && !text) {
            return NextResponse.json({ error: 'URL or text is required' }, { status: 400 });
        }

        // DB Operations
        console.log("Connecting to DB...");
        const dbUser = await getOrCreateUser(user.sub as string, user.email as string);
        console.log(`DB User retrieved: ${dbUser.id}, Role: ${dbUser.role}, Usage: ${dbUser.usage_count}`);

        // Check usage limit and suspension
        const userUsage = await getUserUsage(session.user.sub);

        if (userUsage?.is_suspended) {
            return NextResponse.json({ error: 'Your account has been suspended.' }, { status: 403 });
        }

        const limit = userUsage?.role === 'premium' || userUsage?.role === 'vip' || userUsage?.role === 'developer' ? 1000 : 5; // Free limit
        if (userUsage && userUsage.usage_count >= limit) {
            console.warn(`Limit reached for role ${dbUser.role}`);
            return NextResponse.json({ error: 'Limit reached', limitReached: true }, { status: 403 });
        }

        // Enforce Free Tier Limits
        let effectiveTone = tone;
        let effectivePlatforms = platforms;
        let includeInsights = true;

        if (userUsage?.role === 'free') {
            // Lock Tone
            effectiveTone = 'Professional';

            // Lock Platforms (No YouTube/TikTok) & Limit to 1
            const allowedPlatforms = ['twitter', 'linkedin', 'instagram'];
            effectivePlatforms = platforms.filter((p: string) => allowedPlatforms.includes(p));

            if (effectivePlatforms.length > 1) {
                effectivePlatforms = [effectivePlatforms[0]];
            }

            if (effectivePlatforms.length === 0) {
                // Default if user tried to select only restricted platforms
                effectivePlatforms = ['twitter'];
            }

            // Disable Insights
            includeInsights = false;
        }

        // 4. Scrape URL if provided
        let context = text || '';
        if (url) {
            try {
                const scrapedContent = await scrapeUrl(url);
                context = `Source URL: ${url}\n\nContent:\n${scrapedContent}\n\nUser Notes: ${text}`;
            } catch (error) {
                console.error('Scraping failed:', error);
                // Fallback to just using the URL as context if scraping fails
                context = `Source URL: ${url}\n\nUser Notes: ${text}`;
            }
        }

        // 5. Construct Prompt
        const prompt = `
        You are an expert social media marketing strategist.
        
        CONTEXT:
        ${context}
        
        GOAL:
        ${purpose}
        
        TONE:
        ${effectiveTone}
        
        PLATFORMS:
        ${effectivePlatforms.join(', ')}
        
        INSTRUCTIONS:
        Generate a JSON response with a list of outputs for the requested platforms.
        Each output object must contain:
        - platform: The platform name (e.g., "Twitter")
        - title: A catchy hook or title
        - content: The full post content (use appropriate formatting/emojis)
        - media_suggestion: A specific idea for an image or video to attach
        - hashtags: A list of 3-5 relevant hashtags
        - cta_variations: A list of 2 Call-to-Action options
        ${includeInsights ? `- engagement_prediction: Object { score: number (1-10), reason: string }
        - trend_matching: String explaining how this fits current trends` : ''}
        - monetization: A brief tip on how to monetize this specific post
        
        STRICT RULES:
        - Return ONLY valid JSON.
        - Do not include markdown formatting like \`\`\`json.
        - Ensure all requested fields are present.
        `;
        // AI Generation
        console.log("Preparing AI prompt...");


        console.log("Sending request to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOutput = response.text();
        console.log("Gemini response received. Raw length:", textOutput.length);
        console.log("Raw Output Preview:", textOutput.substring(0, 200) + "...");

        // Clean up markdown code blocks if present (more robust regex)
        const cleanJson = textOutput.replace(/```(?: json) ?\n ? /g, '').replace(/```/g, '').trim();

        let data;
        try {
            data = JSON.parse(cleanJson);
        } catch (error) {
            console.error('Failed to parse AI response. Raw output:', textOutput);
            console.error('Parse error:', error);
            return NextResponse.json({
                error: 'AI generation failed to produce valid JSON',
                details: 'The model returned an invalid response format.',
                raw_preview: textOutput.substring(0, 500)
            }, { status: 500 });
        }

        // Extract arrays for DB (backward compatibility - use first output)
        const titles = data.outputs.map((o: any) => o.title || o.platform).filter(Boolean);
        const headlines = data.outputs.map((o: any) => (o.content || o.description || '').substring(0, 50) + '...').filter(Boolean);
        const suggestions = data.outputs.map((o: any) => o.monetization).filter(Boolean).join('\n');

        // Save to DB
        console.log("Saving to DB...");
        await saveGeneratedPost(dbUser.id, url || '', text || '', purpose, titles, headlines, suggestions, data);
        await incrementUsage(dbUser.id);
        console.log("Saved successfully");

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Generate API Error:', error);
        // Return detailed error for debugging (remove in production later)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message, stack: error.stack }, { status: 500 });
    }
}
