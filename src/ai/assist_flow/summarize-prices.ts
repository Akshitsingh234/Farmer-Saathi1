'use server';

/**
 * @fileOverview Summarizes prices from different suppliers for a given list of materials.
 *
 * - summarizePrices - A function that summarizes prices from different suppliers.
 * - SummarizePricesInput - The input type for the summarizePrices function.
 * - SummarizePricesOutput - The return type for the summarizePrices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePricesInputSchema = z.object({
  materials: z
    .array(
      z.object({
        name: z.string().describe('The name of the material.'),
        quantity: z.number().describe('The quantity of the material needed.'),
        unit: z.string().describe('The unit of measurement for the material.'),
      })
    )
    .describe('The list of materials to summarize prices for.'),
  suppliers: z
    .array(z.string().describe('The name of the supplier.'))
    .describe('The list of suppliers to fetch prices from.'),
});

export type SummarizePricesInput = z.infer<typeof SummarizePricesInputSchema>;

const SummarizePricesOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of the prices from different suppliers for the given materials.'),
});

export type SummarizePricesOutput = z.infer<typeof SummarizePricesOutputSchema>;

export async function summarizePrices(input: SummarizePricesInput): Promise<SummarizePricesOutput> {
  return summarizePricesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePricesPrompt',
  input: {schema: SummarizePricesInputSchema},
  output: {schema: SummarizePricesOutputSchema},
  prompt: `You are an expert in sourcing materials for artisans.

You will receive a list of materials and a list of suppliers.
Your goal is to summarize the prices from different suppliers for the given materials, taking into account quantity and units, to help the artisan make fast sourcing decisions.

Materials:
{{#each materials}}
- {{quantity}} {{unit}} of {{name}}
{{/each}}

Suppliers: {{suppliers}}

Summary:`, // Changed from triple curly braces to double to avoid HTML escaping
});

const summarizePricesFlow = ai.defineFlow(
  {
    name: 'summarizePricesFlow',
    inputSchema: SummarizePricesInputSchema,
    outputSchema: SummarizePricesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
