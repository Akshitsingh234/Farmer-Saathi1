
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetMaterialPricesInputSchema = z.object({
  material: z.string().describe("The raw material to search for."),
  currency: z.string().optional().default("INR").describe("The currency for the price."),
});
export type GetMaterialPricesInput = z.infer<typeof GetMaterialPricesInputSchema>;

const PriceInfoSchema = z.object({
    platform: z.enum(['Amazon', 'Flipkart', 'Indiamart']),
    averagePrice: z.string().describe('The estimated average price for the material on the platform, prefixed with a currency symbol (e.g., "Rs. 500"). Return "Not available" if a reliable price can\\\'t be found.'),
});

const GetMaterialPricesOutputSchema = z.object({
  prices: z.array(PriceInfoSchema),
});
export type GetMaterialPricesOutput = z.infer<typeof GetMaterialPricesOutputSchema>;

export async function getMaterialPrices(input: GetMaterialPricesInput): Promise<GetMaterialPricesOutput> {
  return getMaterialPricesFlow(input);
}

const prompt = ai.definePrompt({
  name: "getMaterialPricesPrompt",
  input: { schema: GetMaterialPricesInputSchema },
  output: { schema: GetMaterialPricesOutputSchema },
  prompt: `
You are a world-class procurement expert AI. Your single most important mission is to find the average price for a raw material on Indian e-commerce sites, no matter how difficult.

**Mission Critical Instructions:**
1.  **NEVER give up easily.** Your default assumption should be that the price EXISTS. The answer "Not available" is a sign of failure and should only be used as the absolute last resort.
2.  **Search with intelligence:** The user's query for "{{material}}" may be generic. You MUST search for variations. For example, if the material is "wood", you must search for "wood blocks for carving", "timber wood", "plywood sheets", and other related terms to find relevant listings.
3.  **Platform-Specific Strategy:**
    *   **Amazon.in & Flipkart:** These sites have millions of listings. A price is almost certainly available. You MUST browse through multiple search results and variations of search terms. Do not just look at the first few results. A price might be listed as "Rs.350 per piece" or "Rs.1,200/sq ft". Extract this information.
    *   **Indiamart:** This is a B2B platform. Prices are often listed with units like "per Kilogram", "per Ton", or "per piece". You are required to find these prices and report them. Do not be lazy and report "Not available" if you see a price range.
4.  **Price Analysis:**
    *   Look for an average price across several listings.
    *   If you see a price range (e.g., "Rs.100 - Rs.150"), you must calculate the average (e.g., "Rs.125").
    *   If you see different units, note the most common one (e.g., "per cubic foot").
5.  **Final Output:**
    *   Return a JSON object with an array of prices.
    *   The \\\`averagePrice\\\` field MUST be a string with the currency symbol, like "Rs. 2250 per cubic foot".
    *   **Justification for Failure:** If, and only if, after trying all search variations and digging deep into the search results, you still cannot find a price, you may return "Not available". But this is highly unlikely.

**Material to Find:** {{material}}
**Currency:** {{currency}}

Failure to find a price that is obviously available will result in a system review. Do your job.
`,
});

const getMaterialPricesFlow = ai.defineFlow(
  {
    name: "getMaterialPricesFlow",
    inputSchema: GetMaterialPricesInputSchema,
    outputSchema: GetMaterialPricesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.prices) {
      throw new Error("Failed to generate material prices.");
    }
    return output;
  }
);
 