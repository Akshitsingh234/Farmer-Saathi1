import { ai } from '../genkit';
import { z } from 'zod';

const CropAdvisoryInputSchema = z.object({
  cropType: z.string().describe('Type of crop (e.g., wheat, rice, tomato)'),
  location: z.string().describe('Location/region of the farm'),
  season: z.string().describe('Current season or planting season'),
  soilType: z.string().optional().describe('Type of soil (if known)'),
  issue: z.string().optional().describe('Specific farming issue or question'),
});

export const getCropAdvisory = ai.defineFlow(
  {
    name: 'getCropAdvisory',
    inputSchema: CropAdvisoryInputSchema,
    outputSchema: z.object({
      advice: z.string(),
      recommendations: z.array(z.string()),
      bestPractices: z.array(z.string()),
    }),
  },
  async ({ cropType, location, season, soilType, issue }) => {
    const prompt = `
You are an expert agricultural advisor helping farmers with crop management.

Farmer Details:
- Crop: ${cropType}
- Location: ${location}
- Season: ${season}
- Soil Type: ${soilType || 'Not specified'}
- Specific Issue: ${issue || 'General advice needed'}

Provide comprehensive farming advice including:
1. Specific recommendations for this crop and location
2. Best practices for the current season
3. Common issues to watch out for
4. Fertilizer and irrigation recommendations
5. Pest and disease management tips

Keep the advice practical and actionable for farmers.
`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
    });

    const advice = response.text();
    
    // Extract recommendations and best practices from the response
    const lines = advice.split('\n').filter(line => line.trim());
    const recommendations = lines.filter(line => 
      line.includes('recommend') || line.includes('suggest') || line.includes('should')
    ).slice(0, 5);
    
    const bestPractices = lines.filter(line => 
      line.includes('practice') || line.includes('tip') || line.includes('important')
    ).slice(0, 5);

    return {
      advice,
      recommendations: recommendations.length > 0 ? recommendations : ['Follow seasonal farming calendar', 'Monitor weather conditions', 'Use quality seeds'],
      bestPractices: bestPractices.length > 0 ? bestPractices : ['Regular soil testing', 'Proper irrigation management', 'Integrated pest management'],
    };
  }
);