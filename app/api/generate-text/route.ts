import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

// Zod schema for connected images
const connectedImageSchema = z.object({
  id: z.string(),
  url: z.string(),
});

// Zod schema for request validation
const generateTextSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  images: z.array(connectedImageSchema).optional(),
});

// Helper to extract base64 data and MIME type from data URL
function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const parseResult = generateTextSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { prompt, images } = parseResult.data;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Initialize the new Google GenAI client
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Build content parts for multimodal request
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

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

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
    });

    // Extract text from response
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Text generation failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate text';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
