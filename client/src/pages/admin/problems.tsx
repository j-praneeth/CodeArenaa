import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  testCases: TestCase[];
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

const LANGUAGES = ["python", "javascript", "java", "cpp"] as const;

const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  constraints: z.string().optional(),
  inputFormat: z.string().min(1, "Input format is required"),
  outputFormat: z.string().min(1, "Output format is required"),
  examples: z.array(z.object({
    input: z.string().min(1, "Input is required"),
    output: z.string().min(1, "Output is required"),
    explanation: z.string().optional()
  })).min(1, "At least one example is required"),
  testCases: z.array(z.object({
    input: z.string().min(1, "Input is required"),
    expectedOutput: z.string().min(1, "Expected output is required"),
    explanation: z.string().optional(),
    isHidden: z.boolean().default(false),
    timeLimit: z.number().optional(),
    memoryLimit: z.number().optional()
  })).min(1, "At least one test case is required"),
  timeLimit: z.number().min(100, "Time limit must be at least 100ms"),
  memoryLimit: z.number().min(16, "Memory limit must be at least 16MB"),
  starterCode: z.object({
    python: z.string().optional(),
    javascript: z.string().optional(),
    java: z.string().optional(),
    cpp: z.string().optional()
  }),
  notes: z.string().optional(),
  difficulty_rating: z.number().min(1).max(5).optional()
});

