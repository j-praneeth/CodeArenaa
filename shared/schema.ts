import { z } from "zod";

// MongoDB-compatible schemas using Zod for validation
export const insertUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  role: z.string().default("student"),
});

export const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  explanation: z.string().optional(),
  isHidden: z.boolean().default(false),
  timeLimit: z.number().optional(),
  memoryLimit: z.number().optional(),
});

export const starterCodeSchema = z.object({
  python: z.string().optional(),
  javascript: z.string().optional(),
  java: z.string().optional(),
  cpp: z.string().optional(),
});

export const exampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional(),
});

export const insertProblemSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.array(z.string()).optional(),
  constraints: z.string().optional(),
  inputFormat: z.string(),
  outputFormat: z.string(),
  examples: z.array(exampleSchema).min(1),
  testCases: z.array(testCaseSchema).min(1),
  timeLimit: z.number().default(1000), // milliseconds
  memoryLimit: z.number().default(256), // MB
  starterCode: starterCodeSchema,
  isPublic: z.boolean().default(true),
  createdBy: z.string().optional(),
  solutionCode: starterCodeSchema.optional(),
  notes: z.string().optional(), // Admin notes about the problem
  difficulty_rating: z.number().min(1).max(5).optional(), // More granular difficulty rating
});

export const insertSubmissionSchema = z.object({
  problemId: z.number(),
  userId: z.string(),
  code: z.string(),
  language: z.string(),
  status: z.string(),
  runtime: z.number().optional(),
  memory: z.number().optional(),
  score: z.string().optional(),
  feedback: z.string().optional(),
});

export const insertContestSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  problems: z.array(z.number()).optional(),
  participants: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
  prizePool: z.string().optional(),
  createdBy: z.string().optional(),
});

export const insertCourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  estimatedHours: z.number().min(1).default(1),
  prerequisites: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string()).default([]),
  modules: z.array(z.object({
    title: z.string().min(1, "Module title is required"),
    description: z.string(),
    order: z.number(),
    textContent: z.string().optional(),
    videoUrl: z.string().optional(),
    codeExample: z.string().optional(),
    language: z.string().optional(),
    expectedOutput: z.string().optional(),
  })).default([]),
  tags: z.array(z.string()).default([]),
  problems: z.array(z.number()).optional(),
  enrolledUsers: z.array(z.string()).optional(),
  createdBy: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  enrollmentCount: z.number().default(0),
  completionRate: z.number().min(0).max(100).default(0),
});

export const insertCourseModuleSchema = z.object({
  courseId: z.number(),
  title: z.string().min(1, "Module title is required"),
  description: z.string().optional(),
  order: z.number().min(0, "Order must be non-negative"),
  textContent: z.string().optional(),
  videoUrl: z.string().url().optional(),
  codeExample: z.string().optional(),
  language: z.string().optional(),
  expectedOutput: z.string().optional(),
});

export const insertCourseEnrollmentSchema = z.object({
  courseId: z.number(),
  userId: z.string(),
  enrolledAt: z.date().default(() => new Date()),
  progress: z.number().min(0).max(100).default(0),
  completedModules: z.array(z.number()).default([]),
});

export const insertUserProgressSchema = z.object({
  userId: z.string(),
  moduleId: z.number(),
  completedAt: z.date().default(() => new Date()),
  progress: z.number().min(0).max(100).default(0),
});

export const mcqOptionSchema = z.object({
  text: z.string(),
  isCorrect: z.boolean(),
});

export const assignmentQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["coding", "mcq", "text"]),
  title: z.string(),
  description: z.string(),
  points: z.number().min(0),
  // For coding questions
  starterCode: starterCodeSchema.optional(),
  testCases: z.array(testCaseSchema).optional(),
  // For MCQ questions
  options: z.array(mcqOptionSchema).optional(),
  // For text questions
  expectedAnswer: z.string().optional(),
});

export const insertAssignmentSchema = z.object({
  title: z.string().min(1, "Assignment title is required"),
  description: z.string().optional(),
  questions: z.array(assignmentQuestionSchema).min(1, "At least one question is required"),
  dueDate: z.date(),
  groups: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
  createdBy: z.string(),
  maxAttempts: z.number().min(1).default(3),
  timeLimit: z.number().optional(), // in minutes
});

export const questionSubmissionSchema = z.object({
  questionId: z.string(),
  answer: z.string(),
  score: z.number().min(0).max(100),
  isCorrect: z.boolean(),
});

export const insertAssignmentSubmissionSchema = z.object({
  assignmentId: z.number(),
  userId: z.string(),
  questionSubmissions: z.array(questionSubmissionSchema),
  overallScore: z.number().min(0).max(100),
  submittedAt: z.date().default(() => new Date()),
  attemptNumber: z.number().min(1),
});

export const insertGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  members: z.array(z.string()).default([]),
  createdBy: z.string(),
  isActive: z.boolean().default(true),
});

export const insertContestParticipantSchema = z.object({
  contestId: z.number(),
  userId: z.string(),
  joinedAt: z.date().default(() => new Date()),
  rank: z.number().optional(),
  score: z.number().default(0),
});

export const insertAnnouncementSchema = z.object({
  title: z.string().min(1, "Announcement title is required"),
  content: z.string().min(1, "Announcement content is required"),
  targetGroups: z.array(z.string()).optional(),
  isGlobal: z.boolean().default(false),
  createdBy: z.string(),
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true),
});

// Type exports
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type InsertContest = z.infer<typeof insertContestSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type InsertAssignmentSubmission = z.infer<typeof insertAssignmentSubmissionSchema>;
export type AssignmentQuestion = z.infer<typeof assignmentQuestionSchema>;
export type QuestionSubmission = z.infer<typeof questionSubmissionSchema>;
export type MCQOption = z.infer<typeof mcqOptionSchema>;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertContestParticipant = z.infer<typeof insertContestParticipantSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type TestCase = z.infer<typeof testCaseSchema>;
export type StarterCode = z.infer<typeof starterCodeSchema>;
export type Example = z.infer<typeof exampleSchema>;