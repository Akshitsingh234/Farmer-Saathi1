'use server';

/**
 * @fileOverview Generates creative challenge prompts using AI.
 *
 * - generateChallenge - A function that generates a creative challenge prompt.
 * - ChallengeInput - The input type for the generateChallenge function.
 * - ChallengeOutput - The return type for the generateChallenge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChallengeInputSchema = z.object({
  topic: z.string().describe('The topic or theme for the creative challenge.'),
  style: z.string().optional().describe('The artistic style to inspire the challenge.'),
  materials: z.string().optional().describe('Available materials for the challenge.'),
});
export type ChallengeInput = z.infer<typeof ChallengeInputSchema>;

const ChallengeOutputSchema = z.object({
  title: z.string().describe('A short, catchy title for the challenge (3-5 words).'),
  description: z.string().describe('The generated creative challenge prompt/description.'),
});
export type ChallengeOutput = z.infer<typeof ChallengeOutputSchema>;

export async function generateChallenge(input: ChallengeInput): Promise<ChallengeOutput> {
  return generateChallengeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'creativeChallengePrompt',
  input: {schema: ChallengeInputSchema},
  output: {schema: ChallengeOutputSchema},
  prompt: `You are a creative challenge generator for an artisan community. Your goal is to generate an inspiring and engaging challenge based on the given topic, style, and materials.

  Generate a short, catchy title (3-5 words) and a full challenge description.

  Topic: {{{topic}}}
  {{#if style}}Style: {{{style}}}{{/if}}
  {{#if materials}}Materials: {{{materials}}}{{/if}}

  The description should be clear, concise, and motivate artisans to participate. It should encourage creativity and allow for diverse interpretations.
  `,
});

const generateChallengeFlow = ai.defineFlow(
  {
    name: 'generateChallengeFlow',
    inputSchema: ChallengeInputSchema,
    outputSchema: ChallengeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
