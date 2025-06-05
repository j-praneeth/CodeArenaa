import {
  users,
  problems,
  submissions,
  contests,
  courses,
  userProgress,
  type User,
  type UpsertUser,
  type Problem,
  type InsertProblem,
  type Submission,
  type InsertSubmission,
  type Contest,
  type InsertContest,
  type Course,
  type InsertCourse,
  type UserProgress,
  type InsertUserProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Problem operations
  getProblems(): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;
  createProblem(problem: InsertProblem): Promise<Problem>;
  updateProblem(id: number, problem: Partial<InsertProblem>): Promise<Problem>;
  deleteProblem(id: number): Promise<void>;
  
  // Submission operations
  getSubmissions(userId?: string, problemId?: number): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getUserSubmissionStats(userId: string): Promise<{
    total: number;
    accepted: number;
    streak: number;
  }>;
  
  // Contest operations
  getContests(): Promise<Contest[]>;
  getContest(id: number): Promise<Contest | undefined>;
  createContest(contest: InsertContest): Promise<Contest>;
  updateContest(id: number, contest: Partial<InsertContest>): Promise<Contest>;
  deleteContest(id: number): Promise<void>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  
  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  
  // Leaderboard operations
  getLeaderboard(limit?: number): Promise<Array<{
    user: User;
    problemsSolved: number;
    totalScore: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
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
    return user;
  }
  
  // Problem operations
  async getProblems(): Promise<Problem[]> {
    return await db.select().from(problems).where(eq(problems.isPublic, true)).orderBy(asc(problems.id));
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
    
    return await query.orderBy(desc(submissions.submittedAt));
  }
  
  async getSubmission(id: number): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }
  
  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db.insert(submissions).values(submission).returning();
    
    // Update user progress
    await this.updateUserProgress({
      userId: submission.userId,
      problemId: submission.problemId,
      status: submission.status === 'accepted' ? 'solved' : 'in_progress',
      bestScore: submission.score ? parseFloat(submission.score) : undefined,
      attempts: 1,
      lastAttempt: new Date(),
      solvedAt: submission.status === 'accepted' ? new Date() : undefined,
    });
    
    return newSubmission;
  }
  
  async getUserSubmissionStats(userId: string): Promise<{
    total: number;
    accepted: number;
    streak: number;
  }> {
    const userSubmissions = await db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.submittedAt));
    
    const total = userSubmissions.length;
    const accepted = userSubmissions.filter(s => s.status === 'accepted').length;
    
    // Calculate streak (simplified - count consecutive days with submissions)
    let streak = 0;
    const today = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today.getTime() - i * oneDayMs);
      const hasSubmission = userSubmissions.some(s => {
        const submissionDate = new Date(s.submittedAt!);
        return submissionDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasSubmission) {
        streak++;
      } else if (i > 0) { // Don't break on first day if no submission today
        break;
      }
    }
    
    return { total, accepted, streak };
  }
  
  // Contest operations
  async getContests(): Promise<Contest[]> {
    return await db.select().from(contests).where(eq(contests.isPublic, true)).orderBy(asc(contests.startTime));
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
  
  async deleteContest(id: number): Promise<void> {
    await db.delete(contests).where(eq(contests.id, id));
  }
  
  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isPublic, true)).orderBy(asc(courses.id));
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }
  
  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }
  
  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }
  
  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }
  
  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }
  
  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await db
      .select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, progress.userId),
        eq(userProgress.problemId, progress.problemId)
      ));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(userProgress)
        .set({
          ...progress,
          attempts: sql`${userProgress.attempts} + 1`,
        })
        .where(and(
          eq(userProgress.userId, progress.userId),
          eq(userProgress.problemId, progress.problemId)
        ))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db.insert(userProgress).values(progress).returning();
      return newProgress;
    }
  }
  
  // Leaderboard operations
  async getLeaderboard(limit: number = 10): Promise<Array<{
    user: User;
    problemsSolved: number;
    totalScore: number;
  }>> {
    const result = await db
      .select({
        user: users,
        problemsSolved: sql<number>`count(distinct ${userProgress.problemId})`.as('problems_solved'),
        totalScore: sql<number>`coalesce(sum(${userProgress.bestScore}), 0)`.as('total_score'),
      })
      .from(users)
      .leftJoin(userProgress, and(
        eq(users.id, userProgress.userId),
        eq(userProgress.status, 'solved')
      ))
      .groupBy(users.id)
      .orderBy(desc(sql`problems_solved`), desc(sql`total_score`))
      .limit(limit);
    
    return result.map(row => ({
      user: row.user,
      problemsSolved: row.problemsSolved,
      totalScore: row.totalScore,
    }));
  }
}

export const storage = new DatabaseStorage();
