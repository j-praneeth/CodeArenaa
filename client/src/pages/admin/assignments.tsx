import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, Search, Calendar, Users, Edit, Trash2 } from "lucide-react";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  problems: Problem[];
  assignedTo: {
    type: "user" | "group";
    id: number;
    name: string;
  }[];
}

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  points: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
  memberCount: number;
}

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  problems: z.array(z.object({
    id: z.number(),
    points: z.number().min(1, "Points must be at least 1")
  })).min(1, "At least one problem is required"),
  assignedTo: z.array(z.object({
    type: z.enum(["user", "group"]),
    id: z.number(),
    name: z.string()
  })).min(1, "Must assign to at least one user or group")
});

export default function AdminAssignments() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      problems: [],
      assignedTo: []
    }
  });

  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ["/api/admin/assignments"],
    retry: false,
  });

  const { data: availableProblems } = useQuery<Problem[]>({
    queryKey: ["/api/admin/problems"],
    retry: false,
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: groups } = useQuery<Group[]>({
    queryKey: ["/api/admin/groups"],
    retry: false,
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof assignmentSchema>) => {
      const response = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create assignment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assignments"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create assignment: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/assignments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete assignment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assignments"] });
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete assignment: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof assignmentSchema>) => {
    createAssignmentMutation.mutate(data);
  };

  const filteredAssignments = assignments?.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Assignment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage assignments for users and groups.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter assignment title" />
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
                          {...field} 
                          placeholder="Enter assignment description"
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select Problems</h3>
                  <div className="space-y-2">
                    {availableProblems?.map(problem => (
                      <Card key={problem.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{problem.title}</h4>
                            <Badge>{problem.difficulty}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              placeholder="Points"
                              className="w-24"
                              onChange={(e) => {
                                const points = parseInt(e.target.value);
                                const problems = form.getValues("problems");
                                const existingIndex = problems.findIndex(p => p.id === problem.id);
                                
                                if (existingIndex >= 0) {
                                  problems[existingIndex].points = points;
                                } else {
                                  problems.push({ id: problem.id, points });
                                }
                                
                                form.setValue("problems", problems);
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const problems = form.getValues("problems").filter(
                                  p => p.id !== problem.id
                                );
                                form.setValue("problems", problems);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Assign To</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Users</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {users?.map(user => (
                          <Card key={user.id} className="p-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const assignedTo = form.getValues("assignedTo");
                                  const isAssigned = assignedTo.some(a => 
                                    a.type === "user" && a.id === user.id
                                  );

                                  if (isAssigned) {
                                    form.setValue("assignedTo", assignedTo.filter(a => 
                                      !(a.type === "user" && a.id === user.id)
                                    ));
                                  } else {
                                    form.setValue("assignedTo", [
                                      ...assignedTo,
                                      { type: "user", id: user.id, name: user.name }
                                    ]);
                                  }
                                }}
                              >
                                {form.watch("assignedTo").some(a => 
                                  a.type === "user" && a.id === user.id
                                ) ? "Remove" : "Add"}
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Groups</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {groups?.map(group => (
                          <Card key={group.id} className="p-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{group.name}</div>
                                <div className="text-sm text-gray-500">
                                  {group.memberCount} members
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const assignedTo = form.getValues("assignedTo");
                                  const isAssigned = assignedTo.some(a => 
                                    a.type === "group" && a.id === group.id
                                  );

                                  if (isAssigned) {
                                    form.setValue("assignedTo", assignedTo.filter(a => 
                                      !(a.type === "group" && a.id === group.id)
                                    ));
                                  } else {
                                    form.setValue("assignedTo", [
                                      ...assignedTo,
                                      { type: "group", id: group.id, name: group.name }
                                    ]);
                                  }
                                }}
                              >
                                {form.watch("assignedTo").some(a => 
                                  a.type === "group" && a.id === group.id
                                ) ? "Remove" : "Add"}
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Assignment</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Assignments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {isLoadingAssignments ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {assignment.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {assignment.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due: {format(new Date(assignment.dueDate), "PPp")}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {assignment.assignedTo.length} assigned
                      </div>
                      <div>
                        {assignment.problems.length} problems
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this assignment?")) {
                          deleteAssignmentMutation.mutate(assignment.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoadingAssignments && filteredAssignments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No assignments found</h3>
              <p>Try adjusting your search criteria or create a new assignment.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 