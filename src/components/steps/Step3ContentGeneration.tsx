"use client";
import { useState } from 'react';
import { useBookCreation } from '@/hooks/use-book-creation';
import { generateSubTopicContent, editWithAI } from '@/ai/flows/content-generation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Spinner } from '@/components/common/Spinner';
import { CheckCircle, Circle, Edit, RefreshCw, Sparkles } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Step3ContentGeneration() {
  const { curriculum, editorialGuidelines, content, setContent, goToStep, approveAllContent } = useBookCreation();
  const [loadingSubtopic, setLoadingSubtopic] = useState<string | null>(null);
  const [editingSubtopic, setEditingSubtopic] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [aiEditComment, setAiEditComment] = useState('');
  const [isAiEditModalOpen, setIsAiEditModalOpen] = useState(false);
  const [subtopicForAiEdit, setSubtopicForAiEdit] = useState<string | null>(null);

  const { toast } = useToast();

  if (!curriculum) {
    return (
      <div className="text-center">
        <p>Please complete Step 1 to structure your curriculum first.</p>
        <Button onClick={() => goToStep(1)} className="mt-4">Go to Step 1</Button>
      </div>
    );
  }

  const handleGenerateContent = async (chapterTitle: string, subtopic: string, subtopicIndex: number) => {
    setLoadingSubtopic(subtopic);
    try {
      const fullGuidelines = `Target Audience: ${editorialGuidelines.targetAudience}. Writing Style: ${editorialGuidelines.writingStyle}`;
      
      const chapter = curriculum.chapters.find(c => c.chapter_title === chapterTitle);
      if(!chapter) return;

      const previousSubTopics = chapter.subtopics.slice(0, subtopicIndex).map(st => ({
        subTopic: st,
        content: content[st]?.content || ''
      }));

      const result = await generateSubTopicContent({ 
        chapterTitle,
        subTopic: subtopic, 
        previousSubTopics,
        editorialGuidelines: fullGuidelines 
      });
      setContent(subtopic, { content: result.content, status: 'generated' });
    } catch (error) {
      console.error(`Error generating content for ${subtopic}:`, error);
      toast({ title: "Error", description: `Failed to generate content for ${subtopic}. Please try again.`, variant: 'destructive' });
    } finally {
      setLoadingSubtopic(null);
    }
  };

  const handleEdit = (subtopic: string) => {
    setEditingSubtopic(subtopic);
    setEditText(content[subtopic]?.content || '');
  };

  const handleSaveEdit = (subtopic: string) => {
    setContent(subtopic, { content: editText, status: 'approved' });
    setEditingSubtopic(null);
    toast({ title: "Content Saved", description: `Your changes for ${subtopic} have been saved and approved.` });
  };

  const handleApprove = (subtopic: string) => {
    const currentContent = content[subtopic];
    if (currentContent) {
      setContent(subtopic, { ...currentContent, status: 'approved' });
      toast({ title: "Content Approved", description: `Content for ${subtopic} has been approved.` });
    }
  };

  const handleNextStep = () => {
    const allSubtopics = curriculum.chapters.flatMap(chapter => chapter.subtopics);
    if (approveAllContent(allSubtopics)) {
      goToStep(4);
    } else {
      toast({
        title: "Incomplete Content",
        description: "Please generate and approve content for all subtopics before proceeding.",
        variant: "destructive",
      });
    }
  }

  const handleAiEdit = async () => {
    if (!subtopicForAiEdit || !aiEditComment) return;
    
    setLoadingSubtopic(subtopicForAiEdit);
    setIsAiEditModalOpen(false);

    try {
        const originalContent = content[subtopicForAiEdit]?.content;
        if (!originalContent) {
            toast({ title: "Error", description: "No content to edit.", variant: 'destructive' });
            return;
        }

        const result = await editWithAI({ originalContent, userComment: aiEditComment });
        setContent(subtopicForAiEdit, { content: result.editedContent, status: 'generated' });
        toast({ title: "Content Edited", description: "The AI has revised the content based on your comment." });
    } catch (error) {
        console.error(`Error editing content for ${subtopicForAiEdit}:`, error);
        toast({ title: "Error", description: `Failed to edit content for ${subtopicForAiEdit}. Please try again.`, variant: 'destructive' });
    } finally {
        setLoadingSubtopic(null);
        setSubtopicForAiEdit(null);
        setAiEditComment('');
    }
  }

  const openAiEditModal = (subtopic: string) => {
    setSubtopicForAiEdit(subtopic);
    setIsAiEditModalOpen(true);
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
        Generate and review educational content for each subtopic. You can edit, approve, or regenerate content as needed.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Chapters</CardTitle>
          <CardDescription>Manage content generation for all subtopics within each chapter.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-4">
            {curriculum.chapters.map((chapter) => (
              <AccordionItem value={chapter.chapter_title} key={chapter.chapter_title} className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 data-[state=open]:bg-secondary/50 flex justify-between items-center">
                  <span className="text-xl font-bold">{chapter.chapter_title}</span>
                </AccordionTrigger>
                <AccordionContent className="p-6">
                  <Accordion type="multiple" className="w-full space-y-2">
                    {chapter.subtopics.map((subtopic, subtopicIndex) => {
                      const subtopicContent = content[subtopic];
                      const isGenerating = loadingSubtopic === subtopic;
                      const isEditing = editingSubtopic === subtopic;

                      return (
                        <AccordionItem value={subtopic} key={subtopic} className="border rounded-md overflow-hidden">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/25 data-[state=open]:bg-secondary/25 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{subtopic}</span>
                              {getStatusBadge(subtopicContent?.status)}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4">
                            {isEditing ? (
                              <div>
                                <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-[200px]" />
                                <div className="flex gap-2 mt-2">
                                  <Button onClick={() => handleSaveEdit(subtopic)}>Save & Approve</Button>
                                  <Button variant="outline" onClick={() => setEditingSubtopic(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {isGenerating && (
                                  <div className="flex items-center justify-center p-8">
                                    <Spinner className="w-6 h-6 mr-2" />
                                    <span className="text-muted-foreground">Generating content for "{subtopic}"...</span>
                                  </div>
                                )}
                                {!isGenerating && subtopicContent?.content && (
                                  <div className="prose max-w-none font-body whitespace-pre-wrap">{subtopicContent.content}</div>
                                )}
                                {!isGenerating && !subtopicContent?.content && (
                                  <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">No content generated for this subtopic yet.</p>
                                    <Button onClick={() => handleGenerateContent(chapter.chapter_title, subtopic, subtopicIndex)}>Generate Content</Button>
                                  </div>
                                )}
                                
                                <div className="flex gap-2 mt-4 border-t pt-3">
                                  {subtopicContent?.status === 'generated' && (
                                    <>
                                      <Button size="sm" onClick={() => handleApprove(subtopic)}><CheckCircle className="mr-1.5 h-4 w-4" />Approve</Button>
                                      <Button size="sm" variant="outline" onClick={() => handleEdit(subtopic)}><Edit className="mr-1.5 h-4 w-4" />Edit Manually</Button>
                                      <Button size="sm" variant="outline" onClick={() => openAiEditModal(subtopic)}><Sparkles className="mr-1.5 h-4 w-4" />Edit with AI</Button>
                                    </>
                                  )}
                                  {subtopicContent?.status && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700"><RefreshCw className="mr-1.5 h-4 w-4" />Regenerate</Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will discard the current content for "{subtopic}" and generate a new version. This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleGenerateContent(chapter.chapter_title, subtopic, subtopicIndex)}>Regenerate</AlertDialogAction>
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
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Dialog open={isAiEditModalOpen} onOpenChange={setIsAiEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit with AI</DialogTitle>
            <DialogDescription>
              Tell the AI what you want to change about the content for "{subtopicForAiEdit}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ai-comment" className="text-right">
                Comment
              </Label>
              <Input
                id="ai-comment"
                value={aiEditComment}
                onChange={(e) => setAiEditComment(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 'Make it more concise' or 'Remove the bullet points'"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAiEdit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" onClick={() => goToStep(2)}>
          Back
        </Button>
        <Button size="lg" onClick={handleNextStep}>
          Next: Chapter Review
        </Button>
      </div>
    </div>
  );
}
