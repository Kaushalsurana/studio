"use client";

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { BookCreationState, BookCreationContextType, ContentItem, EditorialGuidelines } from '@/lib/types';
import type { CurriculumStructuringOutput } from '@/ai/flows/curriculum-structuring';
import type { ChapterStructuringOutput } from '@/ai/flows/chapter-structuring';
import type { QuestionGenerationOutput } from '@/ai/flows/question-generation';

const initialState: BookCreationState = {
  currentStep: 1,
  syllabusText: '',
  curriculum: null,
  editorialGuidelines: { writingStyle: '', targetAudience: '' },
  content: {},
  chapters: null,
  questions: {},
  visuals: {},
};

export const BookCreationContext = createContext<BookCreationContextType | undefined>(undefined);

export function BookCreationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookCreationState>(initialState);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('bookCreationState');
      if (savedState) {
        setState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error("Could not load state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('bookCreationState', JSON.stringify(state));
    } catch (error) {
      console.error("Could not save state to localStorage", error);
    }
  }, [state]);

  const goToStep = useCallback((step: number) => {
    if (step < state.currentStep) {
      setState(prevState => ({ ...prevState, currentStep: step }));
    } else if (step === state.currentStep + 1) {
       setState(prevState => ({ ...prevState, currentStep: step }));
    } else if (step > 1 && state.curriculum) { // Allow jumping to completed steps
      setState(prevState => ({ ...prevState, currentStep: step }));
    }
  }, [state.currentStep, state.curriculum]);

  const reset = useCallback(() => {
    localStorage.removeItem('bookCreationState');
    setState(initialState);
  }, []);

  const setSyllabusText = useCallback((text: string) => {
    setState(prevState => ({ ...prevState, syllabusText: text }));
  }, []);

  const setCurriculum = useCallback((curriculum: CurriculumStructuringOutput | null) => {
    setState(prevState => ({ ...prevState, curriculum }));
  }, []);

  const setEditorialGuidelines = useCallback((guidelines: EditorialGuidelines) => {
    setState(prevState => ({ ...prevState, editorialGuidelines: guidelines }));
  }, []);

  const setContent = useCallback((topic: string, contentItem: ContentItem) => {
    setState(prevState => ({
      ...prevState,
      content: { ...prevState.content, [topic]: contentItem },
    }));
  }, []);
  
  const approveAllContent = useCallback(() => {
    if(!state.curriculum) return false;
    const allTopics = state.curriculum.topics;
    return allTopics.every(topic => state.content[topic]?.status === 'approved');
  }, [state.curriculum, state.content]);

  const setChapters = useCallback((chapters: ChapterStructuringOutput['chapters'] | null) => {
    setState(prevState => ({ ...prevState, chapters }));
  }, []);

  const setQuestions = useCallback((chapterTitle: string, questions: QuestionGenerationOutput['questions']) => {
    setState(prevState => ({
      ...prevState,
      questions: { ...prevState.questions, [chapterTitle]: questions },
    }));
  }, []);

  const setVisuals = useCallback((chapterTitle: string, visualNotes: string) => {
    setState(prevState => ({
      ...prevState,
      visuals: { ...prevState.visuals, [chapterTitle]: visualNotes },
    }));
  }, []);

  const value = {
    ...state,
    goToStep,
    reset,
    setSyllabusText,
    setCurriculum,
    setEditorialGuidelines,
    setContent,
    approveAllContent,
    setChapters,
    setQuestions,
    setVisuals,
  };

  return (
    <BookCreationContext.Provider value={value}>
      {children}
    </BookCreationContext.Provider>
  );
}
