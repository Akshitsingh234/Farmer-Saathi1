
'use server';
/**
 * @fileOverview An AI agent to help artisans complete their e-KYC.
 *
 * - assistKycReminder - A function that assists artisans with their e-KYC process.
 * - AssistKycReminderInput - The input type for the assistKycReminder function.
 * - AssistKycReminderOutput - The return type for the assistKycReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistKycReminderInputSchema = z.object({
  artisanId: z.string().describe('The ID of the artisan.'),
  artisanName: z.string().optional().describe('The name of the artisan.'),
  aadhaarNumber: z.string().describe('The Aadhaar number of the artisan.'),
  bankAccountNumber: z.string().describe('The bank account number of the artisan.'),
  artisanTrade: z.string().describe('The trade of the artisan.'),
  language: z.enum(['en', 'hi']).describe('The language for the response.'),
});
export type AssistKycReminderInput = z.infer<typeof AssistKycReminderInputSchema>;

const AssistKycReminderOutputSchema = z.object({
  eKycAssistance: z.string().describe('Assistance provided to the artisan for completing e-KYC.'),
});
export type AssistKycReminderOutput = z.infer<typeof AssistKycReminderOutputSchema>;

export async function assistKycReminder(input: AssistKycReminderInput): Promise<AssistKycReminderOutput> {
  return assistKycReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistKycReminderPrompt',
  input: {schema: AssistKycReminderInputSchema},
  output: {schema: AssistKycReminderOutputSchema},
  prompt: `You are an AI assistant helping artisans complete their e-KYC for government schemes.
  Based on the artisan's information, provide clear and concise instructions in {{language}} on how to complete the e-KYC process either online or by visiting a Common Service Center (CSC).
  Include the necessary documents and information required for both methods.

  Artisan ID: {{{artisanId}}}
  {{#if artisanName}}Artisan Name: {{{artisanName}}}{{/if}}
  Aadhaar Number: {{{aadhaarNumber}}}
  Bank Account Number: {{{bankAccountNumber}}}
  Artisan Trade: {{{artisanTrade}}}

  Provide assistance to the artisan for completing e-KYC in {{language}}.
  `,
});

const assistKycReminderFlow = ai.defineFlow(
  {
    name: 'assistKycReminderFlow',
    inputSchema: AssistKycReminderInputSchema,
    outputSchema: AssistKycReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
