import {
  users,
  problems,
  submissions,
  contests,
  userProgress,
  contestSubmissions,
  type User,
  type UpsertUser,
  type Problem,
  type InsertProblem,
  type Submission,
  type InsertSubmission,
  type Contest,
  type InsertContest,
  type UserProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Problem operations
  getProblems(limit?: number, difficulty?: string): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;
  createProblem(problem: InsertProblem): Promise<Problem>;
  updateProblem(id: number, problem: Partial<InsertProblem>): Promise<Problem>;
  deleteProblem(id: number): Promise<void>;
  
  // Submission operations
  getSubmissions(userId?: string, problemId?: number): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: number, update: Partial<Submission>): Promise<Submission>;
  getSubmissionsByUser(userId: string, limit?: number): Promise<Submission[]>;
  
  // Contest operations
  getContests(): Promise<Contest[]>;
  getContest(id: number): Promise<Contest | undefined>;
  createContest(contest: InsertContest): Promise<Contest>;
  updateContest(id: number, contest: Partial<InsertContest>): Promise<Contest>;
  registerForContest(contestId: number, userId: string): Promise<void>;
  
  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, update: Partial<UserProgress>): Promise<UserProgress>;
  getLeaderboard(limit?: number): Promise<(UserProgress & { user: User })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Initialize user progress if new user
    await db
      .insert(userProgress)
      .values({ userId: user.id })
      .onConflictDoNothing();
    
    return user;
  }

  // Problem operations
  async getProblems(limit = 50, difficulty?: string): Promise<Problem[]> {
    let query = db.select().from(problems).where(eq(problems.status, "published"));
    
    if (difficulty) {
      query = query.where(and(eq(problems.status, "published"), eq(problems.difficulty, difficulty as any)));
    }
    
    return await query.orderBy(desc(problems.createdAt)).limit(limit);
  }

  async getProblem(id: number): Promise<Problem | undefined> {
    const [problem] = await db.select().from(problems).where(eq(problems.id, id));
    return problem;
  }

  async createProblem(problem: InsertProblem): Promise<Problem> {
    const [newProblem] = await db.insert(problems).values(problem).returning();
    return newProblem;
  }

  async updateProblem(id: number, problem: Partial<InsertProblem>): Promise<Problem> {
    const [updatedProblem] = await db
      .update(problems)
      .set({ ...problem, updatedAt: new Date() })
      .where(eq(problems.id, id))
      .returning();
    return updatedProblem;
  }

  async deleteProblem(id: number): Promise<void> {
    await db.delete(problems).where(eq(problems.id, id));
  }

  // Submission operations
  async getSubmissions(userId?: string, problemId?: number): Promise<Submission[]> {
    let query = db.select().from(submissions);
    
    if (userId && problemId) {
      query = query.where(and(eq(submissions.userId, userId), eq(submissions.problemId, problemId)));
    } else if (userId) {
      query = query.where(eq(submissions.userId, userId));
    } else if (problemId) {
      query = query.where(eq(submissions.problemId, problemId));
    }
    
    return await query.orderBy(desc(submissions.createdAt));
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db.insert(submissions).values(submission).returning();
    
    // Update user's total submissions
    await db
      .update(userProgress)
      .set({
        totalSubmissions: sql`${userProgress.totalSubmissions} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userProgress.userId, submission.userId));
    
    return newSubmission;
  }

  async updateSubmission(id: number, update: Partial<Submission>): Promise<Submission> {
    const [updatedSubmission] = await db
      .update(submissions)
      .set(update)
      .where(eq(submissions.id, id))
      .returning();
    
    // If submission was accepted, update user progress
    if (update.status === "accepted") {
      const submission = await db.select().from(submissions).where(eq(submissions.id, id));
      if (submission.length > 0) {
        await this.updateUserProgressOnSolve(submission[0].userId);
      }
    }
    
    return updatedSubmission;
  }

  async getSubmissionsByUser(userId: string, limit = 10): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.createdAt))
      .limit(limit);
  }

  // Contest operations
  async getContests(): Promise<Contest[]> {
    return await db.select().from(contests).orderBy(desc(contests.startTime));
  }

  async getContest(id: number): Promise<Contest | undefined> {
    const [contest] = await db.select().from(contests).where(eq(contests.id, id));
    return contest;
  }

  async createContest(contest: InsertContest): Promise<Contest> {
    const [newContest] = await db.insert(contests).values(contest).returning();
    return newContest;
  }

  async updateContest(id: number, contest: Partial<InsertContest>): Promise<Contest> {
    const [updatedContest] = await db
      .update(contests)
      .set({ ...contest, updatedAt: new Date() })
      .where(eq(contests.id, id))
      .returning();
    return updatedContest;
  }

  async registerForContest(contestId: number, userId: string): Promise<void> {
    await db
      .update(contests)
      .set({
        participants: sql`array_append(${contests.participants}, ${userId})`,
        updatedAt: new Date(),
      })
      .where(eq(contests.id, contestId));
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress;
  }

  async updateUserProgress(userId: string, update: Partial<UserProgress>): Promise<UserProgress> {
    const [updatedProgress] = await db
      .update(userProgress)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(userProgress.userId, userId))
      .returning();
    return updatedProgress;
  }

  async getLeaderboard(limit = 10): Promise<(UserProgress & { user: User })[]> {
    return await db
      .select({
        id: userProgress.id,
        userId: userProgress.userId,
        problemsSolved: userProgress.problemsSolved,
        totalSubmissions: userProgress.totalSubmissions,
        currentStreak: userProgress.currentStreak,
        maxStreak: userProgress.maxStreak,
        lastSolvedAt: userProgress.lastSolvedAt,
        totalPoints: userProgress.totalPoints,
        contestRank: userProgress.contestRank,
        updatedAt: userProgress.updatedAt,
        user: users,
      })
      .from(userProgress)
      .innerJoin(users, eq(userProgress.userId, users.id))
      .orderBy(desc(userProgress.totalPoints), desc(userProgress.problemsSolved))
      .limit(limit);
  }

  // Helper method to update user progress when they solve a problem
  private async updateUserProgressOnSolve(userId: string): Promise<void> {
    const progress = await this.getUserProgress(userId);
    if (progress) {
      const now = new Date();
      const lastSolved = progress.lastSolvedAt;
      
      let newStreak = 1;
      if (lastSolved) {
        const daysDiff = Math.floor((now.getTime() - lastSolved.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          newStreak = progress.currentStreak + 1;
        } else if (daysDiff === 0) {
          newStreak = progress.currentStreak;
        }
      }
      
      await this.updateUserProgress(userId, {
        problemsSolved: progress.problemsSolved + 1,
        currentStreak: newStreak,
        maxStreak: Math.max(progress.maxStreak, newStreak),
        lastSolvedAt: now,
        totalPoints: progress.totalPoints + 100, // Base points for solving a problem
      });
    }
  }
}

export const storage = new DatabaseStorage();
