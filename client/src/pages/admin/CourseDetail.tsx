
import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChevronLeft, Edit, Trash2, Users, BookOpen, Plus, Play, Eye, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: number;
  title: string;
  description?: string;
  modules?: number[];
  enrolledUsers?: string[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  textContent?: string;
  videoUrl?: string;
  codeExample?: string;
  language?: string;
  expectedOutput?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseEnrollment {
  id: number;
  courseId: number;
  userId: string;
  completedModules: number[];
  progress: number;
  enrolledAt: string;
  lastAccessedAt: string;
}

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/modules`);
      if (!response.ok) throw new Error('Failed to fetch modules');
      return response.json() as Promise<CourseModule[]>;
    }
  });

  // Fetch course enrollments
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/enrollments`);
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      return response.json() as Promise<CourseEnrollment[]>;
    }
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete course');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Course deleted successfully' });
      setLocation('/admin/courses');
    },
    onError: () => {
      toast({
        title: 'Failed to delete course',
        variant: 'destructive'
      });
    }
  });

  const handleDeleteCourse = () => {
    deleteCourseMutation.mutate();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAverageProgress = () => {
    if (enrollments.length === 0) return 0;
    const totalProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0);
    return Math.round(totalProgress / enrollments.length);
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Course...</h2>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <Button onClick={() => setLocation('/admin/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/admin/courses')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            {course.description && (
              <p className="text-muted-foreground text-lg mb-4">{course.description}</p>
            )}
            <div className="flex items-center gap-4">
              <Badge variant={course.isPublic ? "default" : "secondary"}>
                {course.isPublic ? 'Public' : 'Private'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {formatDate(course.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation(`/admin/courses/${courseId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Course</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{course.title}"? This action cannot be undone.
                    All course modules and student progress will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCourse}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Course
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{modules.length}</p>
                <p className="text-sm text-muted-foreground">Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{enrollments.length}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{calculateAverageProgress()}%</p>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {enrollments.filter(e => e.progress > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="modules">Course Modules</TabsTrigger>
          <TabsTrigger value="students">Enrolled Students</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Modules ({modules.length})</CardTitle>
                <CardDescription>
                  Manage the learning modules for this course
                </CardDescription>
              </div>
              <Button onClick={() => setLocation(`/admin/courses/${courseId}/modules/create`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No modules created yet</p>
                  <p className="text-sm">Add modules to build your course content</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Module Title</TableHead>
                      <TableHead>Content Type</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell>
                          <Badge variant="outline">#{module.order}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{module.title}</p>
                            {module.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {module.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {module.textContent && <Badge variant="secondary" className="text-xs">Text</Badge>}
                            {module.videoUrl && <Badge variant="secondary" className="text-xs">Video</Badge>}
                            {module.codeExample && <Badge variant="secondary" className="text-xs">Code</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {module.language && (
                            <Badge variant="outline">{module.language}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDate(module.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/admin/modules/${module.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/admin/modules/${module.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students ({enrollments.length})</CardTitle>
              <CardDescription>
                Track student progress and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No students enrolled yet</p>
                  <p className="text-sm">Students will appear here when they enroll in the course</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Completed Modules</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Last Access</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.userId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{enrollment.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {enrollment.completedModules.length} / {modules.length}
                        </TableCell>
                        <TableCell>
                          {formatDate(enrollment.enrolledAt)}
                        </TableCell>
                        <TableCell>
                          {formatDate(enrollment.lastAccessedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
