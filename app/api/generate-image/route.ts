import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, sourceImage } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.BANANA_PRO_API_URL;
    const apiKey = process.env.BANANA_PRO_API_KEY;

    if (!apiUrl || !apiKey) {
      // Return a placeholder response for development/demo
      // In production, remove this and return the error
      console.warn('Banana Pro API not configured, returning placeholder');
      return NextResponse.json({
        imageUrl: `https://placehold.co/512x512/1a1a1a/3b82f6?text=${encodeURIComponent(prompt.slice(0, 20))}`,
        warning: 'Using placeholder - configure BANANA_PRO_API_URL and BANANA_PRO_API_KEY',
      });
    }

    // Call Banana Pro API for image generation
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image: sourceImage, // For image-to-image transformation
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Banana API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Handle different response formats from various image APIs
    const imageUrl =
      result.output?.[0] ||
      result.url ||
      result.data?.[0]?.url ||
      result.images?.[0]?.url ||
      result.image;

    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Image generation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
