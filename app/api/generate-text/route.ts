import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper to extract base64 data and MIME type from data URL
function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, images } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Use Gemini 2.5 Flash for text generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build content parts for multimodal request
    const parts: Part[] = [];

    // Add images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.url && img.url.startsWith('data:')) {
          const parsed = parseDataUrl(img.url);
          if (parsed) {
            parts.push({
              inlineData: {
                mimeType: parsed.mimeType,
                data: parsed.data,
              },
            });
          }
        }
      }
    }

    // Add text prompt
    parts.push({ text: prompt });

    const result = await model.generateContent(parts);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Text generation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate text' },
      { status: 500 }
    );
  }
}
