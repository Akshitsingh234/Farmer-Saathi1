import { ai } from '../genkit';
import { z } from 'zod';

const CropPricingInputSchema = z.object({
  cropName: z.string().describe('Name of the crop'),
  location: z.string().describe('Market location or region'),
  quantity: z.number().optional().describe('Quantity to sell in kg/tons'),
  season: z.string().optional().describe('Current season'),
});

export const getCropPricing = ai.defineFlow(
  {
    name: 'getCropPricing',
    inputSchema: CropPricingInputSchema,
    outputSchema: z.object({
      priceAnalysis: z.string(),
      suggestedPrice: z.string(),
      marketTrends: z.array(z.string()),
      bestSellingTime: z.string(),
    }),
  },
  async ({ cropName, location, quantity, season }) => {
    const prompt = `
You are an agricultural market analyst providing crop pricing insights to farmers.

Crop Details:
- Crop: ${cropName}
- Location: ${location}
- Quantity: ${quantity ? `${quantity} kg` : 'Not specified'}
- Season: ${season || 'Current season'}

Provide detailed market analysis including:
1. Current market price trends for this crop
2. Suggested selling price range
3. Market demand patterns
4. Best time to sell for maximum profit
5. Factors affecting price (weather, demand, supply)
6. Tips for getting better prices

Focus on practical advice for Indian agricultural markets.
`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
    });

    const analysis = response.text();
    
    // Extract key information from the response
    const lines = analysis.split('\n').filter(line => line.trim());
    const trends = lines.filter(line => 
      line.includes('trend') || line.includes('demand') || line.includes('supply')
    ).slice(0, 4);

    // Extract price information
    const priceLines = lines.filter(line => 
      line.includes('₹') || line.includes('price') || line.includes('rate')
    );
    const suggestedPrice = priceLines.length > 0 ? priceLines[0] : `₹25-35 per kg for ${cropName}`;

    // Extract timing information
    const timingLines = lines.filter(line => 
      line.includes('time') || line.includes('month') || line.includes('season')
    );
    const bestTime = timingLines.length > 0 ? timingLines[0] : 'Post-harvest season typically offers better prices';

    return {
      priceAnalysis: analysis,
      suggestedPrice,
      marketTrends: trends.length > 0 ? trends : ['Seasonal demand fluctuations', 'Weather impact on supply', 'Festival season price surge', 'Export demand variations'],
      bestSellingTime: bestTime,
    };
  }
);