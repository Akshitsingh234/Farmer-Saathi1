'use server';

/**
 * @fileOverview Summarizes the total quantities of each type of item across all to-do items.
 *
 * - summarizeTaskQuantities - A function that summarizes task quantities.
 * - SummarizeTaskQuantitiesInput - The input type for the summarizeTaskQuantities function.
 * - SummarizeTaskQuantitiesOutput - The return type for the summarizeTaskQuantities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTaskQuantitiesInputSchema = z.array(
  z.object({
    taskDescription: z.string().describe('The description of the task, including the item type.'),
    quantity: z.number().describe('The quantity of the item needed for the task.'),
  })
).describe('An array of to-do items, each with a task description and quantity.');

export type SummarizeTaskQuantitiesInput = z.infer<typeof SummarizeTaskQuantitiesInputSchema>;

const SummarizeTaskQuantitiesOutputSchema = z.string().describe('A summary of the total quantities for each item type.');

export type SummarizeTaskQuantitiesOutput = z.infer<typeof SummarizeTaskQuantitiesOutputSchema>;

export async function summarizeTaskQuantities(input: SummarizeTaskQuantitiesInput): Promise<SummarizeTaskQuantitiesOutput> {
  return summarizeTaskQuantitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTaskQuantitiesPrompt',
  input: {schema: SummarizeTaskQuantitiesInputSchema},
  output: {schema: SummarizeTaskQuantitiesOutputSchema},
  config: {
    model: 'gemini-2.5-flash',
  },
  prompt: `You are an assistant to an artisan. Your job is to summarize the total quantities of each item type required based on the provided to-do items.\n\nTo-Do Items:\n{{#each this}}\n- {{taskDescription}} (Quantity: {{quantity}})\n{{/each}}\n\nProvide a concise summary of the total quantities for each item type.  For example, if there were two todo items, one for "make 3 chairs" and one for "make 4 chairs", the summary would be "Total chairs needed: 7".  If there were also a todo item for "make 5 tables", the summary would be "Total chairs needed: 7, Total tables needed: 5".`,
});

const summarizeTaskQuantitiesFlow = ai.defineFlow(
  {
    name: 'summarizeTaskQuantitiesFlow',
    inputSchema: SummarizeTaskQuantitiesInputSchema,
    outputSchema: SummarizeTaskQuantitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
