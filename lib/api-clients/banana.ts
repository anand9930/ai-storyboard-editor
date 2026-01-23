interface GenerateImageOptions {
  prompt: string;
  sourceImage?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
}

interface GenerateImageResult {
  imageUrl: string;
}

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  const {
    prompt,
    sourceImage,
    width = 512,
    height = 512,
    numOutputs = 1,
    guidanceScale = 7.5,
    numInferenceSteps = 50,
  } = options;

  const apiUrl = process.env.BANANA_PRO_API_URL;
  const apiKey = process.env.BANANA_PRO_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      'BANANA_PRO_API_URL and BANANA_PRO_API_KEY environment variables must be set'
    );
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image: sourceImage,
      width,
      height,
      num_outputs: numOutputs,
      guidance_scale: guidanceScale,
      num_inference_steps: numInferenceSteps,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Banana API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  // Handle different response formats
  const imageUrl =
    result.output?.[0] ||
    result.url ||
    result.data?.[0]?.url ||
    result.images?.[0]?.url ||
    result.image;

  if (!imageUrl) {
    throw new Error('No image URL in response');
  }

  return { imageUrl };
}