export default function AdminProblems() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof problemSchema>>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "medium",
      tags: [],
      constraints: "",
      inputFormat: "",
      outputFormat: "",
      examples: [{
        input: "",
        output: "",
        explanation: ""
      }],
      testCases: [{
        input: "",
        expectedOutput: "",
        explanation: "",
        isHidden: false,
        timeLimit: undefined,
        memoryLimit: undefined
      }],
      timeLimit: 1000,
      memoryLimit: 256,
      starterCode: {
        python: "def solution():\n    pass",
        javascript: "function solution() {\n}",
        java: "public class Solution {\n    public void solution() {\n    }\n}",
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}"
      },
      notes: "",
      difficulty_rating: 1
    }
  });

  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ["/api/problems"],
    retry: false,
  });

  const createProblemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof problemSchema>) => {
      // Format the data to match backend expectations
      const formattedData = {
        ...data,
        tags: data.tags.filter(tag => tag.trim() !== ""), // Remove empty tags
        isPublic: true, // Set default value
        examples: data.examples.map(example => ({
          ...example,
          explanation: example.explanation || "" // Ensure explanation is never undefined
        })),
        testCases: data.testCases.map(testCase => ({
          ...testCase,
          explanation: testCase.explanation || "", // Ensure explanation is never undefined
          timeLimit: testCase.timeLimit || data.timeLimit,
          memoryLimit: testCase.memoryLimit || data.memoryLimit
        }))
      };

      try {
        const response = await fetch("/api/problems", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(formattedData),
          credentials: 'include' // Ensure cookies are sent
        });

        // First check if response is ok
        if (!response.ok) {
          // Try to get the content type
          const contentType = response.headers.get("content-type");
          
          if (contentType && contentType.includes("application/json")) {
            // If it's JSON, parse the error
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to create problem");
          } else {
            // If it's not JSON, get the text and check for specific errors
            const text = await response.text();
            console.error("Non-JSON response:", text);
            
            if (response.status === 401) {
              throw new Error("You are not authenticated. Please log in again.");
            } else if (response.status === 403) {
              throw new Error("You don't have permission to create problems.");
            } else {
              throw new Error(`Server error (${response.status}). Please try again.`);
            }
          }
        }

        // If response is ok, parse the JSON
        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Problem creation error details:", error);
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error("An unexpected error occurred while creating the problem");
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/problems"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Problem created successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Problem creation error:", error);
      
      // Check for specific error messages
      if (error.message.includes("not authenticated")) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        // Optionally redirect to login
        window.location.href = "/login";
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to create problem. Please try again.",
        variant: "destructive",
      });
      // Keep the dialog open so user can fix the error
    },
  });

  const deleteProblemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/problems/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete problem");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/problems"] });
      toast({
        title: "Success",
        description: "Problem deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete problem: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof problemSchema>) => {
    try {
      // Additional validation before submission
      if (!data.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Title is required",
          variant: "destructive",
        });
        return;
      }

      if (!data.description.trim()) {
        toast({
          title: "Validation Error",
          description: "Description is required",
          variant: "destructive",
        });
        return;
      }

      if (!data.inputFormat.trim() || !data.outputFormat.trim()) {
        toast({
          title: "Validation Error",
          description: "Input and output formats are required",
          variant: "destructive",
        });
        return;
      }

      if (data.examples.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one example is required",
          variant: "destructive",
        });
        return;
      }

      if (data.testCases.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one test case is required",
          variant: "destructive",
        });
        return;
      }

      // Validate that at least one language has starter code
      const hasStarterCode = Object.values(data.starterCode).some(code => code && code.trim());
      if (!hasStarterCode) {
        toast({
          title: "Validation Error",
          description: "Starter code is required for at least one language",
          variant: "destructive",
        });
        return;
      }

      // Show loading toast
      toast({
        title: "Creating Problem",
        description: "Please wait while we create your problem...",
      });

      // Submit the data
      await createProblemMutation.mutateAsync(data);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const addExample = () => {
    const examples = form.getValues("examples");
    form.setValue("examples", [
      ...examples,
      { input: "", output: "", explanation: "" }
    ]);
  };

  const removeExample = (index: number) => {
    const examples = form.getValues("examples");
    if (examples.length > 1) {
      form.setValue("examples", examples.filter((_, i) => i !== index));
    }
  };

  const addTestCase = () => {
    const testCases = form.getValues("testCases");
    form.setValue("testCases", [
      ...testCases,
      { input: "", expectedOutput: "", explanation: "", isHidden: false, timeLimit: undefined, memoryLimit: undefined }
    ]);
  };

  const removeTestCase = (index: number) => {
    const testCases = form.getValues("testCases");
    if (testCases.length > 1) {
      form.setValue("testCases", testCases.filter((_, i) => i !== index));
    }
  };

  const filteredProblems = problems?.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  }) || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Problem Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage coding problems for your platform.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Problem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Problem</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter problem title" />
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
                              placeholder="Enter problem description with Markdown support"
                              className="min-h-[200px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="difficulty_rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty Rating (1-5)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1} 
                                max={5} 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter tags separated by commas"
                              onChange={(e) => field.onChange(e.target.value.split(",").map(tag => tag.trim()))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="timeLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Limit (ms)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={100} 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="memoryLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Memory Limit (MB)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={16} 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="inputFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Input Format</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe the input format"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="outputFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Output Format</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe the output format"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="constraints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Constraints</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="List the constraints"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Add any notes about the problem (only visible to admins)"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Examples</h3>
                    <Button type="button" variant="outline" onClick={addExample}>
                      Add Example
                    </Button>
                  </div>
                  
                  {form.watch("examples").map((_, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Example {index + 1}</h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExample(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`examples.${index}.input`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Input</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Example input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`examples.${index}.output`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Output</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Example output" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`examples.${index}.explanation`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Explanation</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Explain this example" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Test Cases</h3>
                    <Button type="button" variant="outline" onClick={addTestCase}>
                      Add Test Case
                    </Button>
                  </div>
                  
                  {form.watch("testCases").map((_, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Test Case {index + 1}</h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTestCase(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`testCases.${index}.input`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Input</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Test case input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`testCases.${index}.expectedOutput`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expected Output</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Expected output" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`testCases.${index}.explanation`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Explanation</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Explain this test case" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`testCases.${index}.isHidden`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="!mt-0">Hidden test case</FormLabel>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`testCases.${index}.timeLimit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time Limit (ms)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`testCases.${index}.memoryLimit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Memory Limit (MB)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Starter Code</h3>
                  {LANGUAGES.map((lang) => (
                    <FormField
                      key={lang}
                      control={form.control}
                      name={`starterCode.${lang}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">{lang}</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder={`${lang} starter code`}
                              className="font-mono min-h-[150px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Problem</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Problems</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProblems.map((problem) => (
            <Card key={problem.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {problem.description}
                    </p>
                    <div className="flex items-center space-x-3">
                      <Badge className={
                        problem.difficulty === "easy" ? "bg-green-100 text-green-800" :
                        problem.difficulty === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }>
                        {problem.difficulty}
                      </Badge>
                      {problem.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
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
                        if (confirm("Are you sure you want to delete this problem?")) {
                          deleteProblemMutation.mutate(problem.id);
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

      {!isLoading && filteredProblems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No problems found</h3>
              <p>Try adjusting your search criteria or create a new problem.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 