
import { ObjectId, Collection } from 'mongodb';
import { getDb } from './db';

// MongoDB document interfaces
export interface User {
  _id?: ObjectId;
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Problem {
  _id?: ObjectId;
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tags?: string[];
  constraints?: string;
  examples?: any;
  testCases?: any;
  timeLimit?: number;
  memoryLimit?: number;
  starterCode?: any;
  isPublic: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  _id?: ObjectId;
  id: number;
  problemId: number;
  userId: string;
  code: string;
  language: string;
  status: string;
  runtime?: number;
  memory?: number;
  score?: string;
  feedback?: string;
  submittedAt: Date;
}

export interface Contest {
  _id?: ObjectId;
  id: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  problems?: number[];
  participants?: string[];
  isPublic: boolean;
  prizePool?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  _id?: ObjectId;
  id: number;
  title: string;
  description?: string;
  problems?: number[];
  enrolledUsers?: string[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  _id?: ObjectId;
  id: number;
  userId: string;
  problemId: number;
  status: string;
  bestScore?: string;
  attempts: number;
  lastAttempt?: Date;
  solvedAt?: Date;
}

export interface Assignment {
  _id?: ObjectId;
  id: number;
  title: string;
  description?: string;
  problems?: number[];
  assignedTo?: string[];
  assignmentType: string;
  dueDate?: Date;
  maxAttempts: number;
  isVisible: boolean;
  autoGrade: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  _id?: ObjectId;
  id: number;
  name: string;
  description?: string;
  members?: string[];
  instructors?: string[];
  courseId?: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContestParticipant {
  _id?: ObjectId;
  id: number;
  contestId: number;
  userId: string;
  registeredAt: Date;
  score: string;
  rank?: number;
  submissions: number;
  lastSubmission?: Date;
}

export interface Announcement {
  _id?: ObjectId;
  id: number;
  title: string;
  content: string;
  type: string;
  targetAudience?: string[];
  isVisible: boolean;
  priority: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types for inserts
export type UpsertUser = Omit<User, '_id' | 'createdAt' | 'updatedAt'>;
export type InsertProblem = Omit<Problem, '_id' | 'id' | 'createdAt' | 'updatedAt'>;
export type InsertSubmission = Omit<Submission, '_id' | 'id' | 'submittedAt'>;
export type InsertContest = Omit<Contest, '_id' | 'id' | 'createdAt' | 'updatedAt'>;
export type InsertCourse = Omit<Course, '_id' | 'id' | 'createdAt' | 'updatedAt'>;
export type InsertUserProgress = Omit<UserProgress, '_id' | 'id'>;
export type InsertAssignment = Omit<Assignment, '_id' | 'id' | 'createdAt' | 'updatedAt'>;
export type InsertGroup = Omit<Group, '_id' | 'id' | 'createdAt' | 'updatedAt'>;
export type InsertContestParticipant = Omit<ContestParticipant, '_id' | 'id' | 'registeredAt'>;
export type InsertAnnouncement = Omit<Announcement, '_id' | 'id' | 'createdAt' | 'updatedAt'>;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getProblems(): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;
  createProblem(problem: InsertProblem): Promise<Problem>;
  updateProblem(id: number, problem: Partial<InsertProblem>): Promise<Problem>;
  deleteProblem(id: number): Promise<void>;
  getSubmissions(userId?: string, problemId?: number): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getUserSubmissionStats(userId: string): Promise<{
    total: number;
    accepted: number;
    streak: number;
  }>;
  getContests(): Promise<Contest[]>;
  getContest(id: number): Promise<Contest | undefined>;
  createContest(contest: InsertContest): Promise<Contest>;
  updateContest(id: number, contest: Partial<InsertContest>): Promise<Contest>;
  deleteContest(id: number): Promise<void>;
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getLeaderboard(limit?: number): Promise<Array<{
    user: User;
    problemsSolved: number;
    totalScore: number;
  }>>;
  getAssignments(): Promise<Assignment[]>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment>;
  deleteAssignment(id: number): Promise<void>;
  getUserAssignments(userId: string): Promise<Assignment[]>;
  getGroups(): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group>;
  deleteGroup(id: number): Promise<void>;
  getUserGroups(userId: string): Promise<Group[]>;
  getContestParticipants(contestId: number): Promise<ContestParticipant[]>;
  registerForContest(data: InsertContestParticipant): Promise<ContestParticipant>;
  updateContestParticipant(contestId: number, userId: string, data: Partial<InsertContestParticipant>): Promise<ContestParticipant>;
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
  getUserAnnouncements(userId: string): Promise<Announcement[]>;
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

export class MongoStorage implements IStorage {
  private async getNextId(collection: string): Promise<number> {
    const db = getDb();
    const counters = db.collection('counters');
    const result = await counters.findOneAndUpdate(
      { _id: collection },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    return result.seq;
  }

  async getUser(id: string): Promise<User | undefined> {
    const db = getDb();
    const users = db.collection<User>('users');
    const user = await users.findOne({ id });
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const db = getDb();
    const users = db.collection<User>('users');
    const now = new Date();
    
    const user = await users.findOneAndUpdate(
      { id: userData.id },
      {
        $set: {
          ...userData,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    return user!;
  }

  async getProblems(): Promise<Problem[]> {
    const db = getDb();
    const problems = db.collection<Problem>('problems');
    return await problems.find({ isPublic: true }).sort({ id: 1 }).toArray();
  }

  async getProblem(id: number): Promise<Problem | undefined> {
    const db = getDb();
    const problems = db.collection<Problem>('problems');
    const problem = await problems.findOne({ id });
    return problem || undefined;
  }

  async createProblem(problem: InsertProblem): Promise<Problem> {
    const db = getDb();
    const problems = db.collection<Problem>('problems');
    const now = new Date();
    const id = await this.getNextId('problems');
    
    const newProblem: Problem = {
      ...problem,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await problems.insertOne(newProblem);
    return newProblem;
  }

  async updateProblem(id: number, problem: Partial<InsertProblem>): Promise<Problem> {
    const db = getDb();
    const problems = db.collection<Problem>('problems');
    
    const updatedProblem = await problems.findOneAndUpdate(
      { id },
      { $set: { ...problem, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return updatedProblem!;
  }

  async deleteProblem(id: number): Promise<void> {
    const db = getDb();
    const problems = db.collection<Problem>('problems');
    await problems.deleteOne({ id });
  }

  async getSubmissions(userId?: string, problemId?: number): Promise<Submission[]> {
    const db = getDb();
    const submissions = db.collection<Submission>('submissions');
    const filter: any = {};
    
    if (userId) filter.userId = userId;
    if (problemId) filter.problemId = problemId;
    
    return await submissions.find(filter).sort({ submittedAt: -1 }).toArray();
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    const db = getDb();
    const submissions = db.collection<Submission>('submissions');
    const submission = await submissions.findOne({ id });
    return submission || undefined;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const db = getDb();
    const submissions = db.collection<Submission>('submissions');
    const id = await this.getNextId('submissions');
    
    const newSubmission: Submission = {
      ...submission,
      id,
      submittedAt: new Date(),
    };
    
    await submissions.insertOne(newSubmission);
    
    // Update user progress
    await this.updateUserProgress({
      userId: submission.userId,
      problemId: submission.problemId,
      status: submission.status === 'accepted' ? 'solved' : 'in_progress',
      bestScore: submission.score || undefined,
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
    const db = getDb();
    const submissions = db.collection<Submission>('submissions');
    
    const userSubmissions = await submissions.find({ userId }).sort({ submittedAt: -1 }).toArray();
    const total = userSubmissions.length;
    const accepted = userSubmissions.filter(s => s.status === 'accepted').length;
    
    // Calculate streak (simplified - count consecutive days with submissions)
    let streak = 0;
    const today = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * oneDayMs);
      const hasSubmission = userSubmissions.some(s => {
        const submissionDate = new Date(s.submittedAt!);
        return submissionDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasSubmission) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return { total, accepted, streak };
  }

  async getContests(): Promise<Contest[]> {
    const db = getDb();
    const contests = db.collection<Contest>('contests');
    return await contests.find({ isPublic: true }).sort({ startTime: 1 }).toArray();
  }

  async getContest(id: number): Promise<Contest | undefined> {
    const db = getDb();
    const contests = db.collection<Contest>('contests');
    const contest = await contests.findOne({ id });
    return contest || undefined;
  }

  async createContest(contest: InsertContest): Promise<Contest> {
    const db = getDb();
    const contests = db.collection<Contest>('contests');
    const now = new Date();
    const id = await this.getNextId('contests');
    
    const newContest: Contest = {
      ...contest,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await contests.insertOne(newContest);
    return newContest;
  }

  async updateContest(id: number, contest: Partial<InsertContest>): Promise<Contest> {
    const db = getDb();
    const contests = db.collection<Contest>('contests');
    
    const updatedContest = await contests.findOneAndUpdate(
      { id },
      { $set: { ...contest, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return updatedContest!;
  }

  async deleteContest(id: number): Promise<void> {
    const db = getDb();
    const contests = db.collection<Contest>('contests');
    await contests.deleteOne({ id });
  }

  async getCourses(): Promise<Course[]> {
    const db = getDb();
    const courses = db.collection<Course>('courses');
    return await courses.find({ isPublic: true }).sort({ id: 1 }).toArray();
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const db = getDb();
    const courses = db.collection<Course>('courses');
    const course = await courses.findOne({ id });
    return course || undefined;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const db = getDb();
    const courses = db.collection<Course>('courses');
    const now = new Date();
    const id = await this.getNextId('courses');
    
    const newCourse: Course = {
      ...course,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await courses.insertOne(newCourse);
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course> {
    const db = getDb();
    const courses = db.collection<Course>('courses');
    
    const updatedCourse = await courses.findOneAndUpdate(
      { id },
      { $set: { ...course, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return updatedCourse!;
  }

  async deleteCourse(id: number): Promise<void> {
    const db = getDb();
    const courses = db.collection<Course>('courses');
    await courses.deleteOne({ id });
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const db = getDb();
    const userProgress = db.collection<UserProgress>('userProgress');
    return await userProgress.find({ userId }).toArray();
  }

  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const db = getDb();
    const userProgress = db.collection<UserProgress>('userProgress');
    
    const existing = await userProgress.findOne({
      userId: progress.userId,
      problemId: progress.problemId
    });
    
    if (existing) {
      const updated = await userProgress.findOneAndUpdate(
        { userId: progress.userId, problemId: progress.problemId },
        {
          $set: progress,
          $inc: { attempts: 1 }
        },
        { returnDocument: 'after' }
      );
      return updated!;
    } else {
      const id = await this.getNextId('userProgress');
      const newProgress: UserProgress = { ...progress, id };
      await userProgress.insertOne(newProgress);
      return newProgress;
    }
  }

  async getLeaderboard(limit: number = 10): Promise<Array<{
    user: User;
    problemsSolved: number;
    totalScore: number;
  }>> {
    const db = getDb();
    const users = db.collection<User>('users');
    const userProgress = db.collection<UserProgress>('userProgress');
    
    const pipeline = [
      { $match: { status: 'solved' } },
      {
        $group: {
          _id: '$userId',
          problemsSolved: { $sum: 1 },
          totalScore: { $sum: { $toDouble: { $ifNull: ['$bestScore', '0'] } } }
        }
      },
      { $sort: { problemsSolved: -1, totalScore: -1 } },
      { $limit: limit }
    ];
    
    const leaderboardData = await userProgress.aggregate(pipeline).toArray();
    const result = [];
    
    for (const entry of leaderboardData) {
      const user = await users.findOne({ id: entry._id });
      if (user) {
        result.push({
          user,
          problemsSolved: entry.problemsSolved,
          totalScore: entry.totalScore
        });
      }
    }
    
    return result;
  }

  async getAssignments(): Promise<Assignment[]> {
    const db = getDb();
    const assignments = db.collection<Assignment>('assignments');
    return await assignments.find().sort({ createdAt: -1 }).toArray();
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    const db = getDb();
    const assignments = db.collection<Assignment>('assignments');
    const assignment = await assignments.findOne({ id });
    return assignment || undefined;
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const db = getDb();
    const assignments = db.collection<Assignment>('assignments');
    const now = new Date();
    const id = await this.getNextId('assignments');
    
    const newAssignment: Assignment = {
      ...assignment,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await assignments.insertOne(newAssignment);
    return newAssignment;
  }

  async updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment> {
    const db = getDb();
    const assignments = db.collection<Assignment>('assignments');
    
    const updatedAssignment = await assignments.findOneAndUpdate(
      { id },
      { $set: { ...assignment, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return updatedAssignment!;
  }

  async deleteAssignment(id: number): Promise<void> {
    const db = getDb();
    const assignments = db.collection<Assignment>('assignments');
    await assignments.deleteOne({ id });
  }

  async getUserAssignments(userId: string): Promise<Assignment[]> {
    const db = getDb();
    const assignments = db.collection<Assignment>('assignments');
    return await assignments.find({ assignedTo: { $in: [userId] } }).sort({ createdAt: -1 }).toArray();
  }

  async getGroups(): Promise<Group[]> {
    const db = getDb();
    const groups = db.collection<Group>('groups');
    return await groups.find().sort({ createdAt: -1 }).toArray();
  }

  async getGroup(id: number): Promise<Group | undefined> {
    const db = getDb();
    const groups = db.collection<Group>('groups');
    const group = await groups.findOne({ id });
    return group || undefined;
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const db = getDb();
    const groups = db.collection<Group>('groups');
    const now = new Date();
    const id = await this.getNextId('groups');
    
    const newGroup: Group = {
      ...group,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await groups.insertOne(newGroup);
    return newGroup;
  }

  async updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group> {
    const db = getDb();
    const groups = db.collection<Group>('groups');
    
    const updatedGroup = await groups.findOneAndUpdate(
      { id },
      { $set: { ...group, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return updatedGroup!;
  }

  async deleteGroup(id: number): Promise<void> {
    const db = getDb();
    const groups = db.collection<Group>('groups');
    await groups.deleteOne({ id });
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    const db = getDb();
    const groups = db.collection<Group>('groups');
    return await groups.find({
      $or: [
        { members: { $in: [userId] } },
        { instructors: { $in: [userId] } }
      ]
    }).sort({ createdAt: -1 }).toArray();
  }

  async getContestParticipants(contestId: number): Promise<ContestParticipant[]> {
    const db = getDb();
    const participants = db.collection<ContestParticipant>('contestParticipants');
    return await participants.find({ contestId }).sort({ rank: 1 }).toArray();
  }

  async registerForContest(data: InsertContestParticipant): Promise<ContestParticipant> {
    const db = getDb();
    const participants = db.collection<ContestParticipant>('contestParticipants');
    const id = await this.getNextId('contestParticipants');
    
    const participant: ContestParticipant = {
      ...data,
      id,
      registeredAt: new Date(),
      score: "0",
      submissions: 0,
    };
    
    await participants.insertOne(participant);
    return participant;
  }

  async updateContestParticipant(contestId: number, userId: string, data: Partial<InsertContestParticipant>): Promise<ContestParticipant> {
    const db = getDb();
    const participants = db.collection<ContestParticipant>('contestParticipants');
    
    const updated = await participants.findOneAndUpdate(
      { contestId, userId },
      { $set: data },
      { returnDocument: 'after' }
    );
    return updated!;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const db = getDb();
    const announcements = db.collection<Announcement>('announcements');
    return await announcements.find({ isVisible: true }).sort({ createdAt: -1 }).toArray();
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const db = getDb();
    const announcements = db.collection<Announcement>('announcements');
    const announcement = await announcements.findOne({ id });
    return announcement || undefined;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const db = getDb();
    const announcements = db.collection<Announcement>('announcements');
    const now = new Date();
    const id = await this.getNextId('announcements');
    
    const newAnnouncement: Announcement = {
      ...announcement,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await announcements.insertOne(newAnnouncement);
    return newAnnouncement;
  }

  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const db = getDb();
    const announcements = db.collection<Announcement>('announcements');
    
    const updatedAnnouncement = await announcements.findOneAndUpdate(
      { id },
      { $set: { ...announcement, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return updatedAnnouncement!;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    const db = getDb();
    const announcements = db.collection<Announcement>('announcements');
    await announcements.deleteOne({ id });
  }

  async getUserAnnouncements(userId: string): Promise<Announcement[]> {
    const db = getDb();
    const announcements = db.collection<Announcement>('announcements');
    return await announcements.find({
      isVisible: true,
      $or: [
        { targetAudience: { $in: ['all'] } },
        { targetAudience: { $in: [userId] } }
      ]
    }).sort({ createdAt: -1 }).toArray();
  }

  async getAdminAnalytics(): Promise<{
    totalUsers: number;
    totalProblems: number;
    totalSubmissions: number;
    activeContests: number;
    recentActivity: any[];
  }> {
    const db = getDb();
    const users = db.collection<User>('users');
    const problems = db.collection<Problem>('problems');
    const submissions = db.collection<Submission>('submissions');
    const contests = db.collection<Contest>('contests');
    
    const totalUsers = await users.countDocuments();
    const totalProblems = await problems.countDocuments();
    const totalSubmissions = await submissions.countDocuments();
    
    const now = new Date();
    const activeContests = await contests.countDocuments({
      startTime: { $lte: now },
      endTime: { $gte: now }
    });
    
    const recentActivity = await submissions.find()
      .sort({ submittedAt: -1 })
      .limit(10)
      .toArray();
    
    return {
      totalUsers,
      totalProblems,
      totalSubmissions,
      activeContests,
      recentActivity,
    };
  }

  async getAllUsers(): Promise<User[]> {
    const db = getDb();
    const users = db.collection<User>('users');
    return await users.find().sort({ createdAt: -1 }).toArray();
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const db = getDb();
    const users = db.collection<User>('users');
    
    const updatedUser = await users.findOneAndUpdate(
      { id: userId },
      { $set: { role, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return updatedUser!;
  }
}

export const storage = new MongoStorage();
