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
  title: z.string(),
  description: z.string().optional(),
  problems: z.array(z.number()).optional(),
  enrolledUsers: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
  createdBy: z.string().optional(),
});

export const insertUserProgressSchema = z.object({
  userId: z.string(),
  problemId: z.number(),
  status: z.string(),
  bestScore: z.string().optional(),
  attempts: z.number().default(0),
  lastAttempt: z.date().optional(),
  solvedAt: z.date().optional(),
});

// Assignment Question schemas
export const mcqOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export const assignmentQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["mcq", "coding"]),
  title: z.string(),
  description: z.string(),
  points: z.number().default(1),
  
  // MCQ specific fields
  options: z.array(mcqOptionSchema).optional(),
  
  // Coding specific fields
  problemStatement: z.string().optional(),
  inputFormat: z.string().optional(),
  outputFormat: z.string().optional(),
  examples: z.array(exampleSchema).optional(),
  testCases: z.array(testCaseSchema).optional(),
  hiddenTestCases: z.array(testCaseSchema).optional(),
  starterCode: starterCodeSchema.optional(),
  timeLimit: z.number().optional(),
  memoryLimit: z.number().optional(),
});

export const insertAssignmentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  courseTag: z.string(), // e.g., "JavaScript", "DSA", "Python"
  deadline: z.date().optional(),
  questions: z.array(assignmentQuestionSchema),
  maxAttempts: z.number().default(3),
  isVisible: z.boolean().default(true),
  autoGrade: z.boolean().default(true),
  createdBy: z.string().optional(),
});

// Assignment Submission schemas
export const questionSubmissionSchema = z.object({
  questionId: z.string(),
  type: z.enum(["mcq", "coding"]),
  
  // MCQ submission
  selectedOptionId: z.string().optional(),
  
  // Coding submission
  code: z.string().optional(),
  language: z.string().optional(),
  
  // Results
  isCorrect: z.boolean().optional(),
  score: z.number().optional(),
  feedback: z.string().optional(),
  runtime: z.number().optional(),
  memory: z.number().optional(),
});

export const insertAssignmentSubmissionSchema = z.object({
  assignmentId: z.number(),
  userId: z.string(),
  questionSubmissions: z.array(questionSubmissionSchema),
  totalScore: z.number().default(0),
  maxScore: z.number(),
  status: z.enum(["in_progress", "submitted", "graded"]).default("in_progress"),
  submittedAt: z.date().optional(),
  gradedAt: z.date().optional(),
  feedback: z.string().optional(),
});

export const insertGroupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  members: z.array(z.string()).optional(),
  instructors: z.array(z.string()).optional(),
  courseId: z.number().optional(),
  createdBy: z.string().optional(),
});

export const insertContestParticipantSchema = z.object({
  contestId: z.number(),
  userId: z.string(),
  score: z.string().default("0"),
  rank: z.number().optional(),
  submissions: z.number().default(0),
  lastSubmission: z.date().optional(),
});

export const insertAnnouncementSchema = z.object({
  title: z.string(),
  content: z.string(),
  type: z.string(),
  targetAudience: z.array(z.string()).optional(),
  isVisible: z.boolean().default(true),
  priority: z.string().default("normal"),
  createdBy: z.string().optional(),
});

// Export types for compatibility
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