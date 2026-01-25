import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { prompt, sourceImage } = await req.json();

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

    // Initialize Gemini model with image generation capability
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image',
      generationConfig: {
        // @ts-expect-error - responseModalities is supported but not in types yet
        responseModalities: ['Text', 'Image'],
      },
    });

    let result;

    if (sourceImage) {
      // Image-to-image: include source image as inline data
      // Extract base64 data from data URL
      const base64Match = sourceImage.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!base64Match) {
        throw new Error('Invalid source image format');
      }
      const mimeType = `image/${base64Match[1]}`;
      const base64Data = base64Match[2];

      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
      ]);
    } else {
      // Text-to-image generation
      result = await model.generateContent(prompt);
    }

    // Extract image from response
    const response = result.response;
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error('No response from model');
    }

    const parts = candidates[0].content.parts;
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
