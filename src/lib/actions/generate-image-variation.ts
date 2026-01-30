'use server';

import { generateImageVariation } from '@/ai/assist_flow/generate-image-variation-flow';

export async function generateImageVariationAction(
  userImage: string,
  color: string,
  style: "traditional" | "modern" | "simplistic"
) {
  try {
    return await generateImageVariation({ userImage, color, style });
  } catch (err: any) {
    console.error("Variation generation failed:", err);
    return { error: err.message ?? "Failed to generate variations." };
  }
}
