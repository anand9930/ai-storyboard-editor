import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function generateText(prompt: string): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function analyzeImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<{
  subject: string;
  style: string;
  colors: string;
  suggestedPrompt: string;
  poseDescription?: string;
}> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
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
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Fall through to default return
    }
  }

  return {
    subject: text,
    style: '',
    colors: '',
    suggestedPrompt: text,
    poseDescription: '',
  };
}
