import { NextResponse } from 'next/server';

export async function GET() {
    const hasKey = !!process.env.GEMINI_API_KEY;
    const keyPreview = process.env.GEMINI_API_KEY?.substring(0, 8) || 'N/A';

    return NextResponse.json({
        hasGeminiKey: hasKey,
        keyPreview: hasKey ? `${keyPreview}...` : 'MISSING',
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API'))
    });
}
