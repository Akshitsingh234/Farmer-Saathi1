'use server';

/**
 * @fileOverview Provides growth tips for local artisans.
 *
 * - getGrowthTips - A function that returns a list of growth tips.
 * - GetGrowthTipsOutput - The return type for the getGrowthTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetGrowthTipsOutputSchema = z.object({
  tips: z.array(
    z.object({
        title: z.string().describe("The title of the growth tip."),
        description: z.string().describe("The detailed description of the tip."),
    })
  ).describe('A list of actionable growth tips for artisans.'),
});
export type GetGrowthTipsOutput = z.infer<typeof GetGrowthTipsOutputSchema>;

export async function getGrowthTips(): Promise<GetGrowthTipsOutput> {
  return getGrowthTipsFlow();
}

const prompt = ai.definePrompt({
  name: 'getGrowthTipsPrompt',
  output: {schema: GetGrowthTipsOutputSchema},
  prompt: `You are an expert business consultant for local artisans.

Generate a list of 5 concise, actionable growth tips for an artisan looking to expand their business.
The tips should cover topics like marketing, sales, online presence, and customer engagement.
For each tip, provide a short, catchy title and a one-sentence description.
`,
});

const getGrowthTipsFlow = ai.defineFlow(
  {
    name: 'getGrowthTipsFlow',
    outputSchema: GetGrowthTipsOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
