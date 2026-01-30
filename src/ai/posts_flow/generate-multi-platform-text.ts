'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating multi-platform text content (Instagram, Facebook, WhatsApp)
 * tailored for promoting artisan products.  It includes schemas for input and output, and an
 * exported function to trigger the flow.
 *
 * - generateMultiPlatformText - A function that triggers the flow to generate text content.
 * - GenerateMultiPlatformTextInput - The input type for the generateMultiPlatformText function.
 * - GenerateMultiPlatformTextOutput - The return type for the generateMultiPlatformText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMultiPlatformTextInputSchema = z.object({
  productDescription: z
    .string()
    .describe("A description of the artisan's product, including unique aspects."),
  languagePreference: z
    .string()
    .describe(
      'The preferred language for the generated text content (e.g., English, Hindi).'
    ),
});
export type GenerateMultiPlatformTextInput = z.infer<
  typeof GenerateMultiPlatformTextInputSchema
>;

const GenerateMultiPlatformTextOutputSchema = z.object({
  instagram: z.object({
    caption: z
      .string()
      .describe('A short, engaging caption with relevant emojis.'),
    hashtags: z.array(z.string()).describe('An array of relevant hashtags.'),
  }),
  facebook: z
    .object({
      post: z
        .string()
        .describe(
          'A longer, more detailed post describing the product and its background.'
        ),
    })
    .optional(),
  whatsapp: z
    .object({
      message: z
        .string()
        .describe(
          'A brief, friendly message for sharing with customers, including a call to action.'
        ),
    })
    .optional(),
});
export type GenerateMultiPlatformTextOutput = z.infer<
  typeof GenerateMultiPlatformTextOutputSchema
>;

export async function generateMultiPlatformText(
  input: GenerateMultiPlatformTextInput
): Promise<GenerateMultiPlatformTextOutput> {
  return generateMultiPlatformTextFlow(input);
}

const generateMultiPlatformTextPrompt = ai.definePrompt({
  name: 'generateMultiPlatformTextPrompt',
  input: {schema: GenerateMultiPlatformTextInputSchema},
  output: {schema: GenerateMultiPlatformTextOutputSchema},
  prompt: `You are an expert social media manager for Indian artisans. Your tone is warm, authentic, and tailored to each platform. You will respond ONLY with a JSON object.

Analyze this product description: '{{{productDescription}}}'. The target language is {{{languagePreference}}}. Generate the social media text content in the following JSON format:

JSON
{
  "instagram": {
    "caption": "A short, engaging caption with relevant emojis that tells a story about the product's craft.",
    "hashtags": ["#handmade", "#madeinindia", "#artisanmade", "#vocalforlocal", "#[product_specific_tag]"]
  },
  "facebook": {
    "post": "A slightly longer, more detailed post (2-3 paragraphs) describing the product, its materials, the inspiration behind it, and how to purchase."
  },
  "whatsapp": {
    "message": "A brief, friendly, and personal message perfect for sharing with customers. Start with a greeting, introduce the new item, and end with a call to action like 'Reply to this message to order!'."
  }
}
`,
});

const generateMultiPlatformTextFlow = ai.defineFlow(
  {
    name: 'generateMultiPlatformTextFlow',
    inputSchema: GenerateMultiPlatformTextInputSchema,
    outputSchema: GenerateMultiPlatformTextOutputSchema,
  },
  async input => {
    const {output} = await generateMultiPlatformTextPrompt(input);
    return output!;
  }
);
