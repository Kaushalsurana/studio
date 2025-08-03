// Content Generation flow to create educational content for science topics.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentGenerationInputSchema = z.object({
  topic: z.string().describe('The science topic to generate content for.'),
  editorialGuidelines: z
    .string()
    .describe(
      'Editorial guidelines including writing style and target audience.'
    ),
});
export type ContentGenerationInput = z.infer<typeof ContentGenerationInputSchema>;

const ContentGenerationOutputSchema = z.object({
  content: z.string().describe('The generated educational content.'),
  progress: z.string().describe('Progress of content generation.')
});
export type ContentGenerationOutput = z.infer<typeof ContentGenerationOutputSchema>;

export async function generateContent(
  input: ContentGenerationInput
): Promise<ContentGenerationOutput> {
  return generateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentGenerationPrompt',
  input: {schema: ContentGenerationInputSchema},
  output: {schema: ContentGenerationOutputSchema},
  prompt: `You are an expert science educator. Generate age-appropriate educational content for the following topic, based on the provided editorial guidelines.  Make sure to include key concepts and examples.

Topic: {{{topic}}}
Editorial Guidelines: {{{editorialGuidelines}}}

Content:`, 
});

const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContentFlow',
    inputSchema: ContentGenerationInputSchema,
    outputSchema: ContentGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      progress: 'Generated educational content for the given science topic.',
    };
  }
);
