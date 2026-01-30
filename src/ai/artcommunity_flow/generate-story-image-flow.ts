'use server';
/**
 * @fileOverview Generates an image for a story using AI.
 *
 * - generateStoryImage - Generates an image based on story content.
 * - StoryImageInput - The input type for the generateStoryImage function.
 * - StoryImageOutput - The return type for the generateStoryImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StoryImageInputSchema = z.object({
  storyContent: z
    .string()
    .describe('The full text content of the artisan story.'),
});
export type StoryImageInput = z.infer<typeof StoryImageInputSchema>;

const StoryImageOutputSchema = z.object({
  imageUrl: z.string().describe("URL of the generated image. This will be a data URI with Base64 encoding: 'data:image/png;base64,<encoded_data>'."),
  imageHint: z.string().describe('A two-word hint describing the image, for AI assistance and alt text.'),
});
export type StoryImageOutput = z.infer<typeof StoryImageOutputSchema>;


const prompt = ai.definePrompt({
  name: 'storyImagePrompt',
  input: {schema: StoryImageInputSchema},
  output: {schema: z.object({
    prompt: z.string().describe("A concise, descriptive prompt for an image generator, capturing the essence of the story in a single sentence. Focus on visual elements and artistic style. Example: 'A potter's hands covered in clay, shaping a vase on a spinning wheel in a sunlit studio.'"),
    hint: z.string().describe('A two-word hint describing the image, for AI assistance and alt text. Example: "pottery hands"'),
  })},
  prompt: `Based on the following artisan story, create a descriptive, one-sentence prompt for an image generator. Also, create a two-word hint for the image.

Story:
{{{storyContent}}}
`,
});

const generateStoryImageFlow = ai.defineFlow(
  {
    name: 'generateStoryImageFlow',
    inputSchema: StoryImageInputSchema,
    outputSchema: StoryImageOutputSchema,
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

    return {
      imageUrl: media.url,
      imageHint: output.hint,
    };
  }
);


export async function generateStoryImage(input: StoryImageInput): Promise<StoryImageOutput> {
    return generateStoryImageFlow(input);
}
