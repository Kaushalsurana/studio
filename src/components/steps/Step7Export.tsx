"use client";

import { useBookCreation } from '@/hooks/use-book-creation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Step7Export() {
  const { chapters, questions, visuals, goToStep } = useBookCreation();

  if (!chapters) {
    return (
      <div className="text-center">
        <p>Please complete the previous steps to generate book content.</p>
        <Button onClick={() => goToStep(1)} className="mt-4">Start Over</Button>
      </div>
    );
  }

  const generateMarkdown = () => {
    let markdown = `# Your New Science Textbook\n\n`;

    chapters.forEach((chapter, index) => {
      markdown += `## Chapter ${index + 1}: ${chapter.title}\n\n`;
      markdown += `### Subtopics\n\n`;
      chapter.subtopics.forEach(sub => {
        markdown += `- ${sub}\n`;
      });
      markdown += `\n### Content\n\n${chapter.content}\n\n`;

      const chapterQuestions = questions[chapter.title];
      if (chapterQuestions && chapterQuestions.length > 0) {
        markdown += `### Practice Questions\n\n`;
        chapterQuestions.forEach((qa, q_index) => {
          markdown += `${q_index + 1}. **Q:** ${qa.question}\n`;
          markdown += `   **A:** ${qa.answer}\n\n`;
        });
      }

      const chapterVisuals = visuals[chapter.title];
      if (chapterVisuals) {
        markdown += `### Visual Planning Notes\n\n${chapterVisuals}\n\n`;
      }
      markdown += '---\n\n';
    });

    return markdown;
  };
  
  const generateHtml = () => {
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your New Science Textbook</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; padding: 2em; }
          h1, h2, h3 { color: #008080; }
          pre { background-color: #f0f0f0; padding: 1em; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>Your New Science Textbook</h1>
    `;

    chapters.forEach((chapter, index) => {
        html += `<h2>Chapter ${index + 1}: ${chapter.title}</h2>`;
        html += `<h3>Subtopics</h3><ul>`;
        chapter.subtopics.forEach(sub => {
            html += `<li>${sub}</li>`;
        });
        html += `</ul>`;
        html += `<h3>Content</h3><div>${chapter.content.replace(/\n/g, '<br>')}</div>`;

        const chapterQuestions = questions[chapter.title];
        if (chapterQuestions && chapterQuestions.length > 0) {
            html += `<h3>Practice Questions</h3>`;
            chapterQuestions.forEach((qa) => {
                html += `<p><strong>Q:</strong> ${qa.question}<br><strong>A:</strong> ${qa.answer}</p>`;
            });
        }

        const chapterVisuals = visuals[chapter.title];
        if (chapterVisuals) {
            html += `<h3>Visual Planning Notes</h3><pre>${chapterVisuals}</pre>`;
        }
        html += '<hr>';
    });

    html += `</body></html>`;
    return html;
  };

  const generateText = () => {
    let text = `Your New Science Textbook\n\n`;
    chapters.forEach((chapter, index) => {
      text += `Chapter ${index + 1}: ${chapter.title}\n\n`;
      text += `Subtopics:\n`;
      chapter.subtopics.forEach(sub => { text += `- ${sub}\n`; });
      text += `\nContent:\n${chapter.content}\n\n`;

      const chapterQuestions = questions[chapter.title];
      if (chapterQuestions && chapterQuestions.length > 0) {
        text += `Practice Questions:\n`;
        chapterQuestions.forEach(qa => { text += `Q: ${qa.question}\nA: ${qa.answer}\n\n`; });
      }

      const chapterVisuals = visuals[chapter.title];
      if (chapterVisuals) {
        text += `Visual Planning Notes:\n${chapterVisuals}\n\n`;
      }
      text += '----------------------------------------\n\n';
    });
    return text;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-headline text-primary mb-2">Review & Export</h1>
      <p className="text-muted-foreground mb-8">
        Your book is complete! Review the final structure below and export it in your desired format.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Export Your Textbook</CardTitle>
          <CardDescription>Download the complete book as a Markdown, HTML, or plain text file.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={() => downloadFile(generateMarkdown(), 'textbook.md', 'text/markdown')}>Export as Markdown</Button>
          <Button onClick={() => downloadFile(generateHtml(), 'textbook.html', 'text/html')}>Export as HTML</Button>
          <Button onClick={() => downloadFile(generateText(), 'textbook.txt', 'text/plain')}>Export as Text</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Final Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-4">
            {chapters.map((chapter) => (
              <AccordionItem value={chapter.title} key={chapter.title} className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 data-[state=open]:bg-secondary/50 text-left">
                  <span className="text-lg font-semibold">{chapter.title}</span>
                </AccordionTrigger>
                <AccordionContent className="p-6 space-y-6">
                  <div className="prose max-w-none font-body whitespace-pre-wrap">{chapter.content}</div>
                  {questions[chapter.title] && (
                    <div className="border-t pt-4">
                      <h4 className="font-bold text-md mb-2">Practice Questions</h4>
                      <div className="space-y-2">
                        {questions[chapter.title].map((qa, index) => (
                          <div key={index} className="text-sm">
                            <p><strong>Q:</strong> {qa.question}</p>
                            <p className="text-muted-foreground"><strong>A:</strong> {qa.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" onClick={() => goToStep(6)}>
          Back
        </Button>
      </div>
    </div>
  );
}
