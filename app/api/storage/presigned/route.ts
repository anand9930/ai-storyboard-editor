import { NextRequest, NextResponse } from 'next/server';
import { storageService, StorageError, StorageConfigError } from '@/lib/storage';
import { z } from 'zod';

// Request validation schema
const presignedRequestSchema = z.object({
  folder: z.string().optional(),
  contentType: z.string().optional(),
  expiresIn: z.number().min(60).max(86400).optional(), // 1 min to 24 hours
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const parseResult = presignedRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { folder, contentType, expiresIn } = parseResult.data;

    // Generate presigned URL
    const result = await storageService.generatePresignedUploadUrl({
      folder,
      contentType,
      expiresIn,
    });

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
      key: result.key,
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Failed to generate presigned URL:', error);

    if (error instanceof StorageConfigError) {
      return NextResponse.json(
        { error: 'R2 storage not configured', details: error.message },
        { status: 503 }
      );
    }

    if (error instanceof StorageError) {
      return NextResponse.json(
        { error: 'Storage error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
