import type { CurriculumStructuringOutput } from './ai/flows/curriculum-structuring';
import type { BookStructuringOutput } from './ai/flows/book-structuring';
import type { QuestionGenerationOutput } from './ai/flows/question-generation';

export interface EditorialGuidelines {
  writingStyle: string;
  targetAudience: string;
}

export interface ContentItem {
  content: string;
  status: 'pending' | 'generated' | 'approved';
}

export interface BookCreationState {
  currentStep: number;
  syllabusText: string;
  curriculum: CurriculumStructuringOutput | null;
  editorialGuidelines: EditorialGuidelines;
  content: Record<string, ContentItem>;
  chapters: BookStructuringOutput['chapters'] | null;
  questions: Record<string, QuestionGenerationOutput['questions']>;
  visuals: Record<string, string>;
}

export interface BookCreationContextType extends BookCreationState {
  goToStep: (step: number) => void;
  reset: () => void;
  setSyllabusText: (text: string) => void;
  setCurriculum: (curriculum: CurriculumStructuringOutput | null) => void;
  setEditorialGuidelines: (guidelines: EditorialGuidelines) => void;
  setContent: (topic: string, contentItem: ContentItem) => void;
  approveAllContent: (allSubtopics: string[]) => boolean;
  setChapters: (chapters: BookStructuringOutput['chapters'] | null) => void;
  setQuestions: (chapterTitle: string, questions: QuestionGenerationOutput['questions']) => void;
  setVisuals: (chapterTitle: string, visualNotes: string) => void;
}
