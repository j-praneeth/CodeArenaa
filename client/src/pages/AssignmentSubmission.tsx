import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Save, Send, Clock, FileText, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Editor from "@monaco-editor/react";

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface AssignmentQuestion {
  id: string;
  type: 'mcq' | 'coding';
  title: string;
  description: string;
  points: number;
  options?: MCQOption[];
  problemStatement?: string;
  inputFormat?: string;
  outputFormat?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

interface Assignment {
  id: number;
  title: string;
  description?: string;
  courseTag: string;
  deadline?: string;
  questions: AssignmentQuestion[];
  maxAttempts: number;
  isVisible: boolean;
  autoGrade: boolean;
}

interface QuestionSubmission {
  questionId: string;
  type: 'mcq' | 'coding';
  selectedOptionId?: string;
  code?: string;
  language?: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
}

interface AssignmentSubmission {
  id?: number;
  assignmentId: number;
  userId: string;
  questionSubmissions: QuestionSubmission[];
  totalScore: number;
  maxScore: number;
  status: 'in_progress' | 'submitted' | 'graded';
  submittedAt?: string;
  gradedAt?: string;
  feedback?: string;
}

export default function AssignmentSubmission() {
  const [, params] = useRoute("/assignments/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const assignmentId = parseInt(params?.id || "0");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionSubmissions, setQuestionSubmissions] = useState<QuestionSubmission[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  const { data: assignment, isLoading: assignmentLoading } = useQuery<Assignment>({
    queryKey: ["/api/assignments", assignmentId],
    enabled: !!assignmentId,
  });

  const { data: existingSubmission } = useQuery<AssignmentSubmission>({
    queryKey: ["/api/assignments", assignmentId, "submission"],
    enabled: !!assignmentId,
  });

  // Initialize submissions from existing data or create empty ones
  useEffect(() => {
    if (assignment && !existingSubmission) {
      const initialSubmissions = assignment.questions.map(question => ({
        questionId: question.id,
        type: question.type,
        selectedOptionId: "",
        code: question.type === "coding" ? getStarterCode(question, selectedLanguage) : "",
        language: selectedLanguage,
      }));
      setQuestionSubmissions(initialSubmissions);
    } else if (existingSubmission) {
      setQuestionSubmissions(existingSubmission.questionSubmissions);
    }
  }, [assignment, existingSubmission, selectedLanguage]);

  const saveSubmissionMutation = useMutation({
    mutationFn: (data: { questionSubmissions: QuestionSubmission[], status?: string }) => 
      apiRequest(`/api/assignments/${assignmentId}/submission`, "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments", assignmentId, "submission"] });
      toast({
        title: "Success",
        description: "Progress saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save progress",
        variant: "destructive",
      });
    },
  });

  const submitAssignmentMutation = useMutation({
    mutationFn: () => {
      // First save the current progress
      return saveSubmissionMutation.mutateAsync({
        questionSubmissions: evaluateSubmissions(),
        status: 'submitted'
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      });
      navigate("/assignments");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit assignment",
        variant: "destructive",
      });
    },
  });

  const getStarterCode = (question: AssignmentQuestion, language: string) => {
    const starters = {
      javascript: "function solution() {\n  // Your code here\n  return;\n}",
      python: "def solution():\n    # Your code here\n    pass",
      java: "public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}"
    };
    return starters[language as keyof typeof starters] || starters.javascript;
  };

  const updateQuestionSubmission = (questionId: string, updates: Partial<QuestionSubmission>) => {
    setQuestionSubmissions(prev => 
      prev.map(submission => 
        submission.questionId === questionId 
          ? { ...submission, ...updates }
          : submission
      )
    );
  };

  const evaluateSubmissions = () => {
    return questionSubmissions.map(submission => {
      if (submission.type === 'mcq' && assignment) {
        const question = assignment.questions.find(q => q.id === submission.questionId);
        const selectedOption = question?.options?.find(opt => opt.id === submission.selectedOptionId);
        const isCorrect = selectedOption?.isCorrect || false;
        const score = isCorrect ? question?.points || 1 : 0;
        
        return {
          ...submission,
          isCorrect,
          score,
          feedback: isCorrect ? "Correct!" : "Incorrect answer"
        };
      }
      return submission;
    });
  };

  const handleSaveProgress = () => {
    saveSubmissionMutation.mutate({
      questionSubmissions: evaluateSubmissions(),
      status: 'in_progress'
    });
  };

  const handleSubmitAssignment = () => {
    if (window.confirm("Are you sure you want to submit this assignment? You won't be able to make changes after submission.")) {
      submitAssignmentMutation.mutate();
    }
  };

  const currentQuestion = assignment?.questions[currentQuestionIndex];
  const currentSubmission = questionSubmissions.find(s => s.questionId === currentQuestion?.id);
  const progress = assignment ? ((currentQuestionIndex + 1) / assignment.questions.length) * 100 : 0;

  if (assignmentLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading assignment...</div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <div className="text-lg mb-2">Assignment not found</div>
            <Button onClick={() => navigate("/assignments")}>Back to Assignments</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/assignments")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{assignment.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{assignment.courseTag}</Badge>
              {assignment.deadline && (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Due: {new Date(assignment.deadline).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSaveProgress}
            disabled={saveSubmissionMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
          <Button 
            onClick={handleSubmitAssignment}
            disabled={submitAssignmentMutation.isPending}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Assignment
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {assignment.questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      {currentQuestion && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={currentQuestion.type === "mcq" ? "default" : "secondary"}>
                  {currentQuestion.type === "mcq" ? (
                    <>
                      <FileText className="h-3 w-3 mr-1" />
                      Multiple Choice
                    </>
                  ) : (
                    <>
                      <Code className="h-3 w-3 mr-1" />
                      Coding Problem
                    </>
                  )}
                </Badge>
                <Badge variant="outline">{currentQuestion.points} points</Badge>
              </div>
            </div>
            <CardTitle>{currentQuestion.title}</CardTitle>
            <CardDescription>{currentQuestion.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentQuestion.type === "mcq" && currentQuestion.options && (
              <RadioGroup
                value={currentSubmission?.selectedOptionId}
                onValueChange={(value) => updateQuestionSubmission(currentQuestion.id, { selectedOptionId: value })}
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "coding" && (
              <div className="space-y-4">
                {currentQuestion.problemStatement && (
                  <div>
                    <h4 className="font-medium mb-2">Problem Statement</h4>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{currentQuestion.problemStatement}</pre>
                    </div>
                  </div>
                )}

                {(currentQuestion.inputFormat || currentQuestion.outputFormat) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.inputFormat && (
                      <div>
                        <h4 className="font-medium mb-2">Input Format</h4>
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">
                          <pre className="whitespace-pre-wrap">{currentQuestion.inputFormat}</pre>
                        </div>
                      </div>
                    )}
                    {currentQuestion.outputFormat && (
                      <div>
                        <h4 className="font-medium mb-2">Output Format</h4>
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">
                          <pre className="whitespace-pre-wrap">{currentQuestion.outputFormat}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Your Solution</Label>
                    <Select 
                      value={selectedLanguage} 
                      onValueChange={(value) => {
                        setSelectedLanguage(value);
                        updateQuestionSubmission(currentQuestion.id, { 
                          language: value,
                          code: getStarterCode(currentQuestion, value)
                        });
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Editor
                      height="300px"
                      language={selectedLanguage}
                      value={currentSubmission?.code || getStarterCode(currentQuestion, selectedLanguage)}
                      onChange={(value) => updateQuestionSubmission(currentQuestion.id, { code: value || "" })}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>
                </div>

                {(currentQuestion.timeLimit || currentQuestion.memoryLimit) && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {currentQuestion.timeLimit && (
                      <span>Time Limit: {currentQuestion.timeLimit}ms</span>
                    )}
                    {currentQuestion.memoryLimit && (
                      <span>Memory Limit: {currentQuestion.memoryLimit}MB</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(Math.min(assignment.questions.length - 1, currentQuestionIndex + 1))}
          disabled={currentQuestionIndex === assignment.questions.length - 1}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}