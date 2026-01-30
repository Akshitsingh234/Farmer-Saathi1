'use server';

/**
 * @fileOverview Suggests a selling price for a given product in a specified currency.
 *
 * - getPriceSuggestion - A function that returns a suggested price range.
 * - GetPriceSuggestionInput - The input type for the getPriceSuggestion function.
 * - GetPriceSuggestionOutput - The return type for the getPriceSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPriceSuggestionInputSchema = z.object({
  product: z.string().describe('The artisanal product to be priced (e.g., "handmade ceramic mug").'),
  currency: z.string().describe('The three-letter currency code (e.g., "USD", "INR", "EUR").'),
  // Optional multilingual + branding fields:
  language: z.string().optional().describe('ISO language code to request output in, e.g. en, hi, kn.'),
  languageLabel: z.string().optional().describe('Human readable language label, e.g. English, Hindi, Kannada.'),
  logoUrl: z.string().optional().describe('Optional URL/path to a brand logo for context.'),
});
export type GetPriceSuggestionInput = z.infer<typeof GetPriceSuggestionInputSchema>;

const GetPriceSuggestionOutputSchema = z.object({
  priceRange: z.string().describe('The suggested selling price range for the product in the specified currency (e.g., "15 - 25", "1200 - 1800").'),
  justification: z.string().describe('A brief justification for the suggested price range based on market research.'),
});
export type GetPriceSuggestionOutput = z.infer<typeof GetPriceSuggestionOutputSchema>;

export async function getPriceSuggestion(input: GetPriceSuggestionInput): Promise<GetPriceSuggestionOutput> {
  return getPriceSuggestionFlow(input);
}

// DEV default logo path (from this chat environment).
// NOTE: this path is only available in the chat/dev environment used here.
// For production, place your logo in /public and set DEFAULT_LOGO_PATH = '/artisan-logo.png'
const DEFAULT_LOGO_PATH = '/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png';

const prompt = ai.definePrompt({
  name: 'getPriceSuggestionPrompt',
  input: { schema: GetPriceSuggestionInputSchema },
  output: { schema: GetPriceSuggestionOutputSchema },
  prompt: `You are a pricing expert for artisanal and handmade goods.
{{#if languageLabel}}
IMPORTANT: Always produce the reply in the requested language: {{languageLabel}} ({{language}}).
{{/if}}
Preserve placeholders (such as {productName}, {city}, {artisanName}, {last4Digits}, {year}) exactly as-is.
If a logo or brand context is provided, its URL is: {{logoUrl}}.

Product: {{{product}}}
Currency: {{{currency}}}

Task:
1) Based on your knowledge of similar artisanal products and local market conditions, suggest a realistic selling price range for the product in the specified currency.
   - Provide the price range as plain numbers in the format "MIN - MAX" (for example: "15 - 25" or "1200 - 1800"). Do NOT include currency symbols in the numbers — the currency is described above.
2) Provide a one-sentence justification for the suggested price range that considers materials, craftsmanship, time, and market demand.

Constraints:
- Keep the justification concise (one sentence).
- If you are instructed to produce the response in a particular language, ensure the whole response (both priceRange and justification) is in that language.
- Do not invent specific marketplace listings or exact competitor prices — base your judgement on general market knowledge.
- Return exactly a JSON object that matches the output schema: { "priceRange": "...", "justification": "..." }.

Example valid output:
{
  "priceRange": "1200 - 1800",
  "justification": "High-quality handmade construction and local demand justify this range."
}
`
});

const getPriceSuggestionFlow = ai.defineFlow(
  {
    name: 'getPriceSuggestionFlow',
    inputSchema: GetPriceSuggestionInputSchema,
    outputSchema: GetPriceSuggestionOutputSchema,
  },
  async (input) => {
    // Ensure defaults and map language label if not provided
    const language = (input as any).language || 'en';
    const languageLabelMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      kn: 'Kannada',
    };
    const languageLabel = (input as any).languageLabel || languageLabelMap[language] || language;
    const logoUrl = (input as any).logoUrl || DEFAULT_LOGO_PATH;

    // Call the prompt with provided language + logo + currency
    const { output } = await prompt({
      ...input,
      language,
      languageLabel,
      logoUrl,
      // currency is already part of input and will be used in the prompt template
    });

    return output!;
  }
);
