import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Users, Play, CheckCircle, Clock, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Course {
  id: number;
  title: string;
  description?: string;
  problems?: number[];
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
  order: number;
  textContent?: string;
  videoUrl?: string;
  codeExample?: string;
  language?: string;
  expectedOutput?: string;
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

export default function Courses() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json() as Promise<Course[]>;
    }
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: async () => {
      const response = await fetch('/api/users/me/enrollments');
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      return response.json() as Promise<CourseEnrollment[]>;
    },
    enabled: !!user
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to enroll in course');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-enrollments'] });
      toast({ title: 'Successfully enrolled in course!' });
    },
    onError: () => {
      toast({ 
        title: 'Enrollment failed',
        description: 'Failed to enroll in course',
        variant: 'destructive' 
      });
    }
  });

  const getEnrollmentForCourse = (courseId: number) => {
    return enrollments.find(e => e.courseId === courseId);
  };

  const startCourse = async (courseId: number) => {
    const enrollment = getEnrollmentForCourse(courseId);
    if (!enrollment) {
      // Enroll first
      enrollMutation.mutate(courseId);
      return;
    }

    // Navigate to first module
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`);
      if (response.ok) {
        const modules: CourseModule[] = await response.json();
        if (modules.length > 0) {
          setLocation(`/courses/${courseId}/modules/${modules[0].id}`);
        } else {
          toast({
            title: 'No modules available',
            description: 'This course has no modules yet.',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Failed to start course',
        variant: 'destructive'
      });
    }
  };

  const continueCourse = async (courseId: number) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`);
      if (response.ok) {
        const modules: CourseModule[] = await response.json();
        const enrollment = getEnrollmentForCourse(courseId);
        
        if (modules.length > 0) {
          // Find next incomplete module or go to first module
          const nextModule = modules.find(m => 
            !enrollment?.completedModules.includes(m.id)
          ) || modules[0];
          
          setLocation(`/courses/${courseId}/modules/${nextModule.id}`);
        }
      }
    } catch (error) {
      toast({
        title: 'Failed to continue course',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Courses...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the available courses.</p>
        </div>
      </div>
    );
  }

  const enrolledCourses = courses.filter(course => getEnrollmentForCourse(course.id));
  const availableCourses = courses.filter(course => !getEnrollmentForCourse(course.id));

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Learning Dashboard</h2>
          
          {user?.role === 'admin' && (
            <Button 
              onClick={() => setLocation('/admin/courses/create')}
              className="w-full mb-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          )}

          {user?.role === 'admin' && (
            <Button 
              onClick={() => setLocation('/admin/courses')}
              variant="outline"
              className="w-full mb-4"
            >
              <Users className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          )}

          {enrolledCourses.length > 0 && (
            <>
              <h3 className="font-semibold mb-3">My Courses</h3>
              <ScrollArea className="h-64 mb-6">
                <div className="space-y-3">
                  {enrolledCourses.map((course) => {
                    const enrollment = getEnrollmentForCourse(course.id);
                    return (
                      <Card key={course.id} className="cursor-pointer hover:bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{course.title}</h4>
                            {enrollment?.progress === 100 && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <Progress value={enrollment?.progress || 0} className="mb-2" />
                          <p className="text-xs text-muted-foreground">
                            {enrollment?.progress || 0}% complete
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full mt-2"
                            onClick={() => continueCourse(course.id)}
                          >
                            {enrollment?.progress === 100 ? 'Review' : 'Continue'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
              <Separator className="mb-6" />
            </>
          )}

          <h3 className="font-semibold mb-3">Course Categories</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              All Courses
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Play className="h-4 w-4 mr-2" />
              Interactive Learning
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Recently Added
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Available Courses</h1>
            <p className="text-muted-foreground">
              Explore our comprehensive programming courses with interactive modules and hands-on coding.
            </p>
          </div>

          {availableCourses.length === 0 && enrolledCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
              <p className="text-muted-foreground">
                No courses are currently available. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {course.description || 'No description available'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {course.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {course.modules?.length || 0} Modules
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.enrolledUsers?.length || 0} Students
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => startCourse(course.id)}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? 'Enrolling...' : 'Start Course'}
                      </Button>
                      {user?.role === 'admin' && (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setLocation(`/admin/courses/${course.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              if (confirm(`Delete "${course.title}"? This action cannot be undone.`)) {
                                fetch(`/api/courses/${course.id}`, { method: 'DELETE' })
                                  .then(() => {
                                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                                    toast({ title: 'Course deleted successfully' });
                                  })
                                  .catch(() => {
                                    toast({ title: 'Failed to delete course', variant: 'destructive' });
                                  });
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 