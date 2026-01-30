
'use server';
/**
 * @fileOverview An AI agent for generating tags for artwork.
 *
 * - generateTags - A function that suggests tags based on an image and title.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const GenerateTagsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the artwork, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  title: z.string().describe('The title of the artwork.'),
});

export async function generateTags(input: z.infer<typeof GenerateTagsInputSchema>): Promise<{ tags: string[] }> {
  return generateTagsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateTagsPrompt',
    input: { schema: GenerateTagsInputSchema },
    output: { schema: z.object({ tags: z.array(z.string()).describe("An array of 3-5 relevant, single-word or two-word, lowercase tags for the artwork. For example: 'abstract', 'oil painting', 'nature'.") }) },
    prompt: `You are an art expert who is great at categorizing and tagging artwork. Based on the provided image and title, generate a list of 3-5 relevant tags. The tags should be lowercase and consist of one or two words.

Title: {{{title}}}
Artwork: {{media url=photoDataUri}}`,
    config: {
        temperature: 0.2
    }
});


const generateTagsFlow = ai.defineFlow(
  {
    name: 'generateTagsFlow',
    inputSchema: GenerateTagsInputSchema,
    outputSchema: z.object({ tags: z.array(z.string()) }),
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { tags: [] };
    }
    return { tags: output.tags };
  }
);
