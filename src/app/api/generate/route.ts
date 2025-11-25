import { NextResponse } from 'next/server';
import { model } from '@/lib/ai/gemini';
import { scrapeUrl } from '@/lib/scraper';
import { getOrCreateUser, incrementUsage, saveGeneratedPost } from '@/lib/db/actions';
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

        const { url, text, purpose } = await req.json();
        console.log(`Input received - URL: ${!!url}, Text: ${!!text}, Purpose: ${!!purpose}`);

        if (!url && !text) {
            return NextResponse.json({ error: 'URL or text is required' }, { status: 400 });
        }

        // DB Operations
        console.log("Connecting to DB...");
        const dbUser = await getOrCreateUser(user.sub as string, user.email as string);
        console.log(`DB User retrieved: ${dbUser.id}, Role: ${dbUser.role}, Usage: ${dbUser.usage_count}`);

        // Check Limits
        let limit = 3;
        if (dbUser.role === 'premium') limit = 60;
        if (dbUser.role === 'developer' || dbUser.role === 'vip') limit = 999999;

        if (dbUser.usage_count >= limit) {
            console.warn(`Limit reached for role ${dbUser.role}`);
            return NextResponse.json({ error: 'Limit reached', limitReached: true }, { status: 403 });
        }

        // Scrape URL if provided
        let scrapedContent = '';
        if (url) {
            console.log(`Scraping URL: ${url}`);
            try {
                const scraped = await scrapeUrl(url);
                if (scraped) {
                    scrapedContent = scraped;
                    console.log("Scraping successful");
                } else {
                    console.warn(`Failed to scrape URL: ${url}`);
                }
            } catch (e) {
                console.error(`Error scraping URL: ${url}`, e);
            }
        }

        // AI Generation
        console.log("Preparing AI prompt...");
        const prompt = `
      You are an expert social media strategist with a modern, 2025 creator vibe.
      Platform: LinkedIn & Twitter
      Topic: ${text}
      URL Context: ${scrapedContent ? `Content from URL: ${scrapedContent.substring(0, 5000)}` : 'No URL provided'}
      Purpose/Goal: ${purpose}
      
      STRICT OUTPUT RULES:
      1. **Tone**: Modern, human, authentic, smart. NOT corporate, robotic, or academic.
      2. **Titles**: Short, clean, punchy. No labels like "Option 1". Pure human text.
      3. **Headlines**: 8-12 word hooks. Modern creator style. No "Headline:" prefixes.
      4. **Suggestions**: 
         - A simple, clean list of 5-8 natural suggestions.
         - Use dash-style list items (-).
         - Each suggestion 1 sentence max.
         - NO formal categories (Tone, Structure, Key Points, etc.).
         - NO bold labels.
         - Vibe: Clean, useful, friendly.

      Output MUST be valid JSON with this structure:
      {
        "posts": [
          { "title": "Title 1", "headline": "Headline 1" },
          { "title": "Title 2", "headline": "Headline 2" }
          ... (5 total)
        ],
        "suggestions": "markdown string of suggestions (just the dash list)"
      }
      Do not include markdown code blocks in the output, just the raw JSON string.
    `;

        console.log("Sending request to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOutput = response.text();
        console.log("Gemini response received");

        // Clean up markdown code blocks if present
        const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();

        let data;
        try {
            data = JSON.parse(cleanJson);
        } catch {
            console.error('Failed to parse AI response', textOutput);
            return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
        }

        // Extract arrays for DB (backward compatibility)
        const titles = data.posts.map((p: any) => p.title);
        const headlines = data.posts.map((p: any) => p.headline);

        // Save to DB
        console.log("Saving to DB...");
        await saveGeneratedPost(dbUser.id, url || '', text || '', purpose, titles, headlines, data.suggestions);
        await incrementUsage(dbUser.id);
        console.log("Saved successfully");

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Generate API Error:', error);
        // Return detailed error for debugging (remove in production later)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message, stack: error.stack }, { status: 500 });
    }
}
