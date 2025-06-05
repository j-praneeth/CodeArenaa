import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Play, Send, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import CodeEditor from "@/components/problem/code-editor";

export default function ProblemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [code, setCode] = useState("");

  const { data: problem, isLoading } = useQuery({
    queryKey: [`/api/problems/${id}`],
    enabled: !!id,
  });

  const { data: submissions } = useQuery({
    queryKey: [`/api/submissions/user/${user?.id}`],
    enabled: !!user?.id,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (submissionData: { problemId: string; code: string; language: string }) => {
      return await apiRequest("POST", "/api/submissions", submissionData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Solution submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/submissions/user/${user?.id}`] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate({
      problemId: id!,
      code,
      language: selectedLanguage,
    });
  };

  const handleRunCode = () => {
    toast({
      title: "Running Code",
      description: "Code execution simulated for demo purposes.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'wrong_answer': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex">
        <div className="w-1/2 p-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="w-1/2 p-6">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Problem not found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              The problem you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const problemSubmissions = submissions?.filter(sub => sub.problemId === problem.id) || [];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{problem.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={getDifficultyColor(problem.difficulty)}>
                {problem.difficulty}
              </Badge>
              {problem.tags && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {problem.tags.join(", ")}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleRunCode}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Run</span>
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="bg-arena-green hover:bg-green-600 text-white flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitMutation.isPending ? "Submitting..." : "Submit"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Problem Description */}
        <div className="w-1/2 overflow-y-auto border-r">
          <div className="p-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="submissions">Submissions ({problemSubmissions.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <div className="prose max-w-none dark:prose-invert">
                  <h3 className="text-lg font-semibold mb-4">Problem Statement</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {problem.description}
                  </p>
                  
                  {problem.examples && Array.isArray(problem.examples) && problem.examples.length > 0 && (
                    <>
                      <h4 className="font-semibold mb-3">Examples</h4>
                      {problem.examples.map((example: any, index: number) => (
                        <div key={index} className="mb-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                            <div><strong>Input:</strong> {example.input}</div>
                            <div><strong>Output:</strong> {example.output}</div>
                            {example.explanation && (
                              <div><strong>Explanation:</strong> {example.explanation}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {problem.constraints && (
                    <>
                      <h4 className="font-semibold mb-3">Constraints</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {problem.constraints}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="submissions" className="mt-6">
                <div className="space-y-4">
                  {problemSubmissions.length > 0 ? (
                    problemSubmissions.map((submission) => (
                      <Card key={submission.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(submission.status)}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {submission.language}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(submission.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium capitalize">
                                {submission.status.replace('_', ' ')}
                              </p>
                              {submission.runtime && (
                                <p className="text-xs text-gray-500">
                                  {submission.runtime}ms
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No submissions yet. Submit your first solution!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Code Editor */}
        <div className="w-1/2 flex flex-col">
          <CodeEditor
            language={selectedLanguage}
            value={code}
            onChange={setCode}
            problem={problem}
          />
        </div>
      </div>
    </div>
  );
}
