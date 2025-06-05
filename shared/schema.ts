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

export const insertProblemSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.string(),
  tags: z.array(z.string()).optional(),
  constraints: z.string().optional(),
  examples: z.any().optional(),
  testCases: z.any().optional(),
  timeLimit: z.number().default(1000),
  memoryLimit: z.number().default(256),
  starterCode: z.any().optional(),
  isPublic: z.boolean().default(true),
  createdBy: z.string().optional(),
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

export const insertAssignmentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  problems: z.array(z.number()).optional(),
  assignedTo: z.array(z.string()).optional(),
  assignmentType: z.string(),
  dueDate: z.date().optional(),
  maxAttempts: z.number().default(3),
  isVisible: z.boolean().default(true),
  autoGrade: z.boolean().default(true),
  createdBy: z.string().optional(),
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
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertContestParticipant = z.infer<typeof insertContestParticipantSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;