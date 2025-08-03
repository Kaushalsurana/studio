"use client";

import { useContext } from 'react';
import { BookCreationContext } from '@/context/BookCreationContext';
import { BookCreationContextType } from '@/lib/types';

export const useBookCreation = (): BookCreationContextType => {
  const context = useContext(BookCreationContext);
  if (context === undefined) {
    throw new Error('useBookCreation must be used within a BookCreationProvider');
  }
  return context;
};
