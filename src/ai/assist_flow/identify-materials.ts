'use server';

/**
 * @fileOverview Identifies raw materials needed for a crafted item from a photo upload using AI.
 *
 * - identifyMaterialsFromPhoto - A function that handles the identification of materials from a photo.
 * - IdentifyMaterialsFromPhotoInput - The input type for the identifyMaterialsFromPhoto function.
 * - IdentifyMaterialsFromPhotoOutput - The return type for the identifyMaterialsFromPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMaterialsFromPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crafted item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyMaterialsFromPhotoInput = z.infer<typeof IdentifyMaterialsFromPhotoInputSchema>;

const IdentifyMaterialsFromPhotoOutputSchema = z.object({
  materials: z.array(
    z.string().describe('A raw material needed for the crafted item.')
  ).describe('A list of raw materials identified from the photo.')
});
export type IdentifyMaterialsFromPhotoOutput = z.infer<typeof IdentifyMaterialsFromPhotoOutputSchema>;

export async function identifyMaterialsFromPhoto(input: IdentifyMaterialsFromPhotoInput): Promise<IdentifyMaterialsFromPhotoOutput> {
  return identifyMaterialsFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyMaterialsFromPhotoPrompt',
  input: {schema: IdentifyMaterialsFromPhotoInputSchema},
  output: {schema: IdentifyMaterialsFromPhotoOutputSchema},
  system: `You are an expert in identifying raw materials from a photo of a crafted item.`,
  prompt: `Analyze the following photo and identify the raw materials needed to create the item.
  Return a list of the materials. The list should be as specific as possible.
  If the image does not contain a crafted item, or if you cannot identify any materials, return an empty list.

  Photo: {{media url=photoDataUri}}
  `,
});

const identifyMaterialsFromPhotoFlow = ai.defineFlow(
  {
    name: 'identifyMaterialsFromPhotoFlow',
    inputSchema: IdentifyMaterialsFromPhotoInputSchema,
    outputSchema: IdentifyMaterialsFromPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
