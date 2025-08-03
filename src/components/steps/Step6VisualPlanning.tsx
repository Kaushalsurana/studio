"use client";

import { useBookCreation } from '@/hooks/use-book-creation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Step6VisualPlanning() {
  const { chapters, visuals, setVisuals, goToStep } = useBookCreation();

  if (!chapters) {
    return (
      <div className="text-center">
        <p>Please complete Step 4 to structure your chapters first.</p>
        <Button onClick={() => goToStep(4)} className="mt-4">Go to Step 4</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-headline text-primary mb-2">Visual Planning</h1>
      <p className="text-muted-foreground mb-8">
        Plan the visual elements for your textbook. For each chapter, list the diagrams, illustrations, or photos needed.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Asset Requirements</CardTitle>
          <CardDescription>Detail the visual assets needed for each chapter to guide your design team.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-4">
            {chapters.map((chapter) => (
              <AccordionItem value={chapter.title} key={chapter.title} className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 data-[state=open]:bg-secondary/50 text-left">
                  <span className="text-lg font-semibold">{chapter.title}</span>
                </AccordionTrigger>
                <AccordionContent className="p-6">
                  <div className="space-y-2">
                    <Label htmlFor={`visuals-${chapter.title}`} className="font-semibold">
                      Required Diagrams & Illustrations
                    </Label>
                    <Textarea
                      id={`visuals-${chapter.title}`}
                      placeholder={`e.g., \n- A diagram of the water cycle.\n- An illustration of a plant cell with labels.`}
                      className="min-h-[150px]"
                      value={visuals[chapter.title] || ''}
                      onChange={(e) => setVisuals(chapter.title, e.target.value)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" onClick={() => goToStep(5)}>
          Back
        </Button>
        <Button size="lg" onClick={() => goToStep(7)}>
          Next: Review & Export
        </Button>
      </div>
    </div>
  );
}
