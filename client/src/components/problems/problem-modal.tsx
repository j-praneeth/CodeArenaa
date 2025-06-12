import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CodeEditor } from "@/components/editor/code-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Problem, TestCase, Example } from "@/types/problem";
import { CheckCircle, XCircle } from "lucide-react";

interface TestResult {
  passed: boolean;
  output: string;
  expectedOutput: string;
  isHidden: boolean;
  error?: string;
  input: string;
  runtime: number;
  memory: number;
}

interface ProblemModalProps {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProblemModal({ problem, isOpen, onClose }: ProblemModalProps) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState("description");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize code with problem's starter code when language changes
  useEffect(() => {
    if (problem?.starterCode?.[language]) {
      setCode(problem.starterCode[language]);
    }
  }, [language, problem]);

  // Reset state when problem changes
  useEffect(() => {
    if (problem) {
      setActiveTab("description");
      setTestResults([]);
      if (problem.starterCode?.[language]) {
        setCode(problem.starterCode[language]);
      }
    }
  }, [problem, language]);

  const submitMutation = useMutation({
    mutationFn: async (submissionData: { problemId: number; code: string; language: string }) => {
      await apiRequest("POST", "/api/submissions", submissionData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your solution has been submitted!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      onClose();
    },
    onError: (error) => {
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

  const runCodeMutation = useMutation({
    mutationFn: async () => {
      if (!problem?.id) {
        throw new Error("Problem ID is required");
      }
      if (!code.trim()) {
        throw new Error("Please write some code before running");
      }

      try {
        const response = await apiRequest("/api/run-code", "POST", {
          problemId: problem.id,
          code: code.trim(),
          language
        });
        
        const data = await response.json();
        if (!data.results || !Array.isArray(data.results)) {
          throw new Error("Invalid response format from server");
        }
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error("Failed to run code. Please try again.");
      }
    },
    onSuccess: (data) => {
      if (!data.results) {
        setTestResults([]);
        return;
      }

      setTestResults(data.results);
      setActiveTab("results");
      
      const passedCount = data.results.filter((r: { passed: boolean }) => r.passed).length;
      const totalCount = data.results.length;
      
      toast({
        title: "Code Executed",
        description: `${passedCount}/${totalCount} test cases passed`,
        variant: passedCount === totalCount ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      console.error("Run code error:", error);
      setTestResults([]);
      toast({
        title: "Error",
        description: error.message || "Failed to run code. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!problem) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent 
        className="max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        <DialogHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {problem.title}
              </h2>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={getDifficultyColor(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
                {problem.tags && problem.tags.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {problem.tags.join(", ")}
                  </span>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[70vh]">
          {/* Left Panel */}
          <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-800">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="w-full justify-start border-b border-gray-200 dark:border-gray-800 px-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="results">Test Results</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="h-[calc(70vh-4rem)] overflow-auto">
                <div className="p-6 prose max-w-none dark:prose-invert">
                  <div 
                    className="text-gray-700 dark:text-gray-300 mb-6"
                    dangerouslySetInnerHTML={{ __html: problem.description }}
                  />

                  {problem.examples && problem.examples.length > 0 && (
                    <>
                      <h4 className="font-semibold mb-2">Examples:</h4>
                      {problem.examples.map((example, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                          <div className="font-mono text-sm">
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
                      <h4 className="font-semibold mb-2">Constraints:</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {problem.constraints}
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="results" className="h-[calc(70vh-4rem)] overflow-auto">
                <div className="p-6 space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`font-medium ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="font-medium text-gray-700 dark:text-gray-300">Input:</div>
                          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">{result.input}</pre>
                        </div>

                        <div>
                          <div className="font-medium text-gray-700 dark:text-gray-300">Expected Output:</div>
                          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">{result.expectedOutput}</pre>
                        </div>

                        <div>
                          <div className="font-medium text-gray-700 dark:text-gray-300">Your Output:</div>
                          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">{result.output || 'No output generated'}</pre>
                        </div>

                        {result.error && (
                          <div>
                            <div className="font-medium text-red-500">Error:</div>
                            <pre className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">{result.error}</pre>
                          </div>
                        )}

                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Runtime: {result.runtime}ms | Memory: {result.memory}MB
                        </div>
                      </div>
                    </div>
                  ))}
                  {testResults.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      Run your code to see test results
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="w-1/2 flex flex-col">
            <div className="border-b border-gray-200 dark:border-gray-800 p-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 relative">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                problem={problem}
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end space-x-2">
              <Button
                onClick={() => runCodeMutation.mutate()}
                disabled={runCodeMutation.isPending}
              >
                {runCodeMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Running...
                  </>
                ) : (
                  "Run Code"
                )}
              </Button>
              <Button
                variant="default"
                onClick={() => submitMutation.mutate({ 
                  problemId: problem.id,
                  code,
                  language
                })}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Solution"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
