'use server';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChapterRefinementInputSchema = z.object({
  chapterTitle: z.string().describe('The title of the chapter.'),
  subtopics: z.array(z.object({
    subTopic: z.string(),
    content: z.string(),
  })).describe('An array of subtopics and their generated content.'),
  editorialGuidelines: z.string().describe('Editorial guidelines for tone and style.'),
});
export type ChapterRefinementInput = z.infer<typeof ChapterRefinementInputSchema>;

const ChapterRefinementOutputSchema = z.object({
  refinedContent: z.string().describe('The full, refined content of the chapter, formatted as a single, continuous string.'),
  summary: z.string().describe('A brief summary of the chapter.'),
});
export type ChapterRefinementOutput = z.infer<typeof ChapterRefinementOutputSchema>;

// This function is the only named export and it is an async function.
export async function refineChapter(input: ChapterRefinementInput): Promise<ChapterRefinementOutput> {
  return chapterRefinementFlow(input);
}

const chapterRefinementPrompt = ai.definePrompt({
    name: 'chapterRefinementPrompt',
    input: { schema: ChapterRefinementInputSchema },
    output: { schema: ChapterRefinementOutputSchema },
    prompt: `You are a book editor. Your task is to take the raw content for a chapter, which is divided into subtopics, and refine it into a single, cohesive chapter.

**Chapter Title:** {{{chapterTitle}}}

**Editorial Guidelines:** {{{editorialGuidelines}}}

**Raw Content (Subtopic by Subtopic):**
{{#each subtopics}}
---
### {{this.subTopic}}
{{{this.content}}}
---
{{/each}}

**Your Instructions:**
1.  **Create a Cohesive Narrative:** Rewrite the raw content to flow seamlessly from one subtopic to the next. Remove any awkward greetings or transitions. The final text should read like a continuous chapter in a book.
2.  **Maintain Tone:** Ensure the entire chapter adheres to the provided editorial guidelines.
3.  **Add a Summary:** At the end of the chapter, add a concise summary of the key learning points.
4.  **Format Output:** Your output MUST be a JSON object with two keys: "refinedContent" and "summary".

Now, generate the refined chapter.`,
});


const chapterRefinementFlow = ai.defineFlow(
  {
    name: 'chapterRefinementFlow',
    inputSchema: ChapterRefinementInputSchema,
    outputSchema: ChapterRefinementOutputSchema,
  },
  async (input) => {
    const { output } = await chapterRefinementPrompt(input);
    return output!;
  }
);
