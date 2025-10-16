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

const ChapterSchema = z.object({
  chapter_title: z.string().describe('The title of the chapter.'),
  subtopics: z.array(z.string()).describe('An array of subtopics for the given chapter.'),
});

const CurriculumStructuringOutputSchema = z.object({
  chapters: z
    .array(ChapterSchema)
    .describe('An array of chapters, each with a title and a list of subtopics.'),
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

You will receive the content of a science syllabus and extract the chapters and their subtopics.

Syllabus Content: {{{syllabusText}}}

Return the curriculum structure as an array of chapters. Each chapter should have a title and a list of its subtopics.
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
