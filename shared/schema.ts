import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Problems table
export const problems = pgTable("problems", {
  id: integer("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty").notNull(),
  tags: jsonb("tags"),
  constraints: text("constraints"),
  inputFormat: text("input_format"),
  outputFormat: text("output_format"),
  examples: jsonb("examples"),
  testCases: jsonb("test_cases"),
  timeLimit: integer("time_limit").default(1000),
  memoryLimit: integer("memory_limit").default(256),
  starterCode: jsonb("starter_code"),
  isPublic: boolean("is_public").default(true),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Problem = typeof problems.$inferSelect;
export type InsertProblem = typeof problems.$inferInsert;

// Submissions table
export const submissions = pgTable("submissions", {
  id: integer("id").primaryKey(),
  problemId: integer("problem_id").notNull(),
  userId: varchar("user_id").notNull(),
  code: text("code").notNull(),
  language: varchar("language").notNull(),
  status: varchar("status").notNull(),
  runtime: integer("runtime"),
  memory: integer("memory"),
  score: varchar("score"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

export const insertUserSchema = createInsertSchema(users);
export const insertProblemSchema = createInsertSchema(problems);
export const insertSubmissionSchema = createInsertSchema(submissions);

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
  modules: z.array(z.number()).optional(),
  enrolledUsers: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
  createdBy: z.string().optional(),
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
  userId: z.string(),
  courseId: z.number(),
  completedModules: z.array(z.number()).default([]),
  progress: z.number().min(0).max(100).default(0),
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
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

export const assignmentQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["mcq", "coding"]),
  title: z.string().min(1, "Question title is required"),
  description: z.string().min(1, "Question description is required"),
  points: z.number().min(1, "Points must be at least 1"),
  
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
}).refine((data) => {
  if (data.type === 'mcq') {
    return Array.isArray(data.options) && data.options.length >= 2;
  }
  return true;
}, {
  message: "MCQ questions must have at least 2 options"
}).refine((data) => {
  if (data.type === 'mcq' && data.options) {
    return data.options.some(opt => opt.isCorrect);
  }
  return true;
}, {
  message: "MCQ questions must have at least one correct answer"
});

export const insertAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  courseTag: z.string().min(1, "Course tag is required"),
  deadline: z.union([z.string(), z.date()]).optional().transform(val => 
    val ? new Date(val) : undefined
  ),
  questions: z.array(assignmentQuestionSchema).min(1, "At least one question is required"),
  maxAttempts: z.number().min(1, "Max attempts must be at least 1").default(3),
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