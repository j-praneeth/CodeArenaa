import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, BookOpen, Code, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { MonacoEditor } from '@/components/MonacoEditor';
import { useToast } from '@/hooks/use-toast';

interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  order: number;
  textContent?: string;
  videoUrl?: string;
  codeExample?: string;
  language?: string;
  expectedOutput?: string;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: number;
  title: string;
  description?: string;
  isPublic: boolean;
}

interface CourseProgress {
  enrollment: {
    id: number;
    courseId: number;
    userId: string;
    completedModules: number[];
    progress: number;
  };
  completedModules: CourseModule[];
  totalModules: number;
}

export default function CourseModuleViewer() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'video'>('text');

  // Fetch course data
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course');
      return response.json() as Promise<Course>;
    }
  });

  // Fetch course modules
  const { data: modules = [] } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/modules`);
      if (!response.ok) throw new Error('Failed to fetch modules');
      return response.json() as Promise<CourseModule[]>;
    }
  });

  // Fetch course progress
  const { data: progress } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/progress`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json() as Promise<CourseProgress>;
    }
  });

  // Get current module
  const currentModuleIndex = modules.findIndex(m => m.id.toString() === moduleId);
  const currentModule = currentModuleIndex >= 0 ? modules[currentModuleIndex] : modules[0];

  // Update code when module changes
  useEffect(() => {
    if (currentModule?.codeExample) {
      setCode(currentModule.codeExample);
    }
    setOutput('');
  }, [currentModule]);

  // Navigate to specific module
  const navigateToModule = (module: CourseModule) => {
    setLocation(`/courses/${courseId}/modules/${module.id}`);
  };

  // Navigate to next/previous module
  const navigateToNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      navigateToModule(modules[currentModuleIndex + 1]);
    }
  };

  const navigateToPreviousModule = () => {
    if (currentModuleIndex > 0) {
      navigateToModule(modules[currentModuleIndex - 1]);
    }
  };

  // Execute code mutation
  const executeCodeMutation = useMutation({
    mutationFn: async ({ code, language }: { code: string; language: string }) => {
      const response = await fetch('/api/modules/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      if (!response.ok) throw new Error('Failed to execute code');
      return response.json();
    },
    onSuccess: (result) => {
      setOutput(result.error || result.output || 'No output');
      if (result.success) {
        toast({ title: 'Code executed successfully!' });
      }
    },
    onError: () => {
      toast({ 
        title: 'Execution failed', 
        description: 'Failed to execute code',
        variant: 'destructive' 
      });
    },
    onSettled: () => {
      setIsExecuting(false);
    }
  });

  // Mark module complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/modules/${currentModule.id}/complete`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to mark complete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      toast({ title: 'Module marked as complete!' });
    },
    onError: () => {
      toast({ 
        title: 'Failed to mark complete',
        variant: 'destructive' 
      });
    }
  });

  const executeCode = () => {
    if (!currentModule?.language || !code.trim()) return;
    
    setIsExecuting(true);
    executeCodeMutation.mutate({
      code: code.trim(),
      language: currentModule.language
    });
  };

  const isModuleComplete = progress?.enrollment.completedModules.includes(currentModule?.id || 0);

  if (!course || !currentModule) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Course...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/courses')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Courses
            </Button>
            <div>
              <h1 className="text-xl font-bold">{course.title}</h1>
              <p className="text-sm text-muted-foreground">{currentModule.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {progress && (
              <div className="flex items-center space-x-2">
                <span className="text-sm">Progress:</span>
                <Progress value={progress.enrollment.progress} className="w-24" />
                <span className="text-sm">{progress.enrollment.progress}%</span>
              </div>
            )}
            <Button
              onClick={() => markCompleteMutation.mutate()}
              disabled={isModuleComplete || markCompleteMutation.isPending}
              variant={isModuleComplete ? "outline" : "default"}
            >
              {isModuleComplete ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </>
              ) : (
                'Mark Complete'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Course Content */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col">
              {/* Module Navigation */}
              <div className="border-b bg-muted/50 p-4">
                <h3 className="font-semibold mb-3">Course Modules</h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {modules.map((module) => (
                      <div
                        key={module.id}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          module.id === currentModule.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => navigateToModule(module)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{module.title}</span>
                          {progress?.enrollment.completedModules.includes(module.id) && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-4 overflow-hidden">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'text' | 'video')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text" className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Reading</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="video" 
                      disabled={!currentModule.videoUrl}
                      className="flex items-center space-x-2"
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span>Video</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <Card>
                        <CardHeader>
                          <CardTitle>{currentModule.title}</CardTitle>
                          {currentModule.description && (
                            <p className="text-muted-foreground">{currentModule.description}</p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="prose dark:prose-invert max-w-none">
                            {currentModule.textContent ? (
                              <div dangerouslySetInnerHTML={{ __html: currentModule.textContent }} />
                            ) : (
                              <p>No text content available for this module.</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="video" className="mt-4">
                    {currentModule.videoUrl ? (
                      <div className="aspect-video">
                        <iframe
                          src={currentModule.videoUrl.replace('watch?v=', 'embed/')}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                          title={currentModule.title}
                        />
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                          No video content available for this module.
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - Code Editor and Output */}
          <ResizablePanel defaultSize={70} minSize={40}>
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor */}
              <ResizablePanel defaultSize={75} minSize={30}>
                <div className="h-full flex flex-col">
                  <div className="bg-muted/50 border-b px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span className="font-medium">Code Editor</span>
                      {currentModule.language && (
                        <Badge variant="secondary">{currentModule.language}</Badge>
                      )}
                    </div>
                    <Button
                      onClick={executeCode}
                      disabled={isExecuting || !code.trim() || !currentModule.language}
                      size="sm"
                    >
                      {isExecuting ? 'Running...' : 'Run Code'}
                    </Button>
                  </div>
                  <div className="flex-1">
                    <MonacoEditor
                      value={code}
                      onChange={setCode}
                      language={currentModule.language || 'javascript'}
                      height="100%"
                    />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Output Panel */}
              <ResizablePanel defaultSize={25} minSize={15}>
                <div className="h-full flex flex-col">
                  <div className="bg-muted/50 border-b px-4 py-2">
                    <span className="font-medium">Output</span>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {output || 'Run your code to see the output here...'}
                    </pre>
                    {currentModule.expectedOutput && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <p className="text-sm font-medium mb-2">Expected Output:</p>
                          <pre className="text-sm font-mono whitespace-pre-wrap text-muted-foreground">
                            {currentModule.expectedOutput}
                          </pre>
                        </div>
                      </>
                    )}
                  </ScrollArea>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Navigation Footer */}
      <div className="border-t bg-background px-6 py-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={navigateToPreviousModule}
            disabled={currentModuleIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Module
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Module {currentModuleIndex + 1} of {modules.length}
          </span>
          
          <Button
            onClick={navigateToNextModule}
            disabled={currentModuleIndex === modules.length - 1}
          >
            Next Module
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}