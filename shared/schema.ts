import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
  role: varchar("role").notNull().default("student"), // student, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty").notNull(), // easy, medium, hard
  tags: text("tags").array(),
  constraints: text("constraints"),
  examples: jsonb("examples"), // Array of example inputs/outputs
  testCases: jsonb("test_cases"), // Array of test cases
  timeLimit: integer("time_limit").default(1000), // milliseconds
  memoryLimit: integer("memory_limit").default(256), // MB
  starterCode: jsonb("starter_code"), // Object with language -> code mappings
  isPublic: boolean("is_public").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id").references(() => problems.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  code: text("code").notNull(),
  language: varchar("language").notNull(),
  status: varchar("status").notNull(), // pending, accepted, wrong_answer, time_limit_exceeded, runtime_error
  runtime: integer("runtime"), // milliseconds
  memory: integer("memory"), // MB
  score: decimal("score", { precision: 5, scale: 2 }), // 0-100
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  problems: integer("problems").array(), // Array of problem IDs
  participants: text("participants").array(), // Array of user IDs
  isPublic: boolean("is_public").default(true),
  prizePool: decimal("prize_pool", { precision: 10, scale: 2 }),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  problems: integer("problems").array(), // Array of problem IDs in order
  enrolledUsers: text("enrolled_users").array(), // Array of user IDs
  isPublic: boolean("is_public").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  problemId: integer("problem_id").references(() => problems.id).notNull(),
  status: varchar("status").notNull(), // not_started, in_progress, solved
  bestScore: decimal("best_score", { precision: 5, scale: 2 }),
  attempts: integer("attempts").default(0),
  lastAttempt: timestamp("last_attempt"),
  solvedAt: timestamp("solved_at"),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  problems: integer("problems").array(), // Array of problem IDs
  assignedTo: text("assigned_to").array(), // Array of user IDs or group IDs
  assignmentType: varchar("assignment_type").notNull(), // individual, group, course
  dueDate: timestamp("due_date"),
  maxAttempts: integer("max_attempts").default(3),
  isVisible: boolean("is_visible").default(true),
  autoGrade: boolean("auto_grade").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  members: text("members").array(), // Array of user IDs
  instructors: text("instructors").array(), // Array of user IDs
  courseId: integer("course_id").references(() => courses.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contestParticipants = pgTable("contest_participants", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").references(() => contests.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  registeredAt: timestamp("registered_at").defaultNow(),
  score: decimal("score", { precision: 10, scale: 2 }).default("0"),
  rank: integer("rank"),
  submissions: integer("submissions").default(0),
  lastSubmission: timestamp("last_submission"),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").notNull(), // global, course, contest, assignment
  targetAudience: text("target_audience").array(), // Array of user IDs, group IDs, or "all"
  isVisible: boolean("is_visible").default(true),
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions),
  createdProblems: many(problems),
  createdContests: many(contests),
  createdCourses: many(courses),
  createdAssignments: many(assignments),
  createdGroups: many(groups),
  createdAnnouncements: many(announcements),
  progress: many(userProgress),
  contestParticipations: many(contestParticipants),
}));

export const problemsRelations = relations(problems, ({ one, many }) => ({
  creator: one(users, {
    fields: [problems.createdBy],
    references: [users.id],
  }),
  submissions: many(submissions),
  progress: many(userProgress),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  problem: one(problems, {
    fields: [submissions.problemId],
    references: [problems.id],
  }),
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
}));

export const contestsRelations = relations(contests, ({ one, many }) => ({
  creator: one(users, {
    fields: [contests.createdBy],
    references: [users.id],
  }),
  participants: many(contestParticipants),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  creator: one(users, {
    fields: [courses.createdBy],
    references: [users.id],
  }),
  groups: many(groups),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  problem: one(problems, {
    fields: [userProgress.problemId],
    references: [problems.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  creator: one(users, {
    fields: [assignments.createdBy],
    references: [users.id],
  }),
}));

export const groupsRelations = relations(groups, ({ one }) => ({
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [groups.courseId],
    references: [courses.id],
  }),
}));

export const contestParticipantsRelations = relations(contestParticipants, ({ one }) => ({
  contest: one(contests, {
    fields: [contestParticipants.contestId],
    references: [contests.id],
  }),
  user: one(users, {
    fields: [contestParticipants.userId],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  creator: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertProblemSchema = createInsertSchema(problems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
});

export const insertContestSchema = createInsertSchema(contests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContestParticipantSchema = createInsertSchema(contestParticipants).omit({
  id: true,
  registeredAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type Problem = typeof problems.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertContest = z.infer<typeof insertContestSchema>;
export type Contest = typeof contests.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertContestParticipant = z.infer<typeof insertContestParticipantSchema>;
export type ContestParticipant = typeof contestParticipants.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;
