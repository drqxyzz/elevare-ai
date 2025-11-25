import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
    }

    try {
        // We can't list models directly with the high-level SDK easily in all versions,
        // but we can try to use the model manager if available or just test a few common ones.
        // Actually, the SDK *does* have a listModels method on the GoogleGenerativeAI instance? 
        // No, it's usually on a ModelManager or similar.
        // Let's try to fetch via REST API directly to be sure.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
