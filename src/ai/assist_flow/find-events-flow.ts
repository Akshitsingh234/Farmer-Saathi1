'use server';

/**
 * @fileOverview Finds upcoming events and exhibitions for artisans in a given country.
 *
 * - findEvents - A function that returns a list of future events (now localized).
 * - FindEventsInput - The input type for the findEvents function.
 * - FindEventsOutput - The return type for the findEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindEventsInputSchema = z.object({
  country: z.string().describe('The country to search for events in.'),
  state: z.string().optional().describe('The state or region within the country to search for events in.'),
});
export type FindEventsInput = z.infer<typeof FindEventsInputSchema>;

const FindEventsOutputSchema = z.object({
  events: z.array(
    z.object({
        name: z.string().describe("The name of the event."),
        date: z.string().describe("The date(s) of the event."),
        location: z.string().describe("The city and venue of the event."),
        link: z.string().describe("The URL to the event's website for registration or more information."),
    })
  ).describe('A list of 5 upcoming events for artisans.'),
});
export type FindEventsOutput = z.infer<typeof FindEventsOutputSchema>;

/**
 * Internal input extends the public input with currentDate, optional language and logoUrl.
 * - language: 'en' | 'hi' | 'kn' etc. (default to 'en' when not provided)
 * - languageLabel: human-readable label like "English", "Hindi", "Kannada"
 * - currentDate: provided for the model to filter upcoming events correctly
 * - logoUrl: optional URL to the brand/logo for context (we pass your uploaded path)
 */
const InternalFindEventsInputSchema = FindEventsInputSchema.extend({
  currentDate: z.string().describe('The current date.'),
  language: z.string().optional().describe('ISO language code, e.g. en, hi, kn.'),
  languageLabel: z.string().optional().describe('Human readable language label, e.g. English, Hindi, Kannada.'),
  logoUrl: z.string().optional().describe('Optional URL/path to a brand logo for context.'),
});

const prompt = ai.definePrompt({
  name: 'findEventsPrompt',
  input: {schema: InternalFindEventsInputSchema},
  output: {schema: FindEventsOutputSchema},
  prompt: `You are an expert researcher specializing in events for local artisans and crafters.
The current date is {{currentDate}}.

IMPORTANT: Always produce the reply in the requested language: {{languageLabel}} ({{language}}).
Preserve placeholders (such as {productName}, {city}, {artisanName}, {last4Digits}, {year}) exactly as-is.
If a logo or brand context is provided, its URL is: {{logoUrl}}.

{{#if state}}
Find a list of 5 real, upcoming craft fairs, art exhibitions, or artisan markets in the state of {{{state}}}, {{{country}}}.
{{else}}
Find a list of 5 real, upcoming craft fairs, art exhibitions, or artisan markets in {{{country}}}.
{{/if}}

IMPORTANT: All events you return MUST take place after the current date of {{currentDate}}. Do not include any events that have already passed.

For each event, provide:
- The official name of the event.
- The dates it will be held.
- The location (city and venue if available).
- A valid, direct URL to the event's website for registration or more information. The link must be a real, working URL.

Return exactly the JSON structure that matches the output schema (an object with an "events" array containing up to 5 event objects).
`
});

const findEventsFlow = ai.defineFlow(
  {
    name: 'findEventsFlow',
    inputSchema: FindEventsInputSchema,
    outputSchema: FindEventsOutputSchema,
  },
  async (input) => {
    // Determine language defaults and label
    const language = (input as any).language || 'en';
    const languageLabelMap: Record<string,string> = {
      en: 'English',
      hi: 'Hindi',
      kn: 'Kannada',
      // add more mappings as needed
    };
    const languageLabel = (input as any).languageLabel || languageLabelMap[language] || language;

    // Use the uploaded logo path from this session as logoUrl unless caller provides something else.
    // Developer note: the uploaded logo path in this conversation is:
    // /mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png
    const defaultLogoPath = '/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png';

    const {output} = await prompt({
        ...input,
        currentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        language,
        languageLabel,
        logoUrl: (input as any).logoUrl || defaultLogoPath,
    });

    return output!;
  }
);

export async function findEvents(input: FindEventsInput & { language?: string; languageLabel?: string; logoUrl?: string }): Promise<FindEventsOutput> {
  return findEventsFlow(input);
}
