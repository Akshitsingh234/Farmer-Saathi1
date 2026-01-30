'use server';

/**
 * app/actions/getAccountsSummary.ts
 *
 * GenKit flow that summarizes the accounting data for local artisans.
 *
 * Exports:
 * - getAccountsSummary(input)
 *
 * NOTE: requires your ai/genkit integration (same pattern as your getPriceSuggestion).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProductSchema = z.object({
  name: z.string(),
  revenue: z.number(),
  units: z.number(),
  orders: z.number(),
  profit: z.number(),
  growth: z.number().optional(),
});

const GetAccountsSummaryInputSchema = z.object({
  totalSales: z.number(),
  totalProfit: z.number(),
  totalOrders: z.number(),
  unitsSold: z.number(),
  avgOrderValue: z.number(),
  unitsPerOrder: z.number(),
  revenuePerUnit: z.number(),
  selectedMonth: z.string().optional(),
  productStats: z.array(ProductSchema).describe('Aggregated product stats'),
  language: z.string().optional(),
  languageLabel: z.string().optional(),
});
export type GetAccountsSummaryInput = z.infer<typeof GetAccountsSummaryInputSchema>;

const GetAccountsSummaryOutputSchema = z.object({
  summaryPoints: z.array(z.string()).describe('Easy bullet-point summary'),
  overallMessage: z.string().describe('Simple explanation for artisans'),
});
export type GetAccountsSummaryOutput = z.infer<typeof GetAccountsSummaryOutputSchema>;

export async function getAccountsSummary(
  input: GetAccountsSummaryInput
): Promise<GetAccountsSummaryOutput> {
  return getAccountsSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getAccountsSummaryPrompt',
  input: { schema: GetAccountsSummaryInputSchema },
  output: { schema: GetAccountsSummaryOutputSchema },
  prompt: `
You are an expert at explaining business accounts in very simple, artisan-friendly language.

{{#if languageLabel}}
IMPORTANT: Entire response must be written in {{languageLabel}} ({{language}}).
{{/if}}

The accounting details:

- Total Sales: {{totalSales}}
- Total Profit: {{totalProfit}}
- Total Orders: {{totalOrders}}
- Units Sold: {{unitsSold}}
- Average Order Value: {{avgOrderValue}}
- Units Per Order: {{unitsPerOrder}}
- Revenue Per Unit: {{revenuePerUnit}}
- Period: {{selectedMonth}}

Products:
{{#each productStats}}
- Name: {{name}}, Revenue: {{revenue}}, Units: {{units}}, Orders: {{orders}}, Profit: {{profit}}, Growth: {{growth}}
{{/each}}

Task:
1) Produce 6–10 very short bullet points (one sentence each) that a local artisan can easily understand.
   - Use plain words, avoid analytics jargon.
   - Include: top product(s), what to keep doing, one or two warnings (slow items, low profit), and a quick actionable tip.
2) Finish with a friendly 2-3 sentence paragraph giving simple guidance.
3) Output JSON matching the schema exactly:
{
  "summaryPoints": ["...","..."],
  "overallMessage": "..."
}

If language is specified, reply in that language.
`,
});

const getAccountsSummaryFlow = ai.defineFlow(
  {
    name: 'getAccountsSummaryFlow',
    inputSchema: GetAccountsSummaryInputSchema,
    outputSchema: GetAccountsSummaryOutputSchema,
  },
  async (input) => {
    const language = (input as any).language || 'en';
    const languageLabelMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      kn: 'Kannada',
    };
    const languageLabel =
      (input as any).languageLabel ||
      languageLabelMap[language] ||
      language;

    const { output } = await prompt({
      ...input,
      language,
      languageLabel,
    });

    return output!;
  }
);
