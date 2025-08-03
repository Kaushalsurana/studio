"use client";

import { useState } from 'react';
import { useBookCreation } from '@/hooks/use-book-creation';
import { generateQuestions } from '@/ai/flows/question-generation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/common/Spinner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Step5QuestionGeneration() {
  const { chapters, questions, setQuestions, goToStep } = useBookCreation();
  const [loadingChapter, setLoadingChapter] = useState<string | null>(null);
  const { toast } = useToast();

  if (!chapters) {
    return (
      <div className="text-center">
        <p>Please complete Step 4 to structure your chapters first.</p>
        <Button onClick={() => goToStep(4)} className="mt-4">Go to Step 4</Button>
      </div>
    );
  }

  const handleGenerateQuestions = async (chapterTitle: string, chapterContent: string) => {
    setLoadingChapter(chapterTitle);
    try {
      const result = await generateQuestions({ content: chapterContent, topic: chapterTitle });
      setQuestions(chapterTitle, result.questions);
      toast({ title: "Success", description: `Questions generated for "${chapterTitle}".` });
    } catch (error) {
      console.error(`Error generating questions for ${chapterTitle}:`, error);
      toast({ title: "Error", description: `Failed to generate questions for "${chapterTitle}". Please try again.`, variant: 'destructive' });
    } finally {
      setLoadingChapter(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-headline text-primary mb-2">Practice Questions</h1>
      <p className="text-muted-foreground mb-8">
        Generate practice questions and answer keys for each chapter to help reinforce learning.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Question Generation</CardTitle>
          <CardDescription>For each chapter, generate a set of relevant questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-4">
            {chapters.map((chapter) => {
              const chapterQuestions = questions[chapter.title];
              const isLoading = loadingChapter === chapter.title;

              return (
                <AccordionItem value={chapter.title} key={chapter.title} className="border rounded-lg">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 data-[state=open]:bg-secondary/50 text-left">
                    <span className="text-lg font-semibold">{chapter.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="p-6">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-10">
                        <Spinner className="w-8 h-8 mr-2" />
                        <span className="text-muted-foreground">Generating questions...</span>
                      </div>
                    ) : chapterQuestions ? (
                      <div className="space-y-4">
                        {chapterQuestions.map((qa, index) => (
                          <div key={index} className="p-4 border rounded-md bg-secondary/30">
                            <p className="font-semibold">Q: {qa.question}</p>
                            <p className="text-muted-foreground mt-1">A: {qa.answer}</p>
                          </div>
                        ))}
                         <Button
                            variant="outline"
                            onClick={() => handleGenerateQuestions(chapter.title, chapter.content)}
                            disabled={isLoading}
                            className="mt-4"
                          >
                            Regenerate Questions
                          </Button>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground mb-4">No questions generated for this chapter yet.</p>
                        <Button
                          onClick={() => handleGenerateQuestions(chapter.title, chapter.content)}
                          disabled={isLoading}
                        >
                          Generate Questions
                        </Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" onClick={() => goToStep(4)}>
          Back
        </Button>
        <Button size="lg" onClick={() => goToStep(6)}>
          Next: Plan Visuals
        </Button>
      </div>
    </div>
  );
}
