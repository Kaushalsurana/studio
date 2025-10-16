"use client";

import { BookCreationProvider } from '@/context/BookCreationContext';
import { useBookCreation } from '@/hooks/use-book-creation';
import { cn } from '@/lib/utils';
import { BookText, BotMessageSquare, PencilRuler, ClipboardEdit, BrainCircuit, FileImage, Download, FileText } from 'lucide-react';
import Step1CurriculumStructure from '@/components/steps/Step1CurriculumStructure';
import Step2EditorialGuidelines from '@/components/steps/Step2EditorialGuidelines';
import Step3ContentGeneration from '@/components/steps/Step3ContentGeneration';
import Step4ChapterReview from '@/components/steps/Step4ChapterReview';
import Step5QuestionGeneration from '@/components/steps/Step5QuestionGeneration';
import Step6VisualPlanning from '@/components/steps/Step6VisualPlanning';
import Step7Export from '@/components/steps/Step7Export';
import { Button } from '@/components/ui/button';

const steps = [
  { id: 1, name: 'Curriculum Structure', icon: BotMessageSquare },
  { id: 2, name: 'Editorial Guidelines', icon: ClipboardEdit },
  { id: 3, name: 'Content Generation', icon: BrainCircuit },
  { id: 4, name: 'Chapter Review', icon: BookText },
  { id: 5, name: 'Practice Questions', icon: PencilRuler },
  { id: 6, name: 'Visual Planning', icon: FileImage },
  { id: 7, name: 'Review & Export', icon: Download },
];

function AppContent() {
  const { currentStep, goToStep, reset } = useBookCreation();

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1CurriculumStructure />;
      case 2: return <Step2EditorialGuidelines />;
      case 3: return <Step3ContentGeneration />;
      case 4: return <Step4ChapterReview />;
      case 5: return <Step5QuestionGeneration />;
      case 6: return <Step6VisualPlanning />;
      case 7: return <Step7Export />;
      default: return <Step1CurriculumStructure />;
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <aside className="w-72 bg-secondary/50 p-6 border-r flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-headline text-primary">Syllabus to Book</h1>
          </div>
          <nav className="flex flex-col gap-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-primary/10 text-secondary-foreground",
                  currentStep < step.id && "opacity-50 cursor-not-allowed"
                )}
                disabled={currentStep < step.id}
              >
                <step.icon className="w-5 h-5" />
                <span className="font-medium">{step.name}</span>
              </button>
            ))}
          </nav>
        </div>
        <Button variant="outline" onClick={reset}>Start Over</Button>
      </aside>
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {renderStep()}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <BookCreationProvider>
      <AppContent />
    </BookCreationProvider>
  );
}
