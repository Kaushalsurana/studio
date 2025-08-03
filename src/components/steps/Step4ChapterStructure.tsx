"use client";

import { useState } from 'react';
import { useBookCreation } from '@/hooks/use-book-creation';
import { chapterStructuring } from '@/ai/flows/chapter-structuring';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/common/Spinner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Step4ChapterStructure() {
  const { content, editorialGuidelines, setChapters, chapters, goToStep } = useBookCreation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStructureChapters = async () => {
    setIsLoading(true);
    try {
      const allContent = Object.values(content)
        .filter(item => item.status === 'approved')
        .map(item => item.content)
        .join('\n\n---\n\n');

      if (!allContent) {
        toast({
          title: "No Approved Content",
          description: "Please approve some content in Step 3 before structuring chapters.",
          variant: "destructive",
        });
        return;
      }
      
      const fullGuidelines = `Target Audience: ${editorialGuidelines.targetAudience}. Writing Style: ${editorialGuidelines.writingStyle}`;
      const result = await chapterStructuring({ content: allContent, editorialGuidelines: fullGuidelines });
      setChapters(result.chapters);
      toast({ title: "Success", description: "Content has been structured into chapters." });
    } catch (error) {
      console.error("Error structuring chapters:", error);
      toast({ title: "Error", description: "Failed to structure chapters. Please try again.", variant: 'destructive' });
      setChapters(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-headline text-primary mb-2">Chapter Structuring</h1>
      <p className="text-muted-foreground mb-8">
        Organize your approved content into a logical book structure. The AI will propose chapters based on the content flow.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Structure Your Book</CardTitle>
          <CardDescription>Click the button to automatically group your content into chapters.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleStructureChapters} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? <><Spinner className="mr-2" /> Structuring Chapters...</> : 'Generate Chapter Structure'}
          </Button>
        </CardContent>
      </Card>

      {chapters && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Proposed Book Structure</CardTitle>
            <CardDescription>Review the generated chapters. You can re-order or merge them in a later version.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {chapters.map((chapter, index) => (
                <AccordionItem value={`chapter-${index}`} key={chapter.title}>
                  <AccordionTrigger className="text-xl font-semibold text-left">Chapter {index + 1}: {chapter.title}</AccordionTrigger>
                  <AccordionContent className="p-4 space-y-4">
                    <div>
                      <h3 className="font-bold mb-2">Subtopics:</h3>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        {chapter.subtopics.map(subtopic => <li key={subtopic}>{subtopic}</li>)}
                      </ul>
                    </div>
                    <div className="prose max-w-none font-body whitespace-pre-wrap border-t pt-4">
                      {chapter.content}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" onClick={() => goToStep(3)}>
          Back
        </Button>
        {chapters && (
          <Button size="lg" onClick={() => goToStep(5)}>
            Next: Generate Questions
          </Button>
        )}
      </div>
    </div>
  );
}
