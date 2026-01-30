'use server';

/**
 * @fileOverview Finds relevant places for artisans to sell products or buy materials using an AI model.
 *
 * - findPlaces - A function that returns a list of relevant places (localized).
 * - FindPlacesInput - The input type for the findPlaces function.
 * - FindPlacesOutput - The return type for the findPlaces function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Place } from '@/lib/types';

const FindPlacesInputSchema = z.object({
  query: z.string().describe('The product to sell or material to buy.'),
  city: z.string().describe('The city to search for places in.'),
  mode: z.enum(['sell', 'buy']).describe('Whether the user wants to sell a product or buy a material.'),
  // Optional multilingual fields:
  language: z.string().optional().describe('ISO language code to request output in, e.g. en, hi, kn.'),
  languageLabel: z.string().optional().describe('Human readable language label, e.g. English, Hindi, Kannada.'),
  logoUrl: z.string().optional().describe('Optional URL/path to a brand logo for context.'),
});
export type FindPlacesInput = z.infer<typeof FindPlacesInputSchema>;

const FindPlacesOutputSchema = z.object({
  places: z.array(
    z.object({
      name: z.string().describe("The name of the shop or business."),
      address: z.string().describe("The full address of the shop."),
      lat: z.number().optional().describe("Optional latitude if available."),
      lon: z.number().optional().describe("Optional longitude if available."),
    })
  ).describe('A list of up to 10 relevant places.'),
});
export type FindPlacesOutput = z.infer<typeof FindPlacesOutputSchema>;

export async function findPlaces(input: FindPlacesInput): Promise<FindPlacesOutput> {
  return findPlacesFlow(input);
}

// Default logo path from this conversation (developer instruction).
// NOTE: This path is only valid inside this environment. For production, put the logo in /public and change DEFAULT_LOGO_PATH accordingly.
const DEFAULT_LOGO_PATH = '/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png';

const prompt = ai.definePrompt({
  name: 'findPlacesPrompt',
  input: { schema: FindPlacesInputSchema },
  output: { schema: FindPlacesOutputSchema },
  prompt: `You are an expert assistant and local market researcher for artisans. Your goal is to find highly relevant, real-world physical stores for them in a specific city.

The user is in '{{mode}}' mode and is in the city of '{{city}}'.
The item they are interested in is '{{query}}'.

IMPORTANT: Always produce the reply in the requested language: {{languageLabel}} ({{language}}).
Preserve placeholders (such as {productName}, {city}, {artisanName}, {last4Digits}, {year}) exactly as-is.
If a logo or brand context is provided, its URL is: {{logoUrl}}.

1.  **Analyze the Request**:
    -   If the mode is 'sell', identify the types of stores that would be the best fit to sell \"{{query}}\". Think about independent boutiques, specialty stores, gift shops, or art galleries. Avoid large chain stores unless they have a known local artisan section.
    -   If the mode is 'buy', identify the types of stores where an artisan would source \"{{query}}\". Think about art supply stores, craft stores, specialty material suppliers, or wholesalers.

2.  **Find Real Shops**: Based on your analysis, search your knowledge for up to 10 real, existing shops in {{city}} that match these types. For each shop, provide its name and full street address. Do not invent shops.

IMPORTANT: If you cannot reliably confirm the existence of a shop, omit it. Provide only real, verifiable places.

Return the results as a JSON object matching the schema: { "places": [ { "name": "...", "address": "...", "lat": <optional>, "lon": <optional> }, ... ] }.
`,
});

const findPlacesFlow = ai.defineFlow(
  {
    name: 'findPlacesFlow',
    inputSchema: FindPlacesInputSchema,
    outputSchema: FindPlacesOutputSchema,
  },
  async (input) => {
    // Ensure language defaults
    const language = (input as any).language || 'en';
    const languageLabelMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      kn: 'Kannada',
    };
    const languageLabel = (input as any).languageLabel || languageLabelMap[language] || language;

    const logoUrl = (input as any).logoUrl || DEFAULT_LOGO_PATH;

    // Call the prompt with multilingual instructions and logo context
    const { output } = await prompt({
      ...input,
      language,
      languageLabel,
      logoUrl,
    });

    if (!output || !output.places) {
      return { places: [] };
    }

    // Deduplicate by address (keep first occurrence). Provide lat/lon default placeholders if required by types.
    const uniquePlaces = output.places.reduce((acc: Place[], current: any) => {
      if (!acc.find((item) => item.address === current.address)) {
        acc.push({
          name: current.name,
          address: current.address,
          lat: typeof current.lat === 'number' ? current.lat : undefined,
          lon: typeof current.lon === 'number' ? current.lon : undefined,
        } as Place);
      }
      return acc;
    }, [] as Place[]);

    return { places: uniquePlaces };
  }
);
