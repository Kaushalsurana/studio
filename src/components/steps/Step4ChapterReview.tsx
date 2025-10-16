"use client";
import { useState } from 'react';
import { useBookCreation } from '@/hooks/use-book-creation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Spinner } from '@/components/common/Spinner';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { refineChapter } from '@/ai/flows/chapter-refinement';

export default function Step4ChapterReview() {
  const { curriculum, content, editorialGuidelines, setChapters, chapters, goToStep } = useBookCreation();
  const [loadingChapter, setLoadingChapter] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRefineChapter = async (chapterTitle: string) => {
    if (!curriculum) return;
    setLoadingChapter(chapterTitle);

    const chapter = curriculum.chapters.find(c => c.chapter_title === chapterTitle);
    if (!chapter) return;

    const subtopicsWithContent = chapter.subtopics.map(st => ({
      subTopic: st,
      content: content[st]?.content || ''
    }));

    try {
      const fullGuidelines = `Target Audience: ${editorialGuidelines.targetAudience}. Writing Style: ${editorialGuidelines.writingStyle}`;
      const result = await refineChapter({
        chapterTitle,
        subtopics: subtopicsWithContent,
        editorialGuidelines: fullGuidelines,
      });

      const newChapterData = {
        title: chapterTitle,
        description: result.refinedContent,
        learningObjectives: [result.summary],
      };

      const existingChapters = chapters || [];
      const updatedChapters = existingChapters.filter(c => c.title !== chapterTitle);
      updatedChapters.push(newChapterData);

      setChapters(updatedChapters);

      toast({ title: "Chapter Refined", description: `"${chapterTitle}" has been polished by the AI.` });
    } catch (error) {
      console.error("Error refining chapter:", error);
      toast({ title: "Refinement Failed", description: "The AI failed to refine the chapter.", variant: "destructive" });
    } finally {
      setLoadingChapter(null);
    }
  };
  
  const isChapterRefined = (chapterTitle: string) => {
    return chapters?.some(c => c.title === chapterTitle && c.description);
  }

  if (!curriculum) {
    return <p>Please complete the curriculum structure first.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-headline text-primary mb-2">Chapter Review & Refinement</h1>
      <p className="text-muted-foreground mb-8">
        Review the raw content for each chapter. When you're ready, use the AI to refine it into a cohesive, book-ready chapter.
      </p>

      <div className="space-y-6">
        {curriculum.chapters.map(chapter => (
          <Card key={chapter.chapter_title}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{chapter.chapter_title}</CardTitle>
                  <CardDescription>Review the generated content for the subtopics below.</CardDescription>
                </div>
                {isChapterRefined(chapter.chapter_title) ? (
                  <div className="flex items-center gap-2 text-green-600 font-semibold p-2 rounded-md bg-green-100">
                    <Check className="h-5 w-5" />
                    <span>Refined</span>
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleRefineChapter(chapter.chapter_title)} 
                    disabled={loadingChapter === chapter.chapter_title}
                  >
                    {loadingChapter === chapter.chapter_title ? (
                      <><Spinner className="mr-2" /> Refining...</>
                    ) : (
                      <><Sparkles className="mr-2" /> Refine Chapter</>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full space-y-2">
                {chapter.subtopics.map(subtopic => (
                  <AccordionItem value={subtopic} key={subtopic}>
                    <AccordionTrigger className="font-semibold text-lg">{subtopic}</AccordionTrigger>
                    <AccordionContent className="prose max-w-none whitespace-pre-wrap">
                      {content[subtopic]?.content || <p className="text-muted-foreground">No content generated yet.</p>}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" onClick={() => goToStep(3)}>
          Back to Content Generation
        </Button>
        <Button size="lg" onClick={() => goToStep(5)} disabled={!chapters || chapters.length === 0}>
          Next: Generate Questions <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
