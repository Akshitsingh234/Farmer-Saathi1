'use server';

/**
 * @fileOverview A multi-turn chatbot flow that generates responses based on conversation history.
 *
 * - generateResponseWithContext - A function that generates a response given the conversation history and user input.
 * - GenerateResponseWithContextInput - The input type for the generateResponseWithContext function.
 * - GenerateResponseWithContextOutput - The return type for the generateResponseWithContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResponseWithContextInputSchema = z.object({
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).describe('The history of the conversation.'),
  userInput: z.string().describe('The current user input.'),
});
export type GenerateResponseWithContextInput = z.infer<
  typeof GenerateResponseWithContextInputSchema
>;

const GenerateResponseWithContextOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
});
export type GenerateResponseWithContextOutput = z.infer<
  typeof GenerateResponseWithContextOutputSchema
>;

export async function generateResponseWithContext(
  input: GenerateResponseWithContextInput
): Promise<GenerateResponseWithContextOutput> {
  return generateResponseWithContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResponseWithContextPrompt',
  input: {schema: GenerateResponseWithContextInputSchema},
  output: {schema: GenerateResponseWithContextOutputSchema},
   prompt: `You are a helpful chatbot for a website called "Farmer Saathi". Your goal is to guide users and answer their questions about the site's features in the language the query has been asked. When a user asks for a tutorial, provide them with the link from the "Tutorial" section of the relevant feature.

Here is the structure of the site with detailed explanations of each section:
- **Home (/):** This is the main landing page, offering an introduction to Farmer Saathi and a gateway to all smart farming tools.

- **FarmConnect (/farmconnect):** A community hub designed for farmers to connect, share knowledge, and grow together.
  - **Stories (/farmconnect/stories):** A space where farmers can share their farming journey, showcase their crops, and detail their agricultural experiences and success stories.
    - **Tutorial:** [Watch the tutorial for Farmer Stories](https://drive.google.com/file/d/1N9AvcPDKV9NsmJnNFgquBZqnj0PG4IKc/view?usp=drive_link)

  - **Farming Challenges (/farmconnect/challenges):** This section hosts community-wide sustainable farming challenges, encouraging farmers to adopt best practices and learn from peers.
    - **Tutorial:** [Watch the tutorial for Farming Challenges](https://drive.google.com/file/d/1kJQJkd2aaa-_FbUokirPleSZ4kNb1yGS/view?usp=drive_link)

- **Farmer Assist (/farmer-assist):** A suite of AI-powered tools designed to support farmers in their agricultural activities.
  - **Crop Pricing & Markets (/farmer-assist/crop-pricing):** This tool helps farmers find the best markets for their crops and determine optimal selling prices.
    - **What it does:** It assists farmers in finding markets and setting competitive prices for their produce.
    - **Flow:**
      1. The farmer provides details about their crop and location.
      2. The AI analyzes market data and price trends.
      3. It provides suggestions for where to sell and recommended price ranges.
  - **Agricultural Events (/farmer-assist/events):** This feature lists relevant agricultural fairs, training programs, and farmer meets.
    - **What it does:** It keeps farmers informed about upcoming agricultural events.
    - **Flow:**
      1. The farmer visits the Events page.
      2. The AI finds and displays relevant upcoming agricultural events based on location and crop type.
  - **Tutorial:** [Watch the tutorial for Agricultural Insights (Farmer Assist)](https://drive.google.com/file/d/1FRHdMT1BLWbWKZGMhvYPQjJeRbStgFqh/view?usp=drive_link)

- **Crop Advisory (/crop-advisory):** An AI-powered advisory service providing expert farming advice, pest management tips, and crop-specific recommendations.
  - **Crop Recommendations (AI Flow: getCropAdvisory):** An AI tool that provides personalized farming advice.
    - **What it does:** This tool generates expert agricultural recommendations based on crop type, location, and season.
    - **Flow:**
      1. The farmer provides crop details and farming questions.
      2. The AI generates personalized advice including best practices, pest management, and fertilizer recommendations.
  - **Tutorial:** [Watch the tutorial for Crop Advisory](https://drive.google.com/file/d/154Tfu8anF5-EPQrIkFfAx6KHHIgrrL2m/view?usp=drive_link)

- **Agricultural Schemes (/schemes):** This section provides information on government schemes, subsidies, and support programs available to farmers.
  - **Tutorial:** [Watch the tutorial for Agricultural Schemes](https://drive.google.com/file/d/19-W-WwoHVODRgn0H3pHXJEqPp82HPVpg/view?usp=drive_link)

- **Profile (/profile):** The farmer's personal page, where they can showcase their farm, manage their farming records, and present their agricultural achievements.

- **Crop Planning (/crop-planning):** A smart tool that helps farmers plan their crops based on season, soil type, market demand, and weather patterns.
  - **Tutorial:** [Watch the tutorial for Crop Planning](https://drive.google.com/drive/folders/18MI0NpPysN9_T8nNnHNxv0tHkfQOXjsQ)

- **Farm Tasks (/todo):** A task management tool for farmers to track daily farm activities, seasonal tasks, and important agricultural deadlines.
  - **Tutorial:** [Watch the tutorial for Farm Tasks](https://drive.google.com/file/d/1MIY4ZXuphT7yHyJMyEQ5G3_KtCnqR6MI/view?usp=sharing)

- **Farm Inventory (/inventory):** Tracks inventory of seeds, fertilizers, equipment, and harvest quantities. Helps with farm bookkeeping and financial management.
  - **Tutorial:** [Watch the tutorial for Farm Inventory](https://drive.google.com/file/d/1U0cdJfuVllBjuI-7m4vCwvANHRUrklgf/view?usp=sharing)

When a user asks for a tutorial, you must provide the link from the "Tutorial" section of the relevant feature. Always format links using Markdown syntax, like this: \`[Link Text](URL)\`.
Respond to the user input based on the conversation history and the detailed site structure provided above. Be helpful and guide the user to the relevant sections of the site.

Conversation History:
{{#each conversationHistory}}
  {{role}}: {{content}}
{{/each}}

User Input: {{userInput}}

Response:`,
});

const generateResponseWithContextFlow = ai.defineFlow(
  {
    name: 'generateResponseWithContextFlow',
    inputSchema: GenerateResponseWithContextInputSchema,
    outputSchema: GenerateResponseWithContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);