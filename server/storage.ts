import { ObjectId, Collection, Filter, UpdateFilter } from 'mongodb';
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
  password?: string;
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

export interface Course {
  _id?: ObjectId;
  id: number;
  title: string;
  description?: string;
  problems?: number[];
  modules?: number[];
  enrolledUsers?: string[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Simplified interface for essential operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  
  // Problem operations
  getProblems(): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;
  createProblem(problem: Partial<Problem>): Promise<Problem>;
  
  // Submission operations
  getSubmissions(userId: string, problemId?: number): Promise<Submission[]>;
  createSubmission(submission: Partial<Submission>): Promise<Submission>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: Partial<Course>): Promise<Course>;
  updateCourse(id: number, courseData: Partial<Course>): Promise<Course | null>;
  getCourseModules(courseId: number): Promise<any[]>;
  getCourseEnrollments(courseId: number): Promise<any[]>;
}

export class MemStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const db = getDb();
    try {
      const user = await db.collection('users').findOne(
        { id: id },
        { projection: { password: 0 } } // Don't return password
      );
      return user as User || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = getDb();
    try {
      const user = await db.collection('users').findOne({ email: email });
      return user as User || undefined;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const db = getDb();
    const newUser = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      const result = await db.collection('users').insertOne(newUser);
      return { ...newUser, _id: result.insertedId } as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Problem operations
  async getProblems(): Promise<Problem[]> {
    const db = getDb();
    try {
      const problems = await db.collection('problems')
        .find({ isPublic: true })
        .sort({ id: 1 })
        .toArray();
      return problems as Problem[];
    } catch (error) {
      console.error('Error fetching problems:', error);
      return [];
    }
  }

  async getProblem(id: number): Promise<Problem | undefined> {
    const db = getDb();
    try {
      const problem = await db.collection('problems').findOne({ id: id });
      return problem as Problem || undefined;
    } catch (error) {
      console.error('Error fetching problem:', error);
      return undefined;
    }
  }

  async createProblem(problemData: Partial<Problem>): Promise<Problem> {
    const db = getDb();
    const newProblem = {
      id: Date.now(), // Simple ID generation
      createdAt: new Date(),
      updatedAt: new Date(),
      ...problemData,
    };
    
    try {
      const result = await db.collection('problems').insertOne(newProblem);
      return { ...newProblem, _id: result.insertedId } as Problem;
    } catch (error) {
      console.error('Error creating problem:', error);
      throw new Error('Failed to create problem');
    }
  }

  // Submission operations
  async getSubmissions(userId: string, problemId?: number): Promise<Submission[]> {
    const db = getDb();
    try {
      const filter: Filter<any> = { userId: userId };
      if (problemId) {
        filter.problemId = problemId;
      }
      
      const submissions = await db.collection('submissions')
        .find(filter)
        .sort({ submittedAt: -1 })
        .toArray();
      return submissions as Submission[];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  }

  async createSubmission(submissionData: Partial<Submission>): Promise<Submission> {
    const db = getDb();
    const newSubmission = {
      id: Date.now(), // Simple ID generation
      ...submissionData,
      submittedAt: new Date(),
    };
    
    try {
      const result = await db.collection('submissions').insertOne(newSubmission);
      return { ...newSubmission, _id: result.insertedId } as Submission;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw new Error('Failed to create submission');
    }
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    const db = getDb();
    try {
      const courses = await db.collection('courses')
        .find({ isPublic: true })
        .sort({ id: 1 })
        .toArray();
      return courses as Course[];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const db = getDb();
    const newCourse = {
      id: Date.now(), // Simple ID generation
      ...courseData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      const result = await db.collection('courses').insertOne(newCourse);
      return { ...newCourse, _id: result.insertedId } as Course;
    } catch (error) {
      console.error('Error creating course:', error);
      throw new Error('Failed to create course');
    }
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const db = getDb();
    try {
      const course = await db.collection('courses').findOne({ id: id });
      return course as Course | undefined;
    } catch (error) {
      console.error('Error fetching course:', error);
      return undefined;
    }
  }

  async getCourseModules(courseId: number): Promise<any[]> {
    // For now, return empty array since modules functionality isn't fully implemented
    return [];
  }

  async getCourseEnrollments(courseId: number): Promise<any[]> {
    // For now, return empty array since enrollments functionality isn't fully implemented
    return [];
  }

  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course | null> {
    const db = getDb();
    try {
      const result = await db.collection('courses').findOneAndUpdate(
        { id: id },
        { 
          $set: { 
            ...courseData, 
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );
      return result as Course | null;
    } catch (error) {
      console.error('Error updating course:', error);
      return null;
    }
  }

  // Stub methods for compatibility
  async getAdminAnalytics(): Promise<any> { return {}; }
  async getAllUsers(): Promise<User[]> { return []; }
  async getAssignments(): Promise<any[]> { return []; }
  async getGroups(): Promise<any[]> { return []; }
  async getAnnouncements(): Promise<any[]> { return []; }
  async updateProblem(): Promise<any> { return null; }
  async deleteProblem(): Promise<void> { }
  async getUserSubmissionStats(): Promise<any> { return {}; }
  async getContests(): Promise<any[]> { return []; }
  async getContest(): Promise<any> { return null; }
  async createContest(): Promise<any> { return null; }

  async deleteCourseModule(): Promise<void> { }
  async deleteCourseEnrollment(): Promise<void> { }
  async deleteCourse(): Promise<void> { }
  async getCourseModule(): Promise<any> { return null; }
  async createCourseModule(): Promise<any> { return null; }
  async updateCourseModule(): Promise<any> { return null; }
  async enrollUserInCourse(): Promise<any> { return null; }
  async getUserCourseProgress(): Promise<any> { return null; }
  async markModuleComplete(): Promise<void> { }
  async getLeaderboard(): Promise<any[]> { return []; }
  async getAssignment(): Promise<any> { return null; }
  async createAssignment(): Promise<any> { return null; }
  async updateAssignment(): Promise<any> { return null; }
  async deleteAssignment(): Promise<void> { }
  async getAssignmentsByCourseTag(): Promise<any[]> { return []; }
  async getAssignmentSubmissions(): Promise<any[]> { return []; }
  async getUserAssignmentSubmission(): Promise<any> { return null; }
  async updateAssignmentSubmission(): Promise<any> { return null; }
  async createAssignmentSubmission(): Promise<any> { return null; }
  async getUserGroups(): Promise<any[]> { return []; }
  async createGroup(): Promise<any> { return null; }
  async getUserAnnouncements(): Promise<any[]> { return []; }
  async createAnnouncement(): Promise<any> { return null; }
  async registerForContest(): Promise<any> { return null; }
  async getContestParticipants(): Promise<any[]> { return []; }
  async updateUserRole(): Promise<any> { return null; }
}

export const storage = new MemStorage();