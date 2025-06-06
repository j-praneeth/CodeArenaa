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
import { Plus, Search, GraduationCap, BookOpen, Edit, Trash2, GripVertical } from "lucide-react";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from "@hello-pangea/dnd";

interface Course {
  id: number;
  title: string;
  description: string;
  sections: CourseSection[];
  difficulty: string;
  duration: string; // estimated duration
}

interface CourseSection {
  id: number;
  title: string;
  content: string;
  type: "text" | "video" | "problem";
  problemId?: number; // if type is "problem"
  videoUrl?: string; // if type is "video"
}

interface Problem {
  id: number;
  title: string;
  difficulty: string;
}

const courseSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["text", "video", "problem"]),
  problemId: z.number().optional(),
  videoUrl: z.string().optional()
});

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.string().min(1, "Duration is required"),
  sections: z.array(courseSectionSchema).min(1, "At least one section is required")
});

export default function AdminCourses() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "beginner",
      duration: "",
      sections: [{
        title: "",
        content: "",
        type: "text"
      }]
    }
  });

  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
    retry: false,
  });

  const { data: availableProblems } = useQuery<Problem[]>({
    queryKey: ["/api/admin/problems"],
    retry: false,
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof courseSchema>) => {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create course");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create course: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete course");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete course: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof courseSchema>) => {
    createCourseMutation.mutate(data);
  };

  const addSection = () => {
    const sections = form.getValues("sections");
    form.setValue("sections", [
      ...sections,
      { title: "", content: "", type: "text" }
    ]);
  };

  const removeSection = (index: number) => {
    const sections = form.getValues("sections");
    if (sections.length > 1) {
      form.setValue("sections", sections.filter((_, i) => i !== index));
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sections = form.getValues("sections");
    const [reorderedItem] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, reorderedItem);
    form.setValue("sections", sections);
  };

  const filteredCourses = courses?.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Course Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage programming courses with integrated practice problems.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
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
                        <Input {...field} placeholder="Enter course title" />
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
                          placeholder="Enter course description"
                          className="min-h-[100px]"
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
                        <FormLabel>Difficulty Level</FormLabel>
                        <select
                          {...field}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Duration</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 2 weeks" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Course Sections</h3>
                    <Button type="button" variant="outline" onClick={addSection}>
                      Add Section
                    </Button>
                  </div>

                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="sections">
                      {(provided: DroppableProvided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {form.watch("sections").map((_, index) => (
                            <Draggable
                              key={index}
                              draggableId={`section-${index}`}
                              index={index}
                            >
                              {(provided: DraggableProvided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="border rounded-lg p-4 bg-white dark:bg-gray-800"
                                >
                                  <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center">
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="w-5 h-5 mr-2 text-gray-400" />
                                      </div>
                                      <h4 className="font-medium">Section {index + 1}</h4>
                                    </div>
                                    {index > 0 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSection(index)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name={`sections.${index}.title`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Section Title</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Enter section title" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`sections.${index}.type`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Content Type</FormLabel>
                                          <select
                                            {...field}
                                            className="w-full p-2 border rounded-md"
                                          >
                                            <option value="text">Text</option>
                                            <option value="video">Video</option>
                                            <option value="problem">Practice Problem</option>
                                          </select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    {form.watch(`sections.${index}.type`) === "text" && (
                                      <FormField
                                        control={form.control}
                                        name={`sections.${index}.content`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Content</FormLabel>
                                            <FormControl>
                                              <Textarea
                                                {...field}
                                                placeholder="Enter section content"
                                                className="min-h-[150px]"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    )}

                                    {form.watch(`sections.${index}.type`) === "video" && (
                                      <FormField
                                        control={form.control}
                                        name={`sections.${index}.videoUrl`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Video URL</FormLabel>
                                            <FormControl>
                                              <Input
                                                {...field}
                                                placeholder="Enter video URL"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    )}

                                    {form.watch(`sections.${index}.type`) === "problem" && (
                                      <FormField
                                        control={form.control}
                                        name={`sections.${index}.problemId`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Select Problem</FormLabel>
                                            <select
                                              {...field}
                                              className="w-full p-2 border rounded-md"
                                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            >
                                              <option value="">Select a problem</option>
                                              {availableProblems?.map(problem => (
                                                <option key={problem.id} value={problem.id}>
                                                  {problem.title} ({problem.difficulty})
                                                </option>
                                              ))}
                                            </select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Course</Button>
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
            <span>Search Courses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {isLoadingCourses ? (
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
          {filteredCourses.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {course.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {course.difficulty}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {course.duration}
                      </div>
                      <div>
                        {course.sections.length} sections
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
                        if (confirm("Are you sure you want to delete this course?")) {
                          deleteCourseMutation.mutate(course.id);
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

      {!isLoadingCourses && filteredCourses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p>Try adjusting your search criteria or create a new course.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 