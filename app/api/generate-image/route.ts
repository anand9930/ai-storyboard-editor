import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { storageService } from '@/lib/storage';
import { generateImage } from '@/lib/runwareService';
import { aspectRatioToDimensions } from '@/lib/aspectRatioUtils';
import { DEFAULT_IMAGE_MODEL } from '@/lib/imageModels';
import { extractRunwareErrorMessage } from '@/lib/errors/runwareErrors';

// Zod schema for request validation
const generateImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().default(DEFAULT_IMAGE_MODEL.id),
  sourceImages: z.array(z.string()).optional().default([]), // Array of R2 URLs for image-to-image
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

    const { prompt, model, sourceImages, aspectRatio } = parseResult.data;

    // Verify Runware API key is configured
    if (!process.env.RUNWARE_API_KEY) {
      return NextResponse.json(
        { error: 'RUNWARE_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Convert aspect ratio to width/height dimensions
    const { width, height } = aspectRatioToDimensions(aspectRatio ?? null);

    // Generate presigned URL for direct Runware upload to R2
    const presignedData = await storageService.generatePresignedUploadUrl({
      folder: 'generated',
      contentType: 'image/png',
    });

    // Generate image using Runware SDK with direct upload to R2
    await generateImage({
      prompt,
      model,
      seedImages: sourceImages, // Array of R2 URLs passed directly - Runware supports URLs
      width,
      height,
      uploadEndpoint: presignedData.uploadUrl,
    });

    return NextResponse.json({
      imageUrl: presignedData.publicUrl,
      key: presignedData.key,
    });
  } catch (error) {
    console.error('Image generation failed:', error);
    const message = extractRunwareErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
