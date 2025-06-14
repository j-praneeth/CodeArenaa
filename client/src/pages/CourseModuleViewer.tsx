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
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Fetch course data
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course');
      return response.json() as Promise<Course>;
    }
  });

  // Fetch course modules
  const { data: modules, isLoading: modulesLoading } = useQuery({
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
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch progress');
      }
      return response.json() as Promise<CourseProgress>;
    },
    retry: false
  });

  // Get current module with proper type safety
  const modulesList = Array.isArray(modules) ? modules : [];
  
  // If no moduleId provided, redirect to first module
  if (!moduleId && modulesList.length > 0) {
    const firstModule = modulesList[0];
    setLocation(`/courses/${courseId}/modules/${firstModule.id}`);
    return null;
  }
  
  const currentModuleIndex = modulesList.findIndex(m => m.id.toString() === moduleId);
  const currentModule = currentModuleIndex >= 0 ? modulesList[currentModuleIndex] : (modulesList.length > 0 ? modulesList[0] : undefined);

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
    if (currentModuleIndex < modulesList.length - 1) {
      navigateToModule(modulesList[currentModuleIndex + 1]);
    }
  };

  const navigateToPreviousModule = () => {
    if (currentModuleIndex > 0) {
      navigateToModule(modulesList[currentModuleIndex - 1]);
    }
  };

  // Execute code mutation
  const executeMutation = useMutation({
    mutationFn: async ({ code, language }: { code: string; language: string }) => {
      setIsExecuting(true);
      const response = await fetch('/api/modules/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      if (!response.ok) throw new Error('Execution failed');
      return response.json();
    },
    onSuccess: (data) => {
      setOutput(data.output || data.error || 'No output');
      setIsExecuting(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Execution failed',
        description: error.message,
        variant: 'destructive'
      });
      setIsExecuting(false);
    }
  });

  // Mark module complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (!currentModule) throw new Error('No module selected');
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

  // Loading states
  if (modulesLoading || courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!currentModule || modulesList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">No module found</p>
          <Button 
            onClick={() => setLocation('/courses')}
            className="mt-4"
          >
            Back to Courses
          </Button>
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
              <h1 className="text-xl font-bold">{course?.title || 'Course'}</h1>
              <p className="text-sm text-muted-foreground">{currentModule?.title || 'Module'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {progress && (
              <div className="flex items-center space-x-2">
                <span className="text-sm">Progress:</span>
                <Progress value={progress?.enrollment?.progress || 0} className="w-24" />
                <span className="text-sm">{progress?.enrollment?.progress || 0}%</span>
              </div>
            )}
            <Button
              onClick={() => markCompleteMutation.mutate()}
              disabled={markCompleteMutation.isPending || 
                (progress?.enrollment?.completedModules?.includes(currentModule.id) ?? false)}
              size="sm"
              variant={progress?.enrollment?.completedModules?.includes(currentModule.id) ? "outline" : "default"}
            >
              {progress?.enrollment?.completedModules?.includes(currentModule.id) ? (
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
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="h-full border-r">
              <div className="border-b bg-muted/50 p-3">
                <h3 className="font-semibold text-sm">Course Modules</h3>
                <ScrollArea className="h-24 mt-2">
                  <div className="space-y-1">
                    {modulesList.map((module) => (
                      <div
                        key={module.id}
                        className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                          module.id === currentModule?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => navigateToModule(module)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{module.title}</span>
                          {progress?.enrollment?.completedModules?.includes(module.id) && (
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Content */}
          <ResizablePanel defaultSize={75}>
            <div className="h-full p-6">
              <Tabs defaultValue="content" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="video">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="code">
                    <Code className="h-4 w-4 mr-2" />
                    Code
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="flex-1 mt-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>{currentModule.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[calc(100vh-300px)]">
                        <div className="prose max-w-none">
                          {currentModule.description && (
                            <p className="text-muted-foreground mb-4">{currentModule.description}</p>
                          )}
                          {currentModule.textContent && (
                            <div 
                              className="space-y-4"
                              dangerouslySetInnerHTML={{ __html: currentModule.textContent }}
                            />
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="video" className="flex-1 mt-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Video Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentModule.videoUrl ? (
                        <div className="aspect-video">
                          <iframe
                            src={currentModule.videoUrl}
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                          <p className="text-muted-foreground">No video available for this module</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="code" className="flex-1 mt-4">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Code Editor</CardTitle>
                        <div className="flex items-center space-x-2">
                          {currentModule.language && (
                            <Badge variant="secondary">{currentModule.language}</Badge>
                          )}
                          <Button
                            onClick={() => executeMutation.mutate({ 
                              code, 
                              language: currentModule.language || 'javascript' 
                            })}
                            disabled={isExecuting}
                            size="sm"
                          >
                            {isExecuting ? 'Running...' : 'Run Code'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <MonacoEditor
                          height="400px"
                          language={currentModule.language || 'javascript'}
                          value={code}
                          onChange={(value) => setCode(value || '')}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            automaticLayout: true
                          }}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Output</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px]">
                          <pre className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
                            {output || 'Run code to see output...'}
                          </pre>
                        </ScrollArea>
                        {currentModule.expectedOutput && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Expected Output:</h4>
                            <pre className="text-sm bg-green-50 border border-green-200 p-3 rounded-md whitespace-pre-wrap">
                              {currentModule.expectedOutput}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Footer Navigation */}
      <div className="border-t bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={navigateToPreviousModule}
            disabled={currentModuleIndex === 0}
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Module
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Module {currentModuleIndex + 1} of {modulesList.length}
          </span>
          
          <Button
            onClick={navigateToNextModule}
            disabled={currentModuleIndex === modulesList.length - 1}
          >
            Next Module
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}