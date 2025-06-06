import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "@/components/CodeEditor";
import { Play, Send, CheckCircle, XCircle, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  tags: string[];
  constraints: string;
  inputFormat: string;
  outputFormat: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    python?: string;
    javascript?: string;
    cpp?: string;
  };
}

interface Submission {
  id: number;
  status: string;
  language: string;
  submittedAt: string;
  runtime?: number;
  memory?: number;
}

export default function ProblemDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [code, setCode] = useState(`def solution(nums, target):
    # Write your solution here
    pass`);

  const { data: problem, isLoading } = useQuery<Problem>({
    queryKey: [`/api/problems/${id}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/problems/${id}`);
      if (!response) throw new Error("Problem not found");
      const data = await response.json();
      return data as Problem;
    },
    retry: false,
  });

  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ["/api/submissions", { problemId: parseInt(id || "0") }],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/submissions?problemId=${parseInt(id || "0")}`);
      if (!response) return [];
      const data = await response.json();
      return data as Submission[];
    },
    retry: false,
  });

  const runCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/problems/run", {
        problemId: parseInt(id || "0"),
        code,
        language: selectedLanguage,
      });
      const data = await response.json();
      return data as {
        status: string;
        output: string;
        runtime: number;
        memory: number;
      };
    },
    onSuccess: (result) => {
      toast({
        title: "Code executed successfully",
        description: `Runtime: ${result.runtime}ms, Memory: ${result.memory}MB`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Execution failed",
        description: "There was an error running your code.",
        variant: "destructive",
      });
    },
  });

  const submitCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/submissions", {
        problemId: parseInt(id || "0"),
        code,
        language: selectedLanguage,
      });
      const data = await response.json();
      return data as Submission;
    },
    onSuccess: () => {
      toast({
        title: "Submission successful",
        description: "Your code has been submitted for evaluation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Wrong Answer':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-arena-green"></div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Problem Not Found</h1>
            <p className="text-slate-600 dark:text-slate-400">The problem you're looking for doesn't exist.</p>
            <Button 
              className="mt-4"
              onClick={() => window.location.href = "/problems"}
            >
              Back to Problems
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Problem Description */}
        <div className="w-1/2 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{problem.title}</h1>
                <Badge className={getDifficultyColor(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <span>{problem.category}</span>
                {problem.tags && (
                  <>
                    <span>•</span>
                    <span>{problem.tags.join(', ')}</span>
                  </>
                )}
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-4">Problem Statement</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-6 whitespace-pre-wrap">
                {problem.description}
              </p>

              {problem.examples && Array.isArray(problem.examples) && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Examples:</h4>
                  {problem.examples.map((example, index) => (
                    <div key={index} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-4 font-mono text-sm">
                      <div><strong>Input:</strong> {example.input}</div>
                      <div><strong>Output:</strong> {example.output}</div>
                      {example.explanation && (
                        <div><strong>Explanation:</strong> {example.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Constraints:</h4>
                  <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {problem.constraints}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Submissions */}
            {submissions && submissions.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Your Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(submission.status)}
                          <div>
                            <div className="text-sm font-medium">{submission.language}</div>
                            <div className="text-xs text-slate-500">
                              {new Date(submission.submittedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            submission.status === 'Accepted' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {submission.status}
                          </div>
                          {submission.runtime && (
                            <div className="text-xs text-slate-500">
                              {submission.runtime}ms
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Header */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runCodeMutation.mutate()}
                  disabled={runCodeMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{runCodeMutation.isPending ? "Running..." : "Run Code"}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => submitCodeMutation.mutate()}
                  disabled={submitCodeMutation.isPending}
                  className="bg-arena-green hover:bg-green-600 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitCodeMutation.isPending ? "Submitting..." : "Submit"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLanguage}
            />
          </div>

          {/* Test Results */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800 max-h-48 overflow-y-auto">
            {runCodeMutation.data ? (
              <div className="text-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Execution Successful</span>
                </div>
                <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {runCodeMutation.data.output}
                </pre>
              </div>
            ) : runCodeMutation.isError ? (
              <div className="text-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Execution Failed</span>
                </div>
                <div className="text-xs text-red-600">
                  Runtime error occurred
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Click "Run Code" to test your solution
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
