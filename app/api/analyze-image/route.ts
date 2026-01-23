import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Handle base64 data URLs directly
    let imageData: { mimeType: string; data: string };

    if (imageUrl.startsWith('data:')) {
      // Parse base64 data URL
      const matches = imageUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 image format');
      }
      imageData = {
        mimeType: matches[1],
        data: matches[2],
      };
    } else {
      // Fetch image and convert to base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image');
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

      imageData = {
        mimeType: contentType,
        data: base64Image,
      };
    }

    const result = await model.generateContent([
      {
        inlineData: imageData,
      },
      {
        text: `Analyze this image and provide:
1. Main subject and composition
2. Visual style and mood
3. Colors and lighting
4. Suggested prompt for AI image generation
5. Pose description if person is present

Format as JSON with keys: subject, style, colors, suggestedPrompt, poseDescription`,
      },
    ]);

    const text = result.response.text();

    // Try to parse as JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const analysis = JSON.parse(jsonMatch[0]);
        return NextResponse.json(analysis);
      } catch {
        // If JSON parsing fails, return raw text
        return NextResponse.json({
          subject: text,
          style: '',
          colors: '',
          suggestedPrompt: text,
          poseDescription: '',
        });
      }
    }

    return NextResponse.json({
      subject: text,
      style: '',
      colors: '',
      suggestedPrompt: text,
      poseDescription: '',
    });
  } catch (error: any) {
    console.error('Image analysis failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
