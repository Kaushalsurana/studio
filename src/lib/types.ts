import type { CurriculumStructuringOutput } from "@/ai/flows/curriculum-structuring";
import type { ChapterStructuringOutput } from "@/ai/flows/chapter-structuring";
import type { QuestionGenerationOutput } from "@/ai/flows/question-generation";

export type EditorialGuidelines = {
  writingStyle: string;
  targetAudience: string;
};

export type ContentItem = {
  content: string;
  status: 'pending' | 'generated' | 'approved';
};

export type BookCreationState = {
  currentStep: number;
  syllabusText: string;
  curriculum: CurriculumStructuringOutput | null;
  editorialGuidelines: EditorialGuidelines;
  content: Record<string, ContentItem>;
  chapters: ChapterStructuringOutput['chapters'] | null;
  questions: Record<string, QuestionGenerationOutput['questions']>;
  visuals: Record<string, string>;
};

export type BookCreationContextType = BookCreationState & {
  setSyllabusText: (text: string) => void;
  setCurriculum: (curriculum: CurriculumStructuringOutput | null) => void;
  setEditorialGuidelines: (guidelines: EditorialGuidelines) => void;
  setContent: (topic: string, contentItem: ContentItem) => void;
  setChapters: (chapters: ChapterStructuringOutput['chapters'] | null) => void;
  setQuestions: (chapterTitle: string, questions: QuestionGenerationOutput['questions']) => void;
  setVisuals: (chapterTitle: string, visualNotes: string) => void;
  goToStep: (step: number) => void;
  reset: () => void;
  approveAllContent: () => boolean;
};
