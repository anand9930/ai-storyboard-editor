import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY,
});

// Helper to convert base64 data URL to a FAL-compatible URL
async function prepareImageUrl(imageData: string): Promise<string> {
  // If it's already a URL, return as-is
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }

  // If it's a base64 data URL, upload to FAL storage
  if (imageData.startsWith('data:')) {
    // Convert base64 to blob
    const response = await fetch(imageData);
    const blob = await response.blob();

    // Upload to FAL storage
    const uploadedUrl = await fal.storage.upload(blob);
    return uploadedUrl;
  }

  throw new Error('Invalid image format');
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, sourceImage } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: 'FAL_KEY is not configured' },
        { status: 500 }
      );
    }

    let result;

    if (sourceImage) {
      // Convert base64 to FAL storage URL if needed
      const imageUrl = await prepareImageUrl(sourceImage);

      // Image-to-image transformation using FLUX Redux
      result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
        input: {
          prompt,
          image_url: imageUrl,
          strength: 0.75,
          num_images: 1,
        },
      });
    } else {
      // Text-to-image generation using FLUX
      result = await fal.subscribe('fal-ai/flux/dev', {
        input: {
          prompt,
          image_size: 'square_hd',
          num_images: 1,
        },
      });
    }

    const generatedImageUrl = result.data?.images?.[0]?.url;

    if (!generatedImageUrl) {
      throw new Error('No image URL in response');
    }

    return NextResponse.json({ imageUrl: generatedImageUrl });
  } catch (error: any) {
    console.error('Image generation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
