import * as cheerio from 'cheerio';

export async function scrapeUrl(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ElevareBot/1.0; +https://elevare.network)'
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch URL: ${url}, status: ${response.status}`);
            return null;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove scripts, styles, and other non-content elements
        $('script, style, nav, footer, iframe, noscript').remove();

        // Extract title and meta description
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content')?.trim() || '';

        // Extract main body text
        // Try to find main content container first
        let content = $('main, article, #content, .content').text();

        // If no main container found, fallback to body
        if (!content.trim()) {
            content = $('body').text();
        }

        // Clean up whitespace
        const cleanContent = content.replace(/\s+/g, ' ').trim();

        // Limit content length to avoid token limits (approx 10k chars)
        const truncatedContent = cleanContent.slice(0, 10000);

        return `Title: ${title}\nDescription: ${description}\n\nContent:\n${truncatedContent}`;

    } catch (error) {
        console.error(`Error scraping URL: ${url}`, error);
        return null;
    }
}
