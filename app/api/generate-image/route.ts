import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, sourceImage, aspectRatio } = await req.json();

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

    const parts = candidates[0].content?.parts;
    if (!parts) {
      throw new Error('No content parts in response');
    }

    const imagePart = parts.find(
      (part: any) => part.inlineData?.mimeType?.startsWith('image/')
    );

    if (!imagePart || !imagePart.inlineData) {
      // Check if there's a text response explaining why no image was generated
      const textPart = parts.find((part: any) => part.text);
      if (textPart) {
        throw new Error(`Model response: ${textPart.text}`);
      }
      throw new Error('No image in response');
    }

    // Convert to data URL
    const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Image generation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
