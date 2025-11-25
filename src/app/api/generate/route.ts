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


        const { url, text, purpose, tone = 'Professional', platforms = ['linkedin'], monetization = false } = await req.json();
        console.log(`Input received - URL: ${!!url}, Text: ${!!text}, Purpose: ${!!purpose}, Tone: ${tone}, Platforms: ${platforms}, Monetization: ${monetization}`);

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
      You are an expert social media strategist.
      Target Platforms: ${platforms.join(', ')}
      Topic: ${text}
      URL Context: ${scrapedContent ? `Content from URL: ${scrapedContent.substring(0, 5000)}` : 'No URL provided'}
      Purpose/Goal: ${purpose}
      Tone/Vibe: ${tone}
      Include Monetization Suggestions: ${monetization ? 'YES' : 'NO'}
      
      STRICT OUTPUT RULES:
      1. **Tone**: You MUST adopt the "${tone}" persona.
         - If "Funny": Use humor, wit, maybe sarcasm.
         - If "Professional": Clean, authoritative, corporate-friendly.
         - If "Controversial": Bold, polarizing, opinionated.
         - If "Educational": Informative, teacher-like.
      2. **Structure**: Generate ONE high-quality post option for EACH selected platform.
      3. **Universal Requirements (ALL PLATFORMS MUST HAVE THESE)**:
         - **\`title\`**: The HOOK or Headline. (Even for Twitter/Instagram).
         - **\`media_suggestion\`**: Visual idea, Thumbnail concept, or Video style.
         - **\`hashtags\`**: Relevant tags (called \`tags\` for YouTube).
         - **\`cta_variations\`**: Array of 3 distinct Call-To-Actions (Low, Mid, High friction).
         - **\`trend_matching\`**: Suggest a trending audio, meme format, or visual style that fits.
         - **\`engagement_prediction\`**: Object with \`score\` (1-10) and \`reason\` (Why it will go viral).
         - **\`best_posting_time\`**: Suggest the optimal day/time to post this specific content.
      4. **Platform Specifics**:
         - **Twitter**: \`content\` (Tweet/Thread).
         - **YouTube**: \`description\` (Detailed, SEO).
         - **Instagram**: \`content\` (Caption).
         - **TikTok**: \`content\` (Script), \`caption\` (Short text).
      5. **Monetization** (If YES): Provide specific upsell/downsell ideas or CTA strategies.
      6. **NEGATIVE CONSTRAINTS (CRITICAL)**:
         - **NO Hashtags in \`content\`, \`description\`, or \`caption\` fields.** Put them ONLY in the \`hashtags\` array.
         - **NO Timestamps in \`content\` or \`description\`.**
         - **NO "Title:" or "Caption:" labels inside the text fields.**

      Output MUST be valid JSON with this structure:
      {
        "outputs": [
          {
            "platform": "twitter",
            "title": "The Hook / Tweet Opener",
            "content": "Tweet content...",
            "media_suggestion": "Image/GIF idea...",
            "hashtags": ["#tag1"],
            "cta_variations": ["Share if...", "Reply with...", "Click link..."],
            "trend_matching": "Use the 'X' meme format...",
            "engagement_prediction": { "score": 8, "reason": "High controversy potential..." },
            "best_posting_time": "Tuesday at 10:00 AM EST",
            "monetization": "..."
          },
          ... (one per selected platform)
        ]
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

        // Extract arrays for DB (backward compatibility - use first output)
        const titles = data.outputs.map((o: any) => o.title || o.platform).filter(Boolean);
        const headlines = data.outputs.map((o: any) => (o.content || o.description || '').substring(0, 50) + '...').filter(Boolean);
        const suggestions = data.outputs.map((o: any) => o.monetization).filter(Boolean).join('\n');

        // Save to DB
        console.log("Saving to DB...");
        await saveGeneratedPost(dbUser.id, url || '', text || '', purpose, titles, headlines, suggestions);
        await incrementUsage(dbUser.id);
        console.log("Saved successfully");

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Generate API Error:', error);
        // Return detailed error for debugging (remove in production later)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message, stack: error.stack }, { status: 500 });
    }
}
