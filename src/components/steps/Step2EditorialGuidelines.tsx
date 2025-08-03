"use client";

import { useBookCreation } from '@/hooks/use-book-creation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function Step2EditorialGuidelines() {
  const { editorialGuidelines, setEditorialGuidelines, goToStep } = useBookCreation();

  const handleNext = () => {
    goToStep(3);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-headline text-primary mb-2">Editorial Guidelines</h1>
      <p className="text-muted-foreground mb-8">
        Define the style and tone for your book. These guidelines will direct the AI during content generation.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Guideline Setup</CardTitle>
          <CardDescription>Provide details about the intended audience and desired writing style.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="target-audience" className="text-lg">Target Audience</Label>
            <p className="text-sm text-muted-foreground">
              Describe the intended readers (e.g., "5th-grade students," "high school biology classes").
            </p>
            <Input
              id="target-audience"
              placeholder="e.g., 5th-grade students"
              value={editorialGuidelines.targetAudience}
              onChange={(e) => setEditorialGuidelines({ ...editorialGuidelines, targetAudience: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="writing-style" className="text-lg">Writing Style</Label>
            <p className="text-sm text-muted-foreground">
              Describe the desired tone and style (e.g., "Engaging and conversational," "Formal and academic," "Use simple language with analogies").
            </p>
            <Textarea
              id="writing-style"
              placeholder="e.g., Engaging, conversational, and uses many real-world examples."
              className="min-h-[150px]"
              value={editorialGuidelines.writingStyle}
              onChange={(e) => setEditorialGuidelines({ ...editorialGuidelines, writingStyle: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" onClick={() => goToStep(1)}>
          Back
        </Button>
        <Button size="lg" onClick={handleNext}>
          Next: Generate Content
        </Button>
      </div>
    </div>
  );
}
