'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InsightSchema = z.object({
  productName: z.string().describe('The suggested product name to create.'),
  reason: z.string().describe('The reason for the suggestion (e.g., upcoming event, trend).'),
  materialsRequired: z.array(z.string()).describe('The materials from inventory that would be used.'),
});

export const getInventoryInsightsFlow = ai.defineFlow(
  {
    name: 'getInventoryInsightsFlow',
    inputSchema: z.object({
        products: z.array(z.object({ name: z.string(), quantity: z.number() })),
        materials: z.array(z.object({ name: z.string(), quantity: z.number() })),
    }),
    outputSchema: z.object({
        insights: z.array(InsightSchema),
    }),
  },
  async (inventory) => {
    const currentDate = new Date().toDateString();
    const prompt = `
      You are an expert artisan assistant. Your goal is to provide insightful recommendations
      for what a user should create next based on their current inventory and upcoming events.
      The suggestions should be creative and align with the style of products the user already makes. Do not suggest products from a completely different domain.

      Today's date is ${currentDate}.

      Here is the current inventory:
      Products:
      ${inventory.products.map(p => `- ${p.name} (Quantity: ${p.quantity})`).join('\n')}

      Raw Materials:
      ${inventory.materials.map(m => `- ${m.name} (Quantity: ${m.quantity})`).join('\n')}

      Please provide 2-3 specific and creative product suggestions based on the inventory.
      For each suggestion, provide:
      1. A clear product name.
      2. A compelling reason for the suggestion. Consider upcoming holidays, seasons, festivals (e.g., Diwali, Christmas, wedding season), or current trends that align with the user's existing product types (e.g., pottery, textiles).
      3. A list of raw materials from the inventory that would be required.

      Provide the output in a valid JSON format that adheres to the provided schema.
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: {
          format: 'json',
          schema: z.object({
            insights: z.array(InsightSchema),
          }),
      },
    });

    const output = llmResponse.output;
    if (!output) {
      throw new Error("Failed to generate insights from the model.");
    }
    return output;
  }
);
