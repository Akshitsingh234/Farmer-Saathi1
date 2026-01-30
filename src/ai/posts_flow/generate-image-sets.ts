'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Updated Input Schema
const GenerateImageSetsInputSchema = z.object({
  userImage: z
    .string()
    .describe(
      "A product image uploaded by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  theme: z.string().describe('The design theme (e.g., Modern, Traditional).'),
  optionalPrompt: z
    .string()
    .optional()
    .describe('Optional prompt for more details about the item.'),
  brandName: z.string().optional().describe('Optional brand name to include in the images.'),
});
export type GenerateImageSetsInput = z.infer<typeof GenerateImageSetsInputSchema>;

// Updated Output Schema
const GenerateImageSetsOutputSchema = z.object({
  images: z.array(z.string()).describe('An array of URLs for the 3 generated images.').length(3),
});
export type GenerateImageSetsOutput = z.infer<
  typeof GenerateImageSetsOutputSchema
>;

export async function generateImageSets(
  input: GenerateImageSetsInput
): Promise<GenerateImageSetsOutput> {
  return generateImageSetsFlow(input);
}

// ## NEW: Prompt is now focused on IMAGE EDITING ##
const generateImagePrompts = ai.definePrompt({
  name: 'generateImagePrompts',
  input: { schema: GenerateImageSetsInputSchema },
  output: {
    schema: z.object({
      prompts: z.array(z.string()).length(3),
    }),
  },
  prompt: `You are an expert creative director who specializes in using AI image editing tools. Your task is to generate 3 distinct prompts for an image **editing** model. The goal is to take an existing product image and create variations for a social media campaign, while **preserving the original product**.

Your response MUST be a JSON object with a single key: "prompts", containing an array of 3 detailed string prompts for an image editing model.

**IMPORTANT RULES:**
1.  **Preserve the Product:** Every prompt must instruct the model to use the product from the original image. Do not change the product itself.
2.  **Theme:** The edits (backgrounds, style) must match the provided theme.
3.  **Variety:** Create three distinct images.

**Product Image:** \`{{media url=userImage}}\`
**Theme:** \`{{theme}}\`

{{#if optionalPrompt}}
**Artisan's Note:** \`{{optionalPrompt}}\`
{{/if}}

{{#if brandName}}
**Brand Name:** \`{{brandName}}\`
{{/if}}

**Here is the structure for your prompts:**

*   **Prompt 1 (Enhanced Product Shot):** Create a prompt that enhances the original product image. It should instruct the model to improve lighting and clarity, and place the product on a new, clean, and thematically appropriate background. If a brand name is provided, instruct the model to subtly incorporate it.
*   **Prompt 2 (Lifestyle Scene):** Create a prompt that places the original product into a lifestyle context that fits the theme. The product must remain the central focus.
*   **Prompt 3 (Creative/Graphic):** Create a prompt for a more creative graphic. This could involve a text overlay, a minimalist composition, or placing the product in a more abstract, artistic background that fits the theme. For text, you can use a phrase like "Light up your traditions" if appropriate.

Provide ONLY the JSON object in your response.`,
});

// ## NEW: This function now uses an EDITING model and passes the original image ##
async function generateImagesFromPrompts(
  prompts: string[],
  userImage: string
): Promise<string[]> {
  const imagePromises = prompts.map(async (prompt) => {
    try {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001', // Using an editing model
        prompt: [
          { text: prompt },
          { media: { url: userImage } }
        ],
        config: {
          aspectRatio: '1:1',
        },
      });

      if (media) {
        return media.url;
      } else {
        throw new Error('No media returned from AI.');
      }
    } catch (error) {
      console.error(`Failed to generate image for prompt: "${prompt}", error`);
      return 'https://via.placeholder.com/1080.png?text=Error';
    }
  });

  return Promise.all(imagePromises);
}

// Updated flow to handle a single theme
const generateImageSetsFlow = ai.defineFlow(
  {
    name: 'generateImageSetsFlow',
    inputSchema: GenerateImageSetsInputSchema,
    outputSchema: GenerateImageSetsOutputSchema,
  },
  async (input) => {
    const { output: promptOutput } = await generateImagePrompts(input);
    if (!promptOutput) {
      throw new Error('Failed to generate image prompts.');
    }

    // Pass the userImage to the image generation function
    const images = await generateImagesFromPrompts(
      promptOutput.prompts,
      input.userImage
    );

    return { images };
  }
);