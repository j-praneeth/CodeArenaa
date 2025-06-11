import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ChevronLeft, BookOpen, Video, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
});

const moduleSchema = z.object({
  title: z.string().min(1, 'Module title is required'),
  description: z.string().optional(),
  textContent: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  codeExample: z.string().optional(),
  language: z.string().optional(),
  expectedOutput: z.string().optional(),
});

type CourseForm = z.infer<typeof courseSchema>;
type ModuleForm = z.infer<typeof moduleSchema>;

const programmingLanguages = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 
  'php', 'ruby', 'go', 'rust', 'kotlin', 'swift', 'html', 'css'
];

export default function CreateCourse() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modules, setModules] = useState<(ModuleForm & { id: string })[]>([]);
  const [currentModule, setCurrentModule] = useState<ModuleForm>({
    title: '',
    description: '',
    textContent: '',
    videoUrl: '',
    codeExample: '',
    language: 'javascript',
    expectedOutput: '',
  });

  const form = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      isPublic: true,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: { course: CourseForm; modules: ModuleForm[] }) => {
      // First create the course
      const courseResponse = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.course),
      });
      
      if (!courseResponse.ok) throw new Error('Failed to create course');
      const course = await courseResponse.json();

      // Then create all modules
      const modulePromises = data.modules.map((module, index) =>
        fetch(`/api/courses/${course.id}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...module, order: index + 1 }),
        })
      );

      await Promise.all(modulePromises);
      return course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Course created successfully!' });
      setLocation('/admin/courses');
    },
    onError: () => {
      toast({
        title: 'Failed to create course',
        variant: 'destructive'
      });
    },
  });

  const addModule = () => {
    if (!currentModule.title.trim()) {
      toast({
        title: 'Module title is required',
        variant: 'destructive'
      });
      return;
    }

    const newModule = {
      ...currentModule,
      id: Math.random().toString(36).substr(2, 9),
    };

    setModules([...modules, newModule]);
    setCurrentModule({
      title: '',
      description: '',
      textContent: '',
      videoUrl: '',
      codeExample: '',
      language: 'javascript',
      expectedOutput: '',
    });

    toast({ title: 'Module added to course' });
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
    toast({ title: 'Module removed from course' });
  };

  const onSubmit = (data: CourseForm) => {
    if (modules.length === 0) {
      toast({
        title: 'At least one module is required',
        variant: 'destructive'
      });
      return;
    }

    createCourseMutation.mutate({
      course: data,
      modules: modules.map(({ id, ...module }) => module),
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/admin/courses')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground">
          Create a comprehensive course with interactive modules for your students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>
                Basic information about your course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduction to JavaScript" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what students will learn in this course..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Public Course</FormLabel>
                          <FormDescription>
                            Make this course visible to all users
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Module Creation */}
          <Card>
            <CardHeader>
              <CardTitle>Add Course Module</CardTitle>
              <CardDescription>
                Create interactive learning modules with text, video, and code content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Module Title</label>
                  <Input
                    placeholder="Module 1: Variables and Data Types"
                    value={currentModule.title}
                    onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Programming Language</label>
                  <Select
                    value={currentModule.language}
                    onValueChange={(value) => setCurrentModule({ ...currentModule, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {programmingLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Brief description of this module"
                  value={currentModule.description}
                  onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Text Content</label>
                <Textarea
                  placeholder="Enter the learning content for this module..."
                  className="min-h-[100px]"
                  value={currentModule.textContent}
                  onChange={(e) => setCurrentModule({ ...currentModule, textContent: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Video URL (YouTube)</label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={currentModule.videoUrl}
                  onChange={(e) => setCurrentModule({ ...currentModule, videoUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Code Example</label>
                <Textarea
                  placeholder="// Default code for the module&#10;function example() {&#10;  return 'Hello World';&#10;}"
                  className="min-h-[100px] font-mono"
                  value={currentModule.codeExample}
                  onChange={(e) => setCurrentModule({ ...currentModule, codeExample: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Expected Output</label>
                <Textarea
                  placeholder="Expected output when the code is executed..."
                  value={currentModule.expectedOutput}
                  onChange={(e) => setCurrentModule({ ...currentModule, expectedOutput: e.target.value })}
                />
              </div>

              <Button onClick={addModule} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Module to Course
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Course Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Preview</CardTitle>
              <CardDescription>
                Preview of your course structure ({modules.length} modules)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No modules added yet</p>
                  <p className="text-sm">Add modules to see the course structure</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <Card key={module.id} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                Module {index + 1}: {module.title}
                              </CardTitle>
                              {module.description && (
                                <CardDescription className="mt-1">
                                  {module.description}
                                </CardDescription>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeModule(module.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {module.textContent && (
                              <Badge variant="secondary">
                                <BookOpen className="h-3 w-3 mr-1" />
                                Text Content
                              </Badge>
                            )}
                            {module.videoUrl && (
                              <Badge variant="secondary">
                                <Video className="h-3 w-3 mr-1" />
                                Video
                              </Badge>
                            )}
                            {module.codeExample && (
                              <Badge variant="secondary">
                                <Code className="h-3 w-3 mr-1" />
                                Code ({module.language})
                              </Badge>
                            )}
                          </div>
                          
                          {module.textContent && (
                            <div className="text-sm text-muted-foreground">
                              <strong>Text:</strong> {module.textContent.substring(0, 100)}
                              {module.textContent.length > 100 && '...'}
                            </div>
                          )}
                          
                          {module.codeExample && (
                            <div className="text-sm font-mono bg-muted p-2 rounded">
                              {module.codeExample.substring(0, 150)}
                              {module.codeExample.length > 150 && '...'}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Separator />
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createCourseMutation.isPending || modules.length === 0}
              className="w-full"
              size="lg"
            >
              {createCourseMutation.isPending ? 'Creating Course...' : 'Create Course'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}