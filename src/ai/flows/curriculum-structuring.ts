'use server';

/**
 * @fileOverview A curriculum structuring AI agent.
 *
 * - curriculumStructuring - A function that handles the curriculum structuring process.
 * - CurriculumStructuringInput - The input type for the curriculumStructuring function.
 * - CurriculumStructuringOutput - The return type for the curriculumStructuring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CurriculumStructuringInputSchema = z.object({
  syllabusText: z.string().describe('The text content of the science syllabus file.'),
});
export type CurriculumStructuringInput = z.infer<typeof CurriculumStructuringInputSchema>;

const SubtopicSchema = z.object({
  topic: z.string().describe('A main topic from the syllabus.'),
  subtopics: z.array(z.string()).describe('An array of subtopics for the given main topic.'),
});

const CurriculumStructuringOutputSchema = z.object({
  topics: z
    .array(z.string())
    .describe('An array of the main topics extracted from the syllabus, in a logical order.'),
  subtopics: z
    .array(SubtopicSchema)
    .describe('A list of topics and their corresponding subtopics.'),
});
export type CurriculumStructuringOutput = z.infer<typeof CurriculumStructuringOutputSchema>;

export async function curriculumStructuring(input: CurriculumStructuringInput): Promise<CurriculumStructuringOutput> {
  return curriculumStructuringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'curriculumStructuringPrompt',
  input: {schema: CurriculumStructuringInputSchema},
  output: {schema: CurriculumStructuringOutputSchema},
  prompt: `You are an expert curriculum designer specializing in science education.

You will receive the content of a science syllabus and extract the main topics and subtopics.

Syllabus Content: {{{syllabusText}}}

Return the main topics as an array of strings in a logical order.
For each main topic, extract the subtopics and return them as an array of objects, where each object contains the main topic and a list of its subtopics.
`,
});

const curriculumStructuringFlow = ai.defineFlow(
  {
    name: 'curriculumStructuringFlow',
    inputSchema: CurriculumStructuringInputSchema,
    outputSchema: CurriculumStructuringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
