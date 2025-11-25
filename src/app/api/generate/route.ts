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

        if (dbUser.role === 'free' && dbUser.usage_count >= 3) {
            console.warn("Free limit reached");
            return NextResponse.json({ error: 'Free limit reached', limitReached: true }, { status: 403 });
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
      Act as a professional social media marketing expert.
      I need you to generate content for a LinkedIn and Twitter post.
      
      Context/Input:
      ${scrapedContent ? `Source Content:\n${scrapedContent}` : `Text:\n${text}`}
      
      ${url ? `Original URL: ${url}` : ''}
      
      Purpose/Goal: ${purpose}
      
      Please generate:
      1. 5 Distinct Post Concepts.
      2. For each concept, provide a catchy Title and a compelling Headline.
      3. Suggestions for the post body (tone, structure, key points).
      
      Output MUST be valid JSON with this structure:
      {
        "posts": [
          { "title": "Title 1", "headline": "Headline 1" },
          { "title": "Title 2", "headline": "Headline 2" }
        ],
        "suggestions": "markdown string of suggestions"
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
