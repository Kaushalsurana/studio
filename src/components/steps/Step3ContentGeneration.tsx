"use client";
import { useState } from 'react';
import { useBookCreation } from '@/hooks/use-book-creation';
import { generateContent } from '@/ai/flows/content-generation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Spinner } from '@/components/common/Spinner';
import { CheckCircle, Circle, Edit, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Step3ContentGeneration() {
  const { curriculum, editorialGuidelines, content, setContent, goToStep, approveAllContent } = useBookCreation();
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const { toast } = useToast();

  if (!curriculum) {
    return (
      <div className="text-center">
        <p>Please complete Step 1 to structure your curriculum first.</p>
        <Button onClick={() => goToStep(1)} className="mt-4">Go to Step 1</Button>
      </div>
    );
  }

  const allTopics = curriculum.topics;

  const handleGenerateContent = async (topic: string) => {
    setLoadingTopic(topic);
    try {
      const fullGuidelines = `Target Audience: ${editorialGuidelines.targetAudience}. Writing Style: ${editorialGuidelines.writingStyle}`;
      const result = await generateContent({ topic, editorialGuidelines: fullGuidelines });
      setContent(topic, { content: result.content, status: 'generated' });
    } catch (error) {
      console.error(`Error generating content for ${topic}:`, error);
      toast({ title: "Error", description: `Failed to generate content for ${topic}. Please try again.`, variant: 'destructive' });
    } finally {
      setLoadingTopic(null);
    }
  };

  const handleEdit = (topic: string) => {
    setEditingTopic(topic);
    setEditText(content[topic]?.content || '');
  };

  const handleSaveEdit = (topic: string) => {
    setContent(topic, { content: editText, status: 'approved' });
    setEditingTopic(null);
    toast({ title: "Content Saved", description: `Your changes for ${topic} have been saved and approved.` });
  };

  const handleApprove = (topic: string) => {
    const currentContent = content[topic];
    if (currentContent) {
      setContent(topic, { ...currentContent, status: 'approved' });
      toast({ title: "Content Approved", description: `Content for ${topic} has been approved.` });
    }
  };

  const handleNextStep = () => {
    if (approveAllContent()) {
      goToStep(4);
    } else {
      toast({
        title: "Incomplete Content",
        description: "Please generate and approve content for all topics before proceeding.",
        variant: "destructive",
      });
    }
  }

  const getStatusBadge = (status: 'pending' | 'generated' | 'approved' | undefined) => {
    switch (status) {
      case 'approved': return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-1" /> Approved</Badge>;
      case 'generated': return <Badge variant="secondary"><Edit className="w-4 h-4 mr-1" /> Review Needed</Badge>;
      default: return <Badge variant="outline"><Circle className="w-4 h-4 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-headline text-primary mb-2">Content Generation</h1>
      <p className="text-muted-foreground mb-8">
        Generate and review educational content for each topic. You can edit, approve, or regenerate content as needed.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
          <CardDescription>Manage content generation for all topics from your curriculum.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-4">
            {allTopics.map((topic) => {
              const topicContent = content[topic];
              const isGenerating = loadingTopic === topic;
              const isEditing = editingTopic === topic;

              return (
                <AccordionItem value={topic} key={topic} className="border rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 data-[state=open]:bg-secondary/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold">{topic}</span>
                      {getStatusBadge(topicContent?.status)}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6">
                    {isEditing ? (
                      <div>
                        <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-[300px]" />
                        <div className="flex gap-2 mt-2">
                          <Button onClick={() => handleSaveEdit(topic)}>Save & Approve</Button>
                          <Button variant="outline" onClick={() => setEditingTopic(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {isGenerating && (
                          <div className="flex items-center justify-center p-10">
                            <Spinner className="w-8 h-8 mr-2" />
                            <span className="text-muted-foreground">Generating content for "{topic}"...</span>
                          </div>
                        )}
                        {!isGenerating && topicContent?.content && (
                          <div className="prose prose-lg max-w-none font-body whitespace-pre-wrap">{topicContent.content}</div>
                        )}
                        {!isGenerating && !topicContent?.content && (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground mb-4">No content generated for this topic yet.</p>
                            <Button onClick={() => handleGenerateContent(topic)}>Generate Content</Button>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-6 border-t pt-4">
                          {topicContent?.status === 'generated' && (
                            <>
                              <Button onClick={() => handleApprove(topic)}><CheckCircle className="mr-2" />Approve</Button>
                              <Button variant="outline" onClick={() => handleEdit(topic)}><Edit className="mr-2" />Edit</Button>
                            </>
                          )}
                          {topicContent?.status && (
                             <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="bg-red-600 hover:bg-red-700"><RefreshCw className="mr-2" />Regenerate</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will discard the current content for "{topic}" and generate a new version. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleGenerateContent(topic)}>Regenerate</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" onClick={() => goToStep(2)}>
          Back
        </Button>
        <Button size="lg" onClick={handleNextStep}>
          Next: Structure Chapters
        </Button>
      </div>
    </div>
  );
}
