import {
  users,
  problems,
  submissions,
  contests,
  courses,
  userProgress,
  assignments,
  groups,
  contestParticipants,
  announcements,
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
  type Assignment,
  type InsertAssignment,
  type Group,
  type InsertGroup,
  type ContestParticipant,
  type InsertContestParticipant,
  type Announcement,
  type InsertAnnouncement,
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
  
  // Assignment operations
  getAssignments(): Promise<Assignment[]>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment>;
  deleteAssignment(id: number): Promise<void>;
  getUserAssignments(userId: string): Promise<Assignment[]>;
  
  // Group operations
  getGroups(): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group>;
  deleteGroup(id: number): Promise<void>;
  getUserGroups(userId: string): Promise<Group[]>;
  
  // Contest participant operations
  getContestParticipants(contestId: number): Promise<ContestParticipant[]>;
  registerForContest(data: InsertContestParticipant): Promise<ContestParticipant>;
  updateContestParticipant(contestId: number, userId: string, data: Partial<InsertContestParticipant>): Promise<ContestParticipant>;
  
  // Announcement operations
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
  getUserAnnouncements(userId: string): Promise<Announcement[]>;
  
  // Admin analytics operations
  getAdminAnalytics(): Promise<{
    totalUsers: number;
    totalProblems: number;
    totalSubmissions: number;
    activeContests: number;
    recentActivity: any[];
  }>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
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
    let baseQuery = db.select().from(submissions);
    
    if (userId && problemId) {
      return await baseQuery.where(and(eq(submissions.userId, userId), eq(submissions.problemId, problemId))).orderBy(desc(submissions.submittedAt));
    } else if (userId) {
      return await baseQuery.where(eq(submissions.userId, userId)).orderBy(desc(submissions.submittedAt));
    } else if (problemId) {
      return await baseQuery.where(eq(submissions.problemId, problemId)).orderBy(desc(submissions.submittedAt));
    }
    
    return await baseQuery.orderBy(desc(submissions.submittedAt));
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
      bestScore: submission.score ? submission.score : undefined,
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
  
  // Assignment operations
  async getAssignments(): Promise<Assignment[]> {
    return await db.select().from(assignments).orderBy(desc(assignments.createdAt));
  }
  
  async getAssignment(id: number): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }
  
  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }
  
  async updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment> {
    const [updatedAssignment] = await db
      .update(assignments)
      .set({ ...assignment, updatedAt: new Date() })
      .where(eq(assignments.id, id))
      .returning();
    return updatedAssignment;
  }
  
  async deleteAssignment(id: number): Promise<void> {
    await db.delete(assignments).where(eq(assignments.id, id));
  }
  
  async getUserAssignments(userId: string): Promise<Assignment[]> {
    return await db
      .select()
      .from(assignments)
      .where(sql`${userId} = ANY(${assignments.assignedTo})`)
      .orderBy(desc(assignments.createdAt));
  }
  
  // Group operations
  async getGroups(): Promise<Group[]> {
    return await db.select().from(groups).orderBy(desc(groups.createdAt));
  }
  
  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }
  
  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }
  
  async updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group> {
    const [updatedGroup] = await db
      .update(groups)
      .set({ ...group, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return updatedGroup;
  }
  
  async deleteGroup(id: number): Promise<void> {
    await db.delete(groups).where(eq(groups.id, id));
  }
  
  async getUserGroups(userId: string): Promise<Group[]> {
    return await db
      .select()
      .from(groups)
      .where(sql`${userId} = ANY(${groups.members}) OR ${userId} = ANY(${groups.instructors})`)
      .orderBy(desc(groups.createdAt));
  }
  
  // Contest participant operations
  async getContestParticipants(contestId: number): Promise<ContestParticipant[]> {
    return await db
      .select()
      .from(contestParticipants)
      .where(eq(contestParticipants.contestId, contestId))
      .orderBy(asc(contestParticipants.rank));
  }
  
  async registerForContest(data: InsertContestParticipant): Promise<ContestParticipant> {
    const [participant] = await db.insert(contestParticipants).values(data).returning();
    return participant;
  }
  
  async updateContestParticipant(contestId: number, userId: string, data: Partial<InsertContestParticipant>): Promise<ContestParticipant> {
    const [updated] = await db
      .update(contestParticipants)
      .set(data)
      .where(and(eq(contestParticipants.contestId, contestId), eq(contestParticipants.userId, userId)))
      .returning();
    return updated;
  }
  
  // Announcement operations
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).where(eq(announcements.isVisible, true)).orderBy(desc(announcements.createdAt));
  }
  
  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }
  
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }
  
  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [updatedAnnouncement] = await db
      .update(announcements)
      .set({ ...announcement, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return updatedAnnouncement;
  }
  
  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }
  
  async getUserAnnouncements(userId: string): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(and(
        eq(announcements.isVisible, true),
        sql`'all' = ANY(${announcements.targetAudience}) OR ${userId} = ANY(${announcements.targetAudience})`
      ))
      .orderBy(desc(announcements.createdAt));
  }
  
  // Admin analytics operations
  async getAdminAnalytics(): Promise<{
    totalUsers: number;
    totalProblems: number;
    totalSubmissions: number;
    activeContests: number;
    recentActivity: any[];
  }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [problemCount] = await db.select({ count: sql<number>`count(*)` }).from(problems);
    const [submissionCount] = await db.select({ count: sql<number>`count(*)` }).from(submissions);
    const [activeContestCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contests)
      .where(and(
        sql`${contests.startTime} <= NOW()`,
        sql`${contests.endTime} >= NOW()`
      ));
    
    const recentSubmissions = await db
      .select()
      .from(submissions)
      .orderBy(desc(submissions.submittedAt))
      .limit(10);
    
    return {
      totalUsers: userCount.count,
      totalProblems: problemCount.count,
      totalSubmissions: submissionCount.count,
      activeContests: activeContestCount.count,
      recentActivity: recentSubmissions,
    };
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  
  async updateUserRole(userId: string, role: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
}

export const storage = new DatabaseStorage();
