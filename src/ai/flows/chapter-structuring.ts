// Chapter structuring flow to automatically structure generated content into logical chapters.

'use server';

/**
 * @fileOverview This file defines a Genkit flow for structuring educational content into logical chapters.
 *
 * The flow takes unstructured content as input and returns a structured textbook with chapters and subtopics.
 * It exports the following:
 * - chapterStructuring: The main function to call for structuring content.
 * - ChapterStructuringInput: The input type for the chapterStructuring function.
 * - ChapterStructuringOutput: The output type for the chapterStructuring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChapterStructuringInputSchema = z.object({
  content: z.string().describe('The unstructured educational content to be structured into chapters.'),
  editorialGuidelines: z.string().describe('The editorial guidelines to follow when structuring the content.'),
});
export type ChapterStructuringInput = z.infer<typeof ChapterStructuringInputSchema>;

const ChapterSchema = z.object({
  title: z.string().describe('The title of the chapter.'),
  subtopics: z.array(z.string()).describe('The subtopics covered in the chapter.'),
  content: z.string().describe('The educational content of the chapter.'),
});

const ChapterStructuringOutputSchema = z.object({
  chapters: z.array(ChapterSchema).describe('The structured chapters of the textbook.'),
});
export type ChapterStructuringOutput = z.infer<typeof ChapterStructuringOutputSchema>;

export async function chapterStructuring(input: ChapterStructuringInput): Promise<ChapterStructuringOutput> {
  return chapterStructuringFlow(input);
}

const chapterStructuringPrompt = ai.definePrompt({
  name: 'chapterStructuringPrompt',
  input: {
    schema: ChapterStructuringInputSchema,
  },
  output: {
    schema: ChapterStructuringOutputSchema,
  },
  prompt: `You are an experienced textbook editor. Your task is to structure the provided educational content into logical chapters, following the given editorial guidelines.

Editorial Guidelines: {{{editorialGuidelines}}}

Content to Structure: {{{content}}}

Structure the content into chapters, each with a title, a list of subtopics, and the content for that chapter. Return the structured chapters in JSON format. Focus on creating logical chapter divisions and groupings of subtopics. Make sure that you provide all the content given to you, and it is divided logically into chapters and subtopics. Chapters should be self-contained and cover distinct aspects of the overall topic. Ensure that each chapter and subtopic aligns with the editorial guidelines.

Output the structured textbook in the following JSON format:

${JSON.stringify(ChapterStructuringOutputSchema)}
`,
});

const chapterStructuringFlow = ai.defineFlow(
  {
    name: 'chapterStructuringFlow',
    inputSchema: ChapterStructuringInputSchema,
    outputSchema: ChapterStructuringOutputSchema,
  },
  async input => {
    const {output} = await chapterStructuringPrompt(input);
    return output!;
  }
);
