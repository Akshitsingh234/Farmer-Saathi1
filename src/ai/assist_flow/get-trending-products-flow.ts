'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetTrendingProductsInputSchema = z.object({
  language: z.string().optional().describe("Language code: en, hi, kn."),
  languageLabel: z.string().optional().describe("Human name of the language."),
  logoUrl: z.string().optional(),
});

export type GetTrendingProductsInput = z.infer<typeof GetTrendingProductsInputSchema>;

const GetTrendingProductsOutputSchema = z.object({
  products: z.array(
    z.object({
      name: z.string().describe("The name of the trending product."),
      description: z.string().describe("A brief (1-sentence) explanation of why this product is trending."),
      googleSearchQuery: z.string().describe("A concise Google search query for inspiration."),
      suggestedPrice: z.string().describe('A suggested retail price for the product in Indian Rupees, prefixed with "Rs.", e.g., "Rs. 799"'),
      platform: z.string().describe('The e-commerce platform where this product is popular in India (e.g., Etsy, Amazon, Flipkart, Meesho).'),
      platformSearchQuery: z.string().describe('A concise search query to find similar products on the specified e-commerce platform.'),
      rating: z.number().min(1).max(5).describe('An estimated average rating for the product on the specified platform.'),
      reviewCount: z.number().describe('An estimated number of reviews for the product.'),
      insight: z.string().describe('A short, actionable insight or tip for the artisan related to this trend.'),
    })
  ).describe("A list of 5 currently trending handmade or artisan products."),
});
export type GetTrendingProductsOutput = z.infer<typeof GetTrendingProductsOutputSchema>;

export async function getTrendingProducts(input: GetTrendingProductsInput): Promise<GetTrendingProductsOutput> {
  return getTrendingProductsFlow(input);
}

const DEFAULT_LOGO_PATH = "/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png";

const prompt = ai.definePrompt({
  name: "getTrendingProductsPrompt",
  input: { schema: GetTrendingProductsInputSchema },
  output: { schema: GetTrendingProductsOutputSchema },
  prompt: `
You are a market trend analyst specializing in artisan handmade goods for the Indian market.

{{#if languageLabel}}
IMPORTANT: Respond **ONLY** in {{languageLabel}} ({{language}}).
If no language is provided, default to English.
{{/if}}

Provide 5 currently trending artisan products. For each product, provide:
1.  **name**: The name of the trending product.
2.  **description**: A brief (1-sentence) explanation of why it's trending.
3.  **googleSearchQuery**: A concise Google search query for inspiration.
4.  **suggestedPrice**: A suggested retail price in Indian Rupees, prefixed with "Rs." (e.g., "Rs. 799").
5.  **platform**: The top e-commerce platform for this product in India (choose from: Etsy, Amazon, Flipkart, Meesho).
6.  **platformSearchQuery**: A concise search query to find similar products on the specified platform.
7.  **rating**: An estimated average user rating (float from 1.0 to 5.0).
8.  **reviewCount**: An estimated number of reviews on that platform.
9.  **insight**: A short, actionable tip for the artisan.

Return a JSON object matching the output schema.
`
});

const getTrendingProductsFlow = ai.defineFlow(
  {
    name: "getTrendingProductsFlow",
    inputSchema: GetTrendingProductsInputSchema,
    outputSchema: GetTrendingProductsOutputSchema,
  },
  async (input) => {
    const language = (input as any).language || "en";
    const languageLabelMap: any = {
      en: "English",
      hi: "Hindi",
      kn: "Kannada",
    };
    const languageLabel = input.languageLabel || languageLabelMap[language] || "English";
    const logoUrl = (input.logoUrl || DEFAULT_LOGO_PATH);

    const { output } = await prompt({
      ...input,
      language,
      languageLabel,
      logoUrl,
    });

    if (!output || !output.products) {
      throw new Error("Failed to generate trending products.");
    }

    return output;
  }
);
