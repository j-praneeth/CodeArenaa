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
import { PlayCircle, BookOpen, Code, CheckCircle, ChevronLeft, ChevronRight, Menu, X, Clock, Award, BarChart3 } from 'lucide-react';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/progress`);
      if (!response.ok) throw new Error('Failed to fetch progress');
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
  }, [currentModule]);

  // Navigation functions
  const navigateToModule = (module: CourseModule) => {
    setLocation(`/courses/${courseId}/modules/${module.id}`);
  };

  const navigateToPreviousModule = () => {
    if (currentModuleIndex > 0) {
      const prevModule = modulesList[currentModuleIndex - 1];
      navigateToModule(prevModule);
    }
  };

  const navigateToNextModule = () => {
    if (currentModuleIndex < modulesList.length - 1) {
      const nextModule = modulesList[currentModuleIndex + 1];
      navigateToModule(nextModule);
    }
  };

  // Mark module complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/modules/${currentModule?.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSpent: 0 })
      });
      if (!response.ok) throw new Error('Failed to mark module complete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      toast({ title: 'Module completed!' });
    },
    onError: (error: Error) => {
      console.error('Error marking module complete:', error);
      toast({
        title: 'Failed to mark module complete',
        variant: 'destructive'
      });
    }
  });

  // Execute code mutation
  const executeCodeMutation = useMutation({
    mutationFn: async () => {
      setIsExecuting(true);
      const response = await fetch('/api/modules/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: currentModule?.language || 'javascript'
        })
      });
      if (!response.ok) throw new Error('Failed to execute code');
      return response.json();
    },
    onSuccess: (data) => {
      setOutput(data.output || '');
      setIsExecuting(false);
    },
    onError: (error: Error) => {
      setOutput(`Error: ${error.message}`);
      setIsExecuting(false);
    }
  });

  if (courseLoading || modulesLoading || progressLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course || !currentModule) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Module Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested module could not be found.
          </p>
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
      <div className="flex-1 flex relative">
        {/* Collapsible Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-12' : 'w-80'} transition-all duration-300 ease-in-out border-r bg-gradient-to-b from-background to-muted/20 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="border-b p-4 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Course Modules</h3>
                  <p className="text-xs text-muted-foreground">{modulesList.length} modules</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0"
            >
              {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>

          {/* Course Progress Overview */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Progress</span>
                  <span className="text-xs font-bold text-primary">{progress?.enrollment?.progress || 0}%</span>
                </div>
                <Progress value={progress?.enrollment?.progress || 0} className="h-2" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Award className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-muted-foreground">
                      {progress?.enrollment?.completedModules?.length || 0} completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-muted-foreground">
                      {modulesList.length - (progress?.enrollment?.completedModules?.length || 0)} remaining
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modules List */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {modulesList.map((module, index) => {
                const isCompleted = progress?.enrollment?.completedModules?.includes(module.id);
                const isCurrent = module.id === currentModule?.id;

                return (
                  <div
                    key={module.id}
                    className={`group relative rounded-lg cursor-pointer transition-all duration-200 ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : 'hover:bg-muted/80 hover:shadow-sm'
                    }`}
                    onClick={() => navigateToModule(module)}
                  >
                    {sidebarCollapsed ? (
                      <div className="p-2 flex items-center justify-center relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent ? 'bg-primary-foreground text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        {isCompleted && (
                          <CheckCircle className="h-3 w-3 text-green-500 absolute -top-0 -right-0" />
                        )}
                      </div>
                    ) : (
                      <div className="p-3">
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            isCurrent 
                              ? 'bg-primary-foreground text-primary' 
                              : isCompleted 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm leading-tight mb-1 ${
                              isCurrent ? 'text-primary-foreground' : 'text-foreground'
                            }`}>
                              {module.title}
                            </h4>
                            {module.description && (
                              <p className={`text-xs leading-relaxed line-clamp-2 ${
                                isCurrent ? 'text-primary-foreground/80' : 'text-muted-foreground'
                              }`}>
                                {module.description}
                              </p>
                            )}
                            <div className="flex items-center mt-2 space-x-2">
                              <Clock className={`h-3 w-3 ${
                                isCurrent ? 'text-primary-foreground/60' : 'text-muted-foreground'
                              }`} />
                              <span className={`text-xs ${
                                isCurrent ? 'text-primary-foreground/80' : 'text-muted-foreground'
                              }`}>
                                Module {module.order}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isCurrent && (
                          <div className="absolute inset-0 rounded-lg border-2 border-primary/30 pointer-events-none" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">
                <BookOpen className="h-4 w-4 mr-2" />
                Content & Code
              </TabsTrigger>
              <TabsTrigger value="video">
                <PlayCircle className="h-4 w-4 mr-2" />
                Video
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="flex-1 mt-4">
              <ResizablePanelGroup direction="horizontal" className="h-full border rounded-lg">
                {/* Content Panel */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <Card className="h-full border-0 rounded-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{currentModule.title}</CardTitle>
                      {currentModule.description && (
                        <p className="text-sm text-muted-foreground">{currentModule.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ScrollArea className="h-[calc(100vh-300px)]">
                        <div className="prose prose-sm max-w-none">
                          {currentModule.textContent ? (
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {currentModule.textContent}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                              No content available for this module
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Code Panel */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full flex flex-col">
                    <Card className="flex-1 border-0 rounded-none">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Code Editor</CardTitle>
                          <div className="flex items-center space-x-2">
                            {currentModule.language && (
                              <Badge variant="secondary" className="text-xs">
                                {currentModule.language}
                              </Badge>
                            )}
                            <Button 
                              onClick={() => executeCodeMutation.mutate()} 
                              disabled={isExecuting}
                              size="sm"
                            >
                              {isExecuting ? 'Running...' : 'Run Code'}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pb-0">
                        <div className="border rounded-lg overflow-hidden">
                          <MonacoEditor
                            value={code}
                            onChange={setCode}
                            language={currentModule.language || 'javascript'}
                            height="250px"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Output Section */}
                    {output && (
                      <Card className="mt-4 border-0 rounded-none">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Output</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="bg-muted rounded-lg p-3 max-h-32 overflow-auto">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                              {output}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Expected Output Section */}
                    {currentModule.expectedOutput && (
                      <Card className="mt-2 border-0 rounded-none">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-green-600">Expected Output</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-24 overflow-auto">
                            <pre className="text-xs font-mono whitespace-pre-wrap text-green-800">
                              {currentModule.expectedOutput}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
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
                        src={currentModule.videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                      <p className="text-muted-foreground">No video content available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
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