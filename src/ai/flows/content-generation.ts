// Content Generation flow to create educational content for science topics.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubTopicContentGenerationInputSchema = z.object({
  chapterTitle: z.string().describe('The title of the current chapter.'),
  subTopic: z
    .string()
    .describe('The science sub-topic to generate content for.'),
  previousSubTopics: z.array(z.object({
      subTopic: z.string(),
      content: z.string()
  })).optional().describe('A list of previous subtopics in this chapter and their generated content.'),
  editorialGuidelines: z
    .string()
    .describe(
      'Editorial guidelines including writing style and target audience.'
    ),
});
export type SubTopicContentGenerationInput = z.infer<
  typeof SubTopicContentGenerationInputSchema
>;

const ContentGenerationOutputSchema = z.object({
  content: z.string().describe('The generated educational content.'),
});
export type ContentGenerationOutput = z.infer<
  typeof ContentGenerationOutputSchema
>;

export async function generateSubTopicContent(
  input: SubTopicContentGenerationInput
): Promise<ContentGenerationOutput> {
  return generateSubTopicContentFlow(input);
}

const generateContentPrompt = ai.definePrompt({
  name: 'generateContentPrompt',
  input: {schema: SubTopicContentGenerationInputSchema},
  output: {schema: ContentGenerationOutputSchema},
  prompt: `You are an expert science educator and author writing a chapter for a textbook. Your task is to write the content for a specific subtopic within a larger chapter. It's crucial that your writing flows naturally from the previous subtopic, creating a cohesive and continuous reading experience for a student, not a series of disconnected blog posts.

**Book Context:**
*   **Chapter Title:** {{{chapterTitle}}}
*   **Editorial Guidelines:** {{{editorialGuidelines}}}

**Your Task:**
Write the content for the subtopic: **"{{{subTopic}}}"**.

**Content from Previous Subtopics (for context and continuity):**
{{#if previousSubTopics}}
  {{#each previousSubTopics}}
*   **{{this.subTopic}}**: {{this.content}}
  {{/each}}
{{else}}
This is the first subtopic of the chapter. Please write a compelling introduction to the chapter's main theme before diving into this subtopic.
{{/if}}

**Instructions:**
1.  **Continuity is Key:** Ensure the beginning of your content for "{{{subTopic}}}" logically follows the end of the previous section. Avoid abrupt starts or re-introductions. If this is not the first subtopic, continue the narrative from where the last one left off.
2.  **Book-like Tone:** Write in an engaging, educational, and continuous narrative style suitable for a textbook. Address the reader directly in a friendly and encouraging tone, but avoid breaking the narrative.
3.  **Focus on the Subtopic:** While maintaining flow, make sure the core of your writing is focused on explaining the concepts of "{{{subTopic}}}".
4.  **No Standalone Greetings:** Do not start with "Hello students", "Hey everyone!", or similar greetings. You are writing a book, not giving a lecture. Seamlessly blend into the topic.

Now, generate the content for the subtopic: **"{{{subTopic}}}"**.

Content:`,
});

const generateSubTopicContentFlow = ai.defineFlow(
  {
    name: 'generateSubTopicContentFlow',
    inputSchema: SubTopicContentGenerationInputSchema,
    outputSchema: ContentGenerationOutputSchema,
  },
  async (input) => {
    const {output} = await generateContentPrompt(input);
    return output!;
  }
);


// AI-powered editing flow
const EditWithAIInputSchema = z.object({
    originalContent: z.string().describe('The original content to be edited.'),
    userComment: z.string().describe('The user\'s comment or instruction for editing.'),
});
export type EditWithAIInput = z.infer<typeof EditWithAIInputSchema>;

const EditWithAIOutputSchema = z.object({
    editedContent: z.string().describe('The edited content.'),
});
export type EditWithAIOutput = z.infer<typeof EditWithAIOutputSchema>;

export async function editWithAI(input: EditWithAIInput): Promise<EditWithAIOutput> {
    return editWithAIFlow(input);
}

const editWithAIPrompt = ai.definePrompt({
    name: 'editWithAIPrompt',
    input: {schema: EditWithAIInputSchema},
    output: {schema: EditWithAIOutputSchema},
    prompt: `You are an expert editor. Your task is to edit the following content based on the user's comment.

**Original Content:**
{{{originalContent}}}

**User's Comment:**
{{{userComment}}}

**Instructions:**
1.  **Follow the User's Instructions:** Carefully follow the user's instructions to edit the content.
2.  **Maintain Quality:** Ensure the edited content is well-written, clear, and grammatically correct.
3.  **Return Only the Edited Content:** Do not add any extra text or explanations.

Now, generate the edited content.

Edited Content:`,
});

const editWithAIFlow = ai.defineFlow(
    {
        name: 'editWithAIFlow',
        inputSchema: EditWithAIInputSchema,
        outputSchema: EditWithAIOutputSchema,
    },
    async (input) => {
        const {output} = await editWithAIPrompt(input);
        return output!;
    }
);
