'use server';

import { ai } from "@/ai/genkit";
import { googleAI } from "@genkit-ai/googleai";
import { z } from "genkit";

// ---------- SCHEMA ----------
const VariationInputSchema = z.object({
  userImage: z.string(),
  color: z.string(),
  style: z.enum(["traditional", "modern", "simplistic"]),
});
export type VariationInput = z.infer<typeof VariationInputSchema>;

const VariationOutputSchema = z.object({
  images: z.array(z.string()).length(2),
});
export type VariationOutput = z.infer<typeof VariationOutputSchema>;

// ---------- PROMPT GENERATOR ----------
const promptGenerator = ai.definePrompt({
  name: "variationPromptGenerator",
  input: { schema: VariationInputSchema },
  output: {
    schema: z.object({
      prompts: z.array(z.string()).length(2),
    }),
  },
  prompt: `
You are an expert image-editing AI.  
Generate **exactly 2 high-quality editing prompts** for modifying the user's original product image.

IMPORTANT RULES:
- Preserve the exact product shape, structure, and proportions.
- Apply the recolor: "{{color}}".
- Use the visual style: "{{style}}".
- Enhance lighting, clarity, and realism.
- Never distort or replace the product.
- Do NOT add elements that cover or modify the product.

GENERATE THESE 2 VARIATIONS ONLY:

1. **Recolor + Professional Enhancement**  
   - Clean studio background  
   - High-end lighting + gentle shadows  
   - Texture-preserving recolor  
   - Style applied subtly  
   - Product stays isolated and hero-focused  

2. **Recolor + Themed Background**  
   - Replace the background with one matching "{{style}}"  
     (traditional → warm, heritage tones;  
      modern → sleek minimal contrast;  
      simplistic → soft clean gradients)  
   - Maintain realism  
   - Keep background simple and non-distracting  
   - Product remains untouched besides recolor  

USER IMAGE:
\`{{media url=userImage}}\`

RETURN ONLY THIS JSON:
{
  "prompts": ["p1", "p2"]
}
`,
});



// ---------- IMAGE GENERATOR USING GENKIT 1.14 ----------
async function generateSingleImage(prompt: string, userImage: string): Promise<string> {
  try {
    const { media } = await ai.generate({
      model: "googleai/imagen-4.0-fast-generate-001",
      prompt: [
        { text: prompt },
        { media: { url: userImage } }
      ],
      config: {
        aspectRatio: "1:1",
      },
    });

    if (media) {
      return media.url;
    } else {
      throw new Error("No media returned from AI.");
    }
  } catch (error) {
    console.error("Variation image error:", error);
    return "https://via.placeholder.com/1080.png?text=Error";
  }
}



// ---------- FLOW ----------
const generateVariationFlow = ai.defineFlow(
  {
    name: "generateVariationFlow",
    inputSchema: VariationInputSchema,
    outputSchema: VariationOutputSchema,
  },
  async (input) => {
    const { output } = await promptGenerator(input);

    if (!output?.prompts) throw new Error("Failed to generate prompts");

    const images = [];
    for (const p of output.prompts) {
      const img = await generateSingleImage(p, input.userImage);
      images.push(img);
    }

    return { images };
  }
);

// ---------- EXPORT ----------
export async function generateImageVariation(input: VariationInput) {
  return generateVariationFlow(input);
}
