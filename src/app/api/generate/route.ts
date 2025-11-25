import { NextResponse } from 'next/server';
import { model } from '@/lib/ai/gemini';
import { scrapeUrl } from '@/lib/scraper';
import { getOrCreateUser, incrementUsage, saveGeneratedPost } from '@/lib/db/actions';
import { auth0 } from '@/lib/auth0';

export async function POST(req: Request) {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user } = session;
        const { url, text, purpose } = await req.json();

        if (!url && !text) {
            return NextResponse.json({ error: 'URL or text is required' }, { status: 400 });
        }

        // DB Operations
        const dbUser = await getOrCreateUser(user.sub as string, user.email as string);

        if (dbUser.role === 'free' && dbUser.usage_count >= 3) {
            return NextResponse.json({ error: 'Free limit reached', limitReached: true }, { status: 403 });
        }

        // Scrape URL if provided
        let scrapedContent = '';
        if (url) {
            try {
                const scraped = await scrapeUrl(url);
                if (scraped) {
                    scrapedContent = scraped;
                } else {
                    console.warn(`Failed to scrape URL: ${url}`);
                }
            } catch (e) {
                console.error(`Error scraping URL: ${url}`, e);
            }
        }

        // AI Generation
        const prompt = `
      Act as a professional social media marketing expert.
      I need you to generate content for a LinkedIn and Twitter post.
      
      Context/Input:
      ${scrapedContent ? `Source Content:\n${scrapedContent}` : `Text:\n${text}`}
      
      ${url ? `Original URL: ${url}` : ''}
      
      Purpose/Goal: ${purpose}
      
      Please generate:
      1. 5 Engaging Titles (catchy, professional)
      2. 5 Headlines per Title (variations) - Wait, actually just 5 Headlines total that are distinct.
      3. Suggestions for the post body (tone, structure, key points).
      
      Output MUST be valid JSON with this structure:
      {
        "titles": ["title1", "title2", ...],
        "headlines": ["headline1", "headline2", ...],
        "suggestions": "markdown string of suggestions"
      }
      Do not include markdown code blocks in the output, just the raw JSON string.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOutput = response.text();

        // Clean up markdown code blocks if present
        const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();

        let data;
        try {
            data = JSON.parse(cleanJson);
        } catch {
            console.error('Failed to parse AI response', textOutput);
            return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
        }

        // Save to DB
        await saveGeneratedPost(dbUser.id, url || '', text || '', purpose, data.titles, data.headlines, data.suggestions);
        await incrementUsage(dbUser.id);

        return NextResponse.json(data);

    } catch (error) {
        console.error('Generate API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
