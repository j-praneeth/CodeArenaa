import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CodeEditor } from "@/components/editor/code-editor";
import type { Problem } from "@shared/schema";

interface ProblemModalProps {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProblemModal({ problem, isOpen, onClose }: ProblemModalProps) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      // Mock run code functionality
      return { success: true, output: "Test case 1: Passed\nTest case 2: Passed" };
    },
    onSuccess: (result) => {
      toast({
        title: "Code Executed",
        description: result.output,
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

  const examples = Array.isArray(problem.examples) ? problem.examples : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden">
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
          {/* Problem Description */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-800">
            <div className="prose max-w-none dark:prose-invert">
              <h3 className="text-lg font-semibold mb-4">Problem Statement</h3>
              <div 
                className="text-gray-700 dark:text-gray-300 mb-4"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />
              
              {examples.length > 0 && (
                <>
                  <h4 className="font-semibold mb-2">Examples:</h4>
                  {examples.map((example: any, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm mb-4">
                      <div><strong>Input:</strong> {example.input}</div>
                      <div><strong>Output:</strong> {example.output}</div>
                      {example.explanation && (
                        <div><strong>Explanation:</strong> {example.explanation}</div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {problem.constraints && (
                <>
                  <h4 className="font-semibold mb-2">Constraints:</h4>
                  <div 
                    className="text-sm text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: problem.constraints }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="w-1/2 flex flex-col">
            {/* Editor Header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <Select value={language} onValueChange={setLanguage}>
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
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runCodeMutation.mutate()}
                    disabled={runCodeMutation.isPending}
                  >
                    Run Code
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => submitMutation.mutate({
                      problemId: problem.id,
                      code,
                      language,
                    })}
                    disabled={submitMutation.isPending || !code.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                problem={problem}
              />
            </div>

            {/* Test Results */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
              <div className="text-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Ready to run tests</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">
                  Click "Run Code" to test your solution
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
