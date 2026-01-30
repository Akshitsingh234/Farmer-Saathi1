'use server';
/**
 * @fileOverview Generates an image for a creative challenge using AI.
 *
 * - generateChallengeImage - Generates an image based on challenge content.
 * - ChallengeImageInput - The input type for the generateChallengeImage function.
 * - ChallengeImageOutput - The return type for the generateChallengeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChallengeImageInputSchema = z.object({
  title: z.string().describe('The title of the creative challenge.'),
  description: z
    .string()
    .describe('The full text description of the creative challenge.'),
});
export type ChallengeImageInput = z.infer<typeof ChallengeImageInputSchema>;

const ChallengeImageOutputSchema = z.object({
  imageUrl: z.string().describe("URL of the generated image. This will be a data URI with Base64 encoding: 'data:image/jpeg;base64,<encoded_data>'."),
  imageHint: z.string().describe('A two-word hint describing the image, for AI assistance and alt text.'),
});
export type ChallengeImageOutput = z.infer<typeof ChallengeImageOutputSchema>;


const prompt = ai.definePrompt({
  name: 'challengeImagePrompt',
  input: {schema: ChallengeImageInputSchema},
  output: {schema: z.object({
    prompt: z.string().describe("A concise, descriptive prompt for an image generator that visualizes the challenge. Focus on abstract concepts, mood, and artistic style. Example: 'An explosion of colors on a dark background, representing creative chaos.'"),
    hint: z.string().describe('A two-word hint describing the image, for AI assistance and alt text. Example: "abstract colors"'),
  })},
  prompt: `Based on the following creative challenge title and description, create a visually descriptive, one-sentence prompt for an image generator. The image should be artistic and conceptual. Also, create a two-word hint for the image.

Title: {{{title}}}
Description:
{{{description}}}
`,
});

const generateChallengeImageFlow = ai.defineFlow(
  {
    name: 'generateChallengeImageFlow',
    inputSchema: ChallengeImageInputSchema,
    outputSchema: ChallengeImageOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    
    if (!output) {
      throw new Error('Failed to generate image prompt');
    }

    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: output.prompt,
    });
    
    if (!media) {
      throw new Error('Failed to generate image');
    }
    
    // Compression is now handled client-side for user uploads.
    // AI-generated images are already web-optimized.
    return {
      imageUrl: media.url,
      imageHint: output.hint,
    };
  }
);


export async function generateChallengeImage(input: ChallengeImageInput): Promise<ChallengeImageOutput> {
    return generateChallengeImageFlow(input);
}
