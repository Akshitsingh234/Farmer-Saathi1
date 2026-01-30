'use server';

/**
 * @fileOverview This file defines a Genkit flow for voice-based navigation. It transcribes an audio
 * input, determines the desired page based on the user's request, and returns the corresponding path.
 */

import { ai } from '@/ai/genkit';
import { speechToText } from '@/ai/community_flow/speech-to-text';
import { z } from 'genkit';

// Defines all valid navigation paths and a description for the AI model.
const PagePathsSchema = z.enum([
  '/',
  '/artconnect/stories',
  '/artconnect/challenges',
  '/artisan-assist/sourcing-pricing',
  '/artisan-assist/events',
  '/create',
  '/inspiration-corner',
  '/journal',
  '/login',
  '/postCreator',
  '/schemes',
  '/profile',
  '/inventory',    // ← added
  '/todo', 
  'unknown'
]);

export async function navigateWithVoice(audioDataUri: string): Promise<{ path: string }> {
  const result = await voiceNavigationFlow(audioDataUri);
  // Ensure the output is a plain object for the client.
  return { path: result.path };
}

const voiceNavigationFlow = ai.defineFlow(
  {
    name: 'voiceNavigationFlow',
    inputSchema: z.string(),
    outputSchema: z.object({ path: PagePathsSchema }),
  },
  async (audioDataUri) => {
    
    const transcribedText = await speechToText(audioDataUri);

    // If transcription fails or is empty, return 'unknown'.
    if (!transcribedText) {
      return { path: 'unknown' as const };
    }

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are an intelligent website navigation assistant. Your task is to understand the user's request and map it to the most relevant page on the website.

      Analyze the semantic meaning of the user's request: "${transcribedText}"
      
      Based on your analysis, choose the most appropriate page from the following list. Respond with ONLY the corresponding path.
      
      Available Pages:
      - Path: '/' (For general requests like "go home", "main page")
      - Path: '/artconnect/stories' (For requests about community stories, seeing what others have made, community posts)
      - Path: '/artconnect/challenges' (For requests about competitions, creative contests, or artisan challenges)
      - Path: '/artisan-assist/sourcing-pricing' (For requests about finding materials, sourcing supplies, or pricing products)
      - Path: '/artisan-assist/events' (For requests about upcoming events, workshops, or exhibitions)
      
      - Path: '/inspiration-corner' (For requests about finding ideas, creative inspiration, or looking for new concepts)
     
      - Path: '/inventory' (For requests about managing inventory, stock, products, materials)
      - Path: '/todo' (For requests about task lists, to-dos, chores, or checking outstanding tasks)

      - Path: '/postCreator' (For requests about creating social media posts, content marketing, or promotion)
      - Path: '/schemes' (For requests about government support, financial aid, or official artisan schemes)
      - Path: '/profile' (For requests about the user's own profile, account details, or personal settings)
      - Path: 'unknown' (Use this if the user's request does not clearly match any of the pages)
      `,
      output: {
          schema: z.object({ path: PagePathsSchema })
      },
      config: {
          temperature: 0.1
      }
    });

    return output ?? { path: 'unknown' as const };
  }
);