import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  Users, 
  Trophy, 
  BookOpen, 
  FileText, 
  Calendar, 
  TrendingUp, 
  UserPlus, 
  Settings,
  Edit,
  Trash2,
  Plus,
  Shield,
  MessageSquare,
  UsersIcon
} from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import type { User, Assignment, Group, Announcement } from "@/shared/schema";
import { config } from "@/config";

// Analytics type definition
interface Analytics {
  totalUsers: number;
  totalProblems: number;
  totalSubmissions: number;
  activeContests: number;
  recentActivity: Array<{
    id: string;
    problemId: string;
    language: string;
    status: string;
    timestamp: string;
  }>;
}

// Form schemas
const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  problems: z.array(z.number()).min(1, "At least one problem is required"),
  dueDate: z.string().min(1, "Due date is required"),
  assignedTo: z.array(z.string()).min(1, "At least one student must be assigned"),
});

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().min(1, "Description is required"),
  members: z.array(z.string()).min(1, "At least one member is required"),
  instructors: z.array(z.string()).min(1, "At least one instructor is required"),
});

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  priority: z.enum(["low", "medium", "high"]),
  targetAudience: z.array(z.string()).min(1, "Target audience is required"),
  isVisible: z.boolean().default(true),
});

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);

  // Memoize token and fetch options to prevent recreation on every render
  const token = useMemo(() => localStorage.getItem('token'), []);
  const fetchOptions = useMemo(() => ({
    credentials: 'include' as const,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }), [token]);

  useEffect(() => {
    // Handle authentication data from URL parameters (Google OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userStr));
        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Clean up URL parameters
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Show success message
        toast({
          title: "Successfully signed in",
          description: `Welcome back${userData.firstName ? ', ' + userData.firstName : ''}!`
        });
      } catch (error) {
        console.error('[DEBUG] Error processing auth data:', error);
      }
    }
  }, []); // Run only once on mount

  // Memoize the auth check to prevent unnecessary redirects
  const shouldRedirect = useMemo(() => 
    !isAuthenticated || user?.role !== 'admin',
    [isAuthenticated, user?.role]
  );

  useEffect(() => {
    if (shouldRedirect) {
      setLocation('/dashboard');
    }
  }, [shouldRedirect, setLocation]);

  // Early return if not authenticated or not admin
  if (shouldRedirect) {
    return null;
  }

  // Queries with proper configuration and error handling
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const res = await fetch(`${config.apiUrl}/api/admin/analytics`, fetchOptions);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    retry: false,
    enabled: !!token && isAuthenticated,
    staleTime: 30000, // Add staleTime to prevent frequent refetches
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch(`${config.apiUrl}/api/admin/users`, fetchOptions);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    retry: false,
    enabled: !!token && isAuthenticated,
    staleTime: 30000, // Add staleTime to prevent frequent refetches
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["admin", "assignments"],
    queryFn: async () => {
      const res = await fetch(`${config.apiUrl}/api/admin/assignments`, fetchOptions);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    retry: false,
    enabled: !!token && isAuthenticated,
    staleTime: 30000, // Add staleTime to prevent frequent refetches
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["admin", "groups"],
    queryFn: async () => {
      const res = await fetch(`${config.apiUrl}/api/admin/groups`, fetchOptions);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    retry: false,
    enabled: !!token && isAuthenticated,
    staleTime: 30000, // Add staleTime to prevent frequent refetches
  });

  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: async () => {
      const res = await fetch(`${config.apiUrl}/api/admin/announcements`, fetchOptions);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    retry: false,
    enabled: !!token && isAuthenticated,
    staleTime: 30000, // Add staleTime to prevent frequent refetches
  });

  const { data: problems } = useQuery({
    queryKey: ["problems"],
    queryFn: async () => {
      const res = await fetch(`${config.apiUrl}/api/problems`, fetchOptions);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    retry: false,
    enabled: !!token && isAuthenticated,
    staleTime: 30000, // Add staleTime to prevent frequent refetches
  });

  // Mutations with proper error handling
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`${config.apiUrl}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        ...fetchOptions,
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "Success", description: "User role updated successfully" });
    }, [queryClient, toast]),
    onError: useCallback((error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }, [toast]),
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof assignmentSchema>) => {
      const res = await fetch(`${config.apiUrl}/api/assignments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["admin", "assignments"] });
      setShowCreateAssignment(false);
      toast({ title: "Success", description: "Assignment created successfully" });
    }, [queryClient, setShowCreateAssignment, toast]),
    onError: useCallback((error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }, [toast]),
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof groupSchema>) => {
      const res = await fetch(`${config.apiUrl}/api/groups`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["admin", "groups"] });
      setShowCreateGroup(false);
      toast({ title: "Success", description: "Group created successfully" });
    }, [queryClient, setShowCreateGroup, toast]),
    onError: useCallback((error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }, [toast]),
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: z.infer<typeof announcementSchema>) => {
      const res = await fetch(`${config.apiUrl}/api/announcements`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      setShowCreateAnnouncement(false);
      toast({ title: "Success", description: "Announcement created successfully" });
    }, [queryClient, setShowCreateAnnouncement, toast]),
    onError: useCallback((error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }, [toast]),
  });

  // Forms
  const assignmentForm = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      problems: [],
      dueDate: "",
      assignedTo: [],
    },
  });

  const groupForm = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      members: [],
      instructors: [],
    },
  });

  const announcementForm = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      priority: "medium",
      targetAudience: ["all"],
      isVisible: true,
    },
  });

  // Memoized handlers to prevent re-renders
  const handleUpdateUserRole = useCallback((userId: string, role: string) => {
    updateUserRoleMutation.mutate({ userId, role });
  }, [updateUserRoleMutation]);

  const handleTabChange = useCallback((value: string) => {
    setSelectedTab(value);
  }, []);

  const onAssignmentSubmit = (data: z.infer<typeof assignmentSchema>) => {
    createAssignmentMutation.mutate(data);
  };

  const onGroupSubmit = (data: z.infer<typeof groupSchema>) => {
    createGroupMutation.mutate(data);
  };

  const onAnnouncementSubmit = (data: z.infer<typeof announcementSchema>) => {
    createAnnouncementMutation.mutate(data);
  };

  if (analyticsLoading || usersLoading || assignmentsLoading || groupsLoading || announcementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your CodeArena platform</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateAssignment(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
          <Button onClick={() => setShowCreateGroup(true)} variant="outline">
            <UsersIcon className="w-4 h-4 mr-2" />
            Create Group
          </Button>
          <Button onClick={() => setShowCreateAnnouncement(true)} variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Create Announcement
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Registered students and admins</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalProblems || 0}</div>
                <p className="text-xs text-muted-foreground">Available coding problems</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalSubmissions || 0}</div>
                <p className="text-xs text-muted-foreground">Code submissions made</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Contests</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.activeContests || 0}</div>
                <p className="text-xs text-muted-foreground">Currently running contests</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest submissions and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Submission #{activity.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Problem {activity.problemId} • {activity.language} • {activity.status}
                      </p>
                    </div>
                    <Badge variant={activity.status === 'accepted' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div>Loading users...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.profileImageUrl && (
                              <img 
                                src={user.profileImageUrl} 
                                alt="Profile" 
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role || 'student'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt!).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role || 'student'}
                            onValueChange={(role) => handleUpdateUserRole(user.id, role)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Management</CardTitle>
              <CardDescription>Create and manage student assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <div>Loading assignments...</div>
              ) : (
                <div className="space-y-4">
                  {assignments?.map((assignment: Assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">{assignment.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Group Management</CardTitle>
              <CardDescription>Organize students into groups and classes</CardDescription>
            </CardHeader>
            <CardContent>
              {groupsLoading ? (
                <div>Loading groups...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groups?.map((group: Group) => (
                    <Card key={group.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Members:</span> {group.members?.length || 0}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Instructors:</span> {group.instructors?.length || 0}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Announcement Management</CardTitle>
              <CardDescription>Communicate with students and staff</CardDescription>
            </CardHeader>
            <CardContent>
              {announcementsLoading ? (
                <div>Loading announcements...</div>
              ) : (
                <div className="space-y-4">
                  {announcements?.map((announcement: Announcement) => (
                    <div key={announcement.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{announcement.title}</h3>
                            <Badge variant={
                              announcement.priority === 'high' ? 'destructive' :
                              announcement.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {announcement.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{announcement.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(announcement.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Users:</span>
                    <span className="font-bold">{analytics?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Problems:</span>
                    <span className="font-bold">{analytics?.totalProblems || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Submissions:</span>
                    <span className="font-bold">{analytics?.totalSubmissions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Contests:</span>
                    <span className="font-bold">{analytics?.activeContests || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Students:</span>
                    <span className="font-bold">
                      {users?.filter((u: User) => u.role !== 'admin').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admins:</span>
                    <span className="font-bold">
                      {users?.filter((u: User) => u.role === 'admin').length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Assignment Dialog */}
      <Dialog open={showCreateAssignment} onOpenChange={setShowCreateAssignment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment for your students
            </DialogDescription>
          </DialogHeader>
          <Form {...assignmentForm}>
            <form onSubmit={assignmentForm.handleSubmit(onAssignmentSubmit)} className="space-y-4">
              <FormField
                control={assignmentForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Assignment title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={assignmentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Assignment description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={assignmentForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createAssignmentMutation.isPending}>
                  {createAssignmentMutation.isPending ? "Creating..." : "Create Assignment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new group or class for organizing students
            </DialogDescription>
          </DialogHeader>
          <Form {...groupForm}>
            <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
              <FormField
                control={groupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Group name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={groupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Group description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createGroupMutation.isPending}>
                  {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Announcement Dialog */}
      <Dialog open={showCreateAnnouncement} onOpenChange={setShowCreateAnnouncement}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>
              Create a new announcement for students and staff
            </DialogDescription>
          </DialogHeader>
          <Form {...announcementForm}>
            <form onSubmit={announcementForm.handleSubmit(onAnnouncementSubmit)} className="space-y-4">
              <FormField
                control={announcementForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Announcement title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={announcementForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Announcement content" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={announcementForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createAnnouncementMutation.isPending}>
                  {createAnnouncementMutation.isPending ? "Creating..." : "Create Announcement"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}