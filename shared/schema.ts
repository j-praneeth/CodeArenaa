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
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("student").notNull(), // student, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const statusEnum = pgEnum("status", ["draft", "published", "archived"]);
export const submissionStatusEnum = pgEnum("submission_status", ["pending", "accepted", "wrong_answer", "time_limit_exceeded", "runtime_error"]);

// Problems table
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  tags: text("tags").array().default([]),
  testCases: jsonb("test_cases").notNull(), // Array of {input, expectedOutput}
  starterCode: jsonb("starter_code").notNull(), // Object with language keys
  constraints: text("constraints"),
  examples: jsonb("examples").notNull(), // Array of examples
  status: statusEnum("status").default("draft"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Submissions table
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  problemId: integer("problem_id").references(() => problems.id).notNull(),
  code: text("code").notNull(),
  language: varchar("language").notNull(),
  status: submissionStatusEnum("status").default("pending"),
  runtime: integer("runtime"), // in milliseconds
  memory: integer("memory"), // in KB
  testCaseResults: jsonb("test_case_results"), // Array of test case results
  createdAt: timestamp("created_at").defaultNow(),
});

// Contests table
export const contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  problemIds: integer("problem_ids").array().notNull(),
  participants: varchar("participants").array().default([]),
  prizePool: varchar("prize_pool"),
  status: statusEnum("status").default("draft"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contest Submissions table
export const contestSubmissions = pgTable("contest_submissions", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").references(() => contests.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  problemId: integer("problem_id").references(() => problems.id).notNull(),
  submissionId: integer("submission_id").references(() => submissions.id).notNull(),
  points: integer("points").default(0),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// User Progress table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  problemsSolved: integer("problems_solved").default(0),
  totalSubmissions: integer("total_submissions").default(0),
  currentStreak: integer("current_streak").default(0),
  maxStreak: integer("max_streak").default(0),
  lastSolvedAt: timestamp("last_solved_at"),
  totalPoints: integer("total_points").default(0),
  contestRank: integer("contest_rank"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  submissions: many(submissions),
  createdProblems: many(problems),
  createdContests: many(contests),
  progress: one(userProgress, {
    fields: [users.id],
    references: [userProgress.userId],
  }),
}));

export const problemsRelations = relations(problems, ({ many, one }) => ({
  submissions: many(submissions),
  creator: one(users, {
    fields: [problems.createdBy],
    references: [users.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  problem: one(problems, {
    fields: [submissions.problemId],
    references: [problems.id],
  }),
}));

export const contestsRelations = relations(contests, ({ one, many }) => ({
  creator: one(users, {
    fields: [contests.createdBy],
    references: [users.id],
  }),
  contestSubmissions: many(contestSubmissions),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertProblemSchema = createInsertSchema(problems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
  status: true,
  runtime: true,
  memory: true,
  testCaseResults: true,
});

export const insertContestSchema = createInsertSchema(contests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type Problem = typeof problems.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertContest = z.infer<typeof insertContestSchema>;
export type Contest = typeof contests.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type ContestSubmission = typeof contestSubmissions.$inferSelect;
