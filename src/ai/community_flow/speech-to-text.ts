'use server';
/**
 * @fileOverview A speech-to-text AI agent.
 *
 * - speechToText - A function that handles audio transcription.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export async function speechToText(audioDataUri: string): Promise<string> {
  return speechToTextFlow(audioDataUri);
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (audioDataUri) => {
    
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        { media: { url: audioDataUri } },
        { text: 'Transcribe the spoken words in this audio file. Only return the transcribed text.' },
      ],
      config: {
        temperature: 0.1, 
      }
    });

    return text.trim();
  }
);