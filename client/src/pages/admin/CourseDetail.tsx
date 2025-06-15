import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, Edit, Trash2, Users, BookOpen, Plus, Play, Eye, Settings, Loader2, QrCode, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface Course {
  id: number;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  moduleCount?: number;
  enrollmentCount?: number;
  modules?: CourseModule[];
  enrollments?: CourseEnrollment[];
}

interface CourseModule {
  id: number;
  title: string;
  description?: string;
  order: number;
  courseId: number;
}

interface CourseEnrollment {
  id: number;
  userId: string;
  courseId: number;
  progress: number;
  completedModules: number[];
  createdAt?: string;
  enrolledAt?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export default function CourseDetail() {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  
  const courseId = courseIdParam ? parseInt(courseIdParam) : NaN;

  // Fetch course data with all details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId || isNaN(courseId)) {
        throw new Error('Course ID is required');
      }
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course');
      return response.json() as Promise<Course>;
    },
    enabled: !!courseId && !isNaN(courseId),
  });

  // Get additional data if needed
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: async () => {
      if (!courseId || isNaN(courseId)) return [];
      const response = await fetch(`/api/courses/${courseId}/enrollments`);
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      return response.json() as Promise<CourseEnrollment[]>;
    },
    enabled: !!courseId && !isNaN(courseId),
  });

  // Fetch course modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      if (!courseId || isNaN(courseId)) return [];
      const response = await fetch(`/api/courses/${courseId}/modules`);
      if (!response.ok) throw new Error('Failed to fetch modules');
      return response.json() as Promise<CourseModule[]>;
    },
    enabled: !!courseId && !isNaN(courseId),
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

  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: number) => {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete module');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast({ title: 'Module deleted successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete module',
        variant: 'destructive',
        description: error.message || 'Failed to delete module'
      });
    },
  });

  const handleDeleteModule = (moduleId: number) => {
    deleteModuleMutation.mutate(moduleId);
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

  // Generate QR code for course enrollment
  const generateQrCode = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/qr-code`);
      if (!response.ok) throw new Error('Failed to generate QR code');
      const data = await response.json();
      setQrCodeData(data.qrCode);
      setIsQrDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate QR code for enrollment',
        variant: 'destructive'
      });
    }
  };

  // Copy enrollment link to clipboard
  const copyEnrollmentLink = () => {
    const enrollmentUrl = `${window.location.origin}/enroll/${courseId}`;
    navigator.clipboard.writeText(enrollmentUrl);
    toast({
      title: 'Copied!',
      description: 'Enrollment link copied to clipboard'
    });
  };

  if (!courseId || isNaN(courseId)) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Course ID</h1>
          <p className="text-muted-foreground mb-4">
            The course ID is missing or invalid.
          </p>
          <Button onClick={() => setLocation('/admin/courses')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

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
              {course.updatedAt && (
                <span className="text-sm text-muted-foreground">
                  Last updated {formatDate(course.updatedAt)}
                </span>
              )}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course.moduleCount || modules.length}</p>
                <p className="text-sm text-muted-foreground">Course Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course.enrollmentCount || enrollments.length}</p>
                <p className="text-sm text-muted-foreground">Enrolled Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course.isPublic ? 'Public' : 'Private'}</p>
                <p className="text-sm text-muted-foreground">Course Status</p>
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
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Modules Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first course module.
                  </p>
                  <Button onClick={() => setLocation(`/admin/courses/${courseId}/modules/create`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Module
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell>
                          <div className="font-medium">{module.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {module.description}
                          </div>
                        </TableCell>
                        <TableCell>{module.order}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/admin/modules/${module.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteModule(module.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Enrolled Students ({enrollments.length})</CardTitle>
                <CardDescription>
                  Manage the students enrolled in this course
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={generateQrCode}>
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
                <Button onClick={() => setLocation(`/admin/courses/${courseId}/enrollments/create`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by enrolling your first student.
                  </p>
                  <Button onClick={() => setLocation(`/admin/courses/${courseId}/enrollments/create`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Student
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Completed Modules</TableHead>
                      <TableHead>Enrolled At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="font-medium">{enrollment.user?.firstName} {enrollment.user?.lastName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {calculateAverageProgress()}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {enrollment.completedModules.length} / {modules.length}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(enrollment.enrolledAt || '')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/admin/courses/${courseId}/enrollments/${enrollment.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                                                         <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => alert('Delete enrollment functionality not implemented yet')}
                             >
                               <Trash2 className="h-4 w-4 mr-2" />
                               Delete
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
      </Tabs>
    </div>
  );
}