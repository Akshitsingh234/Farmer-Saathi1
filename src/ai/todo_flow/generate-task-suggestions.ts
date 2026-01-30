'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubtaskSchema = z.object({
  description: z.string().describe('The description of the subtask.'),
});

const TaskSchema = z.object({
  description: z.string().describe('The description of the main task.'),
  subtasks: z.array(SubtaskSchema).optional().describe('An optional array of subtasks.'),
});

const GenerateTaskSuggestionsInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  productName: z.string().describe('The name of the product to be made.'),
});
export type GenerateTaskSuggestionsInput = z.infer<typeof GenerateTaskSuggestionsInputSchema>;

const GenerateTaskSuggestionsOutputSchema = z.object({
  suggestions: z.array(TaskSchema).describe('An array of suggested to-do list tasks, each with optional subtasks.'),
});
export type GenerateTaskSuggestionsOutput = z.infer<typeof GenerateTaskSuggestionsOutputSchema>;

export async function generateTaskSuggestions(input: GenerateTaskSuggestionsInput): Promise<GenerateTaskSuggestionsOutput> {
  return generateTaskSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTaskSuggestionsPrompt',
  input: {schema: GenerateTaskSuggestionsInputSchema},
  output: {schema: GenerateTaskSuggestionsOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert assistant for artisans.
  A customer named {{{customerName}}} has ordered a {{{productName}}}.
  Generate a to-do list of tasks to create this product.
  Provide at least 3 tasks.
  If a task is complex, break it down into smaller subtasks.
`,
});

const generateTaskSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateTaskSuggestionsFlow',
    inputSchema: GenerateTaskSuggestionsInputSchema,
    outputSchema: GenerateTaskSuggestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
