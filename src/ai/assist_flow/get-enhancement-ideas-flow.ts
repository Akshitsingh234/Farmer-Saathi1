'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetEnhancementIdeasInputSchema = z.object({
  productName: z.string().describe("The name or type of the artisan's product."),
  productDescription: z.string().describe("A brief description of the artisan's product."),
  language: z.string().optional().describe('ISO language code to request output in, e.g. en, hi, kn.'),
  languageLabel: z.string().optional().describe('Human readable language label, e.g. English, Hindi, Kannada.'),
  logoUrl: z.string().optional().describe('Optional URL/path to a brand logo for context.'),
});
export type GetEnhancementIdeasInput = z.infer<typeof GetEnhancementIdeasInputSchema>;

const GetEnhancementIdeasOutputSchema = z.object({
  ideas: z
    .array(
      z.object({
        title: z.string().describe('A catchy title for the enhancement idea.'),
        description: z
          .string()
          .describe('A detailed but concise (1-2 sentences) description of the idea, explaining the enhancement and why it would appeal to current market trends.'),
        googleSearchQuery: z.string().describe("A concise Google search query that will return inspirational images for this idea."),
        suggestedPrice: z.string().describe('A suggested retail price for the product in Indian Rupees, prefixed with "Rs.", e.g., "Rs. 499"'),
        platform: z.string().describe('The e-commerce platform where similar products are popular (e.g., Etsy, Amazon, Flipkart, Meesho).'),
        platformSearchQuery: z.string().describe('A concise search query to find similar products on the specified e-commerce platform.'),
        rating: z.number().min(1).max(5).describe('An estimated average rating for similar products on the specified platform.'),
        reviewCount: z.number().describe('An estimated number of reviews for similar products.'),
        insight: z.string().describe('A short, actionable insight or tip for the artisan related to this idea.'),
      })
    )
    .min(3)
    .max(3)
    .describe('A list of 3 distinct and creative product enhancement ideas.'),
});
export type GetEnhancementIdeasOutput = z.infer<typeof GetEnhancementIdeasOutputSchema>;

export async function getEnhancementIdeas(input: GetEnhancementIdeasInput): Promise<GetEnhancementIdeasOutput> {
  return getEnhancementIdeasFlow(input);
}

const DEFAULT_LOGO_PATH = '/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png';

const prompt = ai.definePrompt({
  name: 'getEnhancementIdeasPrompt',
  input: { schema: GetEnhancementIdeasInputSchema },
  output: { schema: GetEnhancementIdeasOutputSchema },
  prompt: `You are an expert product designer and marketing strategist specializing in the artisan and handmade goods sector for the Indian market.

{{#if languageLabel}}
IMPORTANT: Always produce the reply in the requested language: {{languageLabel}} ({{language}}).
If no language is specified, default to English.
{{/if}}

An artisan has provided the following information about their product:
- Product Name: {{productName}}
- Product Description: {{productDescription}}

Your task:
1.  Analyze the artisan's product and research current trends in the Indian market.
2.  Generate 3 distinct, creative, and actionable enhancement ideas.
3.  For each idea, provide:
    *   **title**: A catchy, short title (5 words max).
    *   **description**: 1-2 concise sentences explaining the enhancement and its appeal.
    *   **googleSearchQuery**: A concise Google search query for inspirational images.
    *   **suggestedPrice**: A suggested retail price in Indian Rupees, prefixed with "Rs." (e.g., "Rs. 499").
    *   **platform**: The top e-commerce platform for this product in India (choose from: Etsy, Amazon, Flipkart, Meesho).
    *   **platformSearchQuery**: A concise search query to find similar products on the specified platform.
    *   **rating**: An estimated average user rating (float from 1.0 to 5.0).
    *   **reviewCount**: An estimated number of reviews on that platform.
    *   **insight**: A short, actionable tip for the artisan.

Constraints:
- Return a JSON object matching the output schema.
- Ensure all text (titles, descriptions, queries, insights) is in the requested language.
`,
});

const getEnhancementIdeasFlow = ai.defineFlow(
  {
    name: 'getEnhancementIdeasFlow',
    inputSchema: GetEnhancementIdeasInputSchema,
    outputSchema: GetEnhancementIdeasOutputSchema,
  },
  async (input) => {
    const language = (input as any).language || 'en';
    const languageLabelMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      kn: 'Kannada',
    };
    const languageLabel = (input as any).languageLabel || languageLabelMap[language] || language;
    const logoUrl = (input as any).logoUrl || DEFAULT_LOGO_PATH;

    const { output } = await prompt({
      ...input,
      language,
      languageLabel,
      logoUrl,
    });

    if (!output || !output.ideas) {
      throw new Error("Failed to generate enhancement ideas.");
    }

    return output;
  }
);
