"use client";

import { useState } from 'react';
import { useBookCreation } from '@/hooks/use-book-creation';
import { curriculumStructuring } from '@/ai/flows/curriculum-structuring';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Spinner } from '@/components/common/Spinner';

export default function Step1CurriculumStructure() {
  const { syllabusText, setSyllabusText, setCurriculum, curriculum, goToStep } = useBookCreation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStructureSyllabus = async () => {
    if (!syllabusText.trim()) {
      toast({ title: "Syllabus is empty", description: "Please paste your syllabus text to continue.", variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await curriculumStructuring({ syllabusText });
      setCurriculum(result);
    } catch (error) {
      console.error("Error structuring curriculum:", error);
      toast({ title: "Error", description: "Failed to structure the curriculum. Please try again.", variant: 'destructive' });
      setCurriculum(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-headline text-primary mb-2">Curriculum Structuring</h1>
      <p className="text-muted-foreground mb-8">
        Paste your science syllabus below. Our AI will extract and organize the topics and subtopics for you.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Syllabus Input</CardTitle>
          <CardDescription>Enter the full text of your syllabus here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste syllabus text here..."
            className="min-h-[250px] font-body text-base"
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleStructureSyllabus} disabled={isLoading} className="mt-4 w-full md:w-auto">
            {isLoading ? <><Spinner className="mr-2" /> Structuring...</> : 'Structure Syllabus'}
          </Button>
        </CardContent>
      </Card>

      {curriculum && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Extracted Curriculum</CardTitle>
            <CardDescription>Review the topics and subtopics extracted from your syllabus.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {curriculum.topics.map((topic, index) => (
                <AccordionItem value={`item-${index}`} key={topic}>
                  <AccordionTrigger className="text-lg font-semibold">{topic}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      {curriculum.subtopics.find(item => item.topic === topic)?.subtopics?.map(subtopic => (
                        <li key={subtopic}>{subtopic}</li>
                      )) ?? <li>No subtopics found.</li>}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {curriculum && (
        <div className="mt-8 flex justify-end">
          <Button size="lg" onClick={() => goToStep(2)}>
            Next: Set Editorial Guidelines
          </Button>
        </div>
      )}
    </div>
  );
}
