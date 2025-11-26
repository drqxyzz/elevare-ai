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

        // Check usage limit and suspension
        const limit = userUsage?.role === 'premium' || userUsage?.role === 'vip' || userUsage?.role === 'developer' ? 1000 : 5; // Total limit (legacy/backup)
        const dailyLimit = 3;

        // Check Daily Limit for Free Users
        if (userUsage?.role === 'free') {
            const lastDate = new Date(userUsage.last_usage_date).toDateString();
            const today = new Date().toDateString();

            // If it's the same day and they've reached the limit
            if (lastDate === today && userUsage.daily_usage_count >= dailyLimit) {
                return NextResponse.json({
                    error: 'Daily limit reached. Resets in 24h.',
                    limitReached: true,
                    isDailyLimit: true
                }, { status: 403 });
            }
        }

        if (userUsage && userUsage.usage_count >= limit) {
            console.warn(`Limit reached for role ${dbUser.role}`);
            return NextResponse.json({ error: 'Total limit reached', limitReached: true }, { status: 403 });
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
        Generate a VALID JSON response containing a list of social media posts.
        
        The output MUST be a single JSON object with the following structure:
        {
          "outputs": [
            {
              "platform": "Platform Name",
              "title": "Hook/Title",
              "content": "Post Content",
              "media_suggestion": "Visual Idea",
              "hashtags": ["#tag1", "#tag2"],
              "cta_variations": ["CTA 1", "CTA 2"],
              "monetization": "Monetization Tip"
              ${includeInsights ? `,
              "engagement_prediction": { "score": 8, "reason": "Why it goes viral" },
              "trend_matching": "Trend explanation"` : ''}
            }
          ]
        }

        STRICT RULES:
        1. Return ONLY the raw JSON string.
        2. Do NOT wrap the output in markdown code blocks (e.g., no \`\`\`json).
        3. Do NOT include any introductory or concluding text.
        4. Ensure all JSON keys and string values are properly quoted.
        5. Ensure the JSON is valid and parseable.
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
        let cleanJson = textOutput.replace(/```(?: json)?\n?/g, '').replace(/```/g, '').trim();

        // Find the first '{' and last '}' to extract just the JSON object if there's extra text
        const firstOpen = cleanJson.indexOf('{');
        const lastClose = cleanJson.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1) {
            cleanJson = cleanJson.substring(firstOpen, lastClose + 1);
        }

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
