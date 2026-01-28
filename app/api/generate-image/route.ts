import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { storageService } from '@/lib/storage';

// Zod schema for request validation
const generateImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  sourceImage: z.string().optional(),
  aspectRatio: z
    .enum(['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9'])
    .optional()
    .nullable(),
});

// Type for Gemini response parts
interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

/**
 * Fetch image from URL and convert to base64
 * Used when source image is an R2 URL instead of base64
 */
async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch source image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');

  // Get content type from response headers
  const contentType = response.headers.get('content-type') || 'image/png';

  return `data:${contentType};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const parseResult = generateImageSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    let { prompt, sourceImage, aspectRatio } = parseResult.data;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // If source image is a URL (not base64), fetch and convert it
    if (sourceImage && !sourceImage.startsWith('data:')) {
      sourceImage = await fetchImageAsBase64(sourceImage);
    }

    // Initialize the new Google GenAI client
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Build config with responseModalities and optional aspectRatio
    const config: Record<string, unknown> = {
      responseModalities: ['Text', 'Image'],
    };

    // Add imageConfig with aspectRatio if specified (not auto/null)
    if (aspectRatio) {
      config.imageConfig = {
        aspectRatio: aspectRatio,
      };
    }

    let result;

    if (sourceImage) {
      // Image-to-image: include source image as inline data
      const base64Match = sourceImage.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!base64Match) {
        throw new Error('Invalid source image format');
      }
      const mimeType = `image/${base64Match[1]}`;
      const base64Data = base64Match[2];

      result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config,
      });
    } else {
      // Text-to-image generation
      result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
        config,
      });
    }

    // Extract image from response
    const candidates = result.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error('No response from model');
    }

    const parts = candidates[0].content?.parts as GeminiPart[] | undefined;
    if (!parts) {
      throw new Error('No content parts in response');
    }

    const imagePart = parts.find(
      (part: GeminiPart) => part.inlineData?.mimeType?.startsWith('image/')
    );

    if (!imagePart || !imagePart.inlineData) {
      // Check if there's a text response explaining why no image was generated
      const textPart = parts.find((part: GeminiPart) => part.text);
      if (textPart) {
        throw new Error(`Model response: ${textPart.text}`);
      }
      throw new Error('No image in response');
    }

    // Create base64 data URL for upload
    const base64DataUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    // Upload to R2
    const uploadResult = await storageService.uploadBase64(base64DataUrl, {
      folder: 'generated',
    });

    return NextResponse.json({
      imageUrl: uploadResult.url,
      key: uploadResult.key,
    });
  } catch (error) {
    console.error('Image generation failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
