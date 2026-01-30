
'use server';
/**
 * @fileOverview An AI agent to extract details from an ID card image using OCR.
 *
 * - extractCardDetails - A function that handles the card detail extraction process.
 * - ExtractCardDetailsInput - The input type for the extractCardDetails function.
 * - ExtractCardDetailsOutput - The return type for the extractCardDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractCardDetailsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of an ID card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractCardDetailsInput = z.infer<typeof ExtractCardDetailsInputSchema>;

const ExtractCardDetailsOutputSchema = z.object({
  cardType: z.enum(['Aadhaar', 'PAN', 'Other', 'Unclear']).describe('The type of card identified.'),
  aadhaarNumber: z.string().optional().describe('The extracted Aadhaar number, formatted as XXXX-XXXX-XXXX.'),
  imageQuality: z.object({
    isBlurry: z.boolean().describe('Whether the image is too blurry to read.'),
    isDark: z.boolean().describe('Whether the image is too dark to read.'),
    isClear: z.boolean().describe('Whether the image is clear enough for OCR.')
  }).describe('The assessment of the image quality.'),
});
export type ExtractCardDetailsOutput = z.infer<typeof ExtractCardDetailsOutputSchema>;

export async function extractCardDetails(input: ExtractCardDetailsInput): Promise<ExtractCardDetailsOutput> {
  return extractCardDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractCardDetailsPrompt',
  input: {schema: ExtractCardDetailsInputSchema},
  output: {schema: ExtractCardDetailsOutputSchema},
  prompt: `You are an expert OCR assistant. Your task is to analyze the provided image of an ID card.

First, assess the quality of the image. Determine if it is blurry, dark, or clear enough for processing.

Second, identify the type of card (e.g., Aadhaar, PAN).

Third, if the card is an Aadhaar card and the image quality is clear, extract the Aadhaar number. Format the number as XXXX-XXXX-XXXX.

**CRITICAL RULE**: Do not guess or provide a number if you are not highly confident. If the image is blurry, dark, or the number is obscured, you MUST indicate the quality issue in the output and leave the aadhaarNumber field empty. Prioritize accuracy above all else.

Image to analyze: {{media url=imageDataUri}}`,
});

const extractCardDetailsFlow = ai.defineFlow(
  {
    name: 'extractCardDetailsFlow',
    inputSchema: ExtractCardDetailsInputSchema,
    outputSchema: ExtractCardDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
