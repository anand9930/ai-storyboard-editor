import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { storageService } from '@/lib/storage';
import { generateImage } from '@/lib/runwareService';
import { aspectRatioToDimensions } from '@/lib/aspectRatioUtils';
import { DEFAULT_IMAGE_MODEL } from '@/lib/imageModels';

// Zod schema for request validation
const generateImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().default(DEFAULT_IMAGE_MODEL.id),
  sourceImage: z.string().optional(), // R2 URL for image-to-image
  aspectRatio: z
    .enum(['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9'])
    .optional()
    .nullable(),
});

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

    const { prompt, model, sourceImage, aspectRatio } = parseResult.data;

    // Verify Runware API key is configured
    if (!process.env.RUNWARE_API_KEY) {
      return NextResponse.json(
        { error: 'RUNWARE_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Convert aspect ratio to width/height dimensions
    const { width, height } = aspectRatioToDimensions(aspectRatio ?? null);

    // Generate image using Runware SDK
    const results = await generateImage({
      prompt,
      model,
      seedImage: sourceImage, // R2 URL passed directly - Runware supports URLs
      width,
      height,
    });

    // Get the generated image URL
    const generatedImageUrl = results[0]?.imageURL;

    if (!generatedImageUrl) {
      throw new Error('No image URL returned from generation');
    }

    // Re-upload to R2 for consistent storage and long-term access
    const uploadResult = await storageService.uploadFromUrl(generatedImageUrl, {
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
