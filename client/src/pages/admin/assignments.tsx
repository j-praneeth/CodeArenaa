import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Trash2, Users, Clock, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface Assignment {
  id: number;
  title: string;
  description?: string;
  courseTag: string;
  deadline?: string;
  questions: any[];
  maxAttempts: number;
  isVisible: boolean;
  autoGrade: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAssignments() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/admin/assignments"],
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/assignments/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteAssignmentMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading assignments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Assignment Management</h1>
          <p className="text-muted-foreground">Create and manage assignments for students</p>
        </div>
        <Button onClick={() => navigate("/admin/assignments/create")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      <div className="grid gap-6">
        {!assignments || assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <div className="text-muted-foreground mb-4">No assignments created yet</div>
              <Button onClick={() => navigate("/admin/assignments/create")} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Assignment
              </Button>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment: Assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {assignment.title}
                      <Badge variant={assignment.isVisible ? "default" : "secondary"}>
                        {assignment.isVisible ? "Visible" : "Hidden"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{assignment.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/assignments/${assignment.id}/submissions`)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Submissions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/assignments/${assignment.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/assignments/${assignment.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(assignment.id, assignment.title)}
                      disabled={deleteAssignmentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Course Tag:</span>
                    <Badge variant="outline" className="ml-2">{assignment.courseTag}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">Questions:</span>
                    <span className="ml-2">{assignment.questions.length}</span>
                  </div>
                  <div>
                    <span className="font-medium">Max Attempts:</span>
                    <span className="ml-2">{assignment.maxAttempts}</span>
                  </div>
                  <div>
                    <span className="font-medium">Auto Grade:</span>
                    <Badge variant={assignment.autoGrade ? "default" : "secondary"} className="ml-2">
                      {assignment.autoGrade ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
                
                {assignment.deadline && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Due: {formatDate(assignment.deadline)}</span>
                  </div>
                )}
                
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>Created: {formatDate(assignment.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}