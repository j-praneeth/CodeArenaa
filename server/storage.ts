import { ObjectId, Collection, Filter, UpdateFilter } from 'mongodb';
import { getDb, connectToMongoDB } from './db';

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
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  problems?: number[];
  modules?: number[];
  enrolledUsers?: string[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  rating?: number;
  enrollmentCount?: number;
  completionRate?: number;
}

export interface CourseModule {
  _id?: ObjectId;
  id: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
  textContent?: string;
  videoUrl?: string;
  codeExample?: string;
  language?: string;
  expectedOutput?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseEnrollment {
  _id?: ObjectId;
  id: number;
  courseId: number;
  userId: string;
  completedModules: number[];
  progress: number;
  enrolledAt: Date;
  lastAccessedAt: Date;
  notes?: { [moduleId: number]: string };
  bookmarkedModules?: number[];
}

export interface ModuleProgress {
  _id?: ObjectId;
  id: number;
  moduleId: number;
  userId: string;
  courseId: number;
  isCompleted: boolean;
  timeSpent: number;
  completedAt?: Date;
  notes?: string;
  bookmarked: boolean;
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
  deleteCourse(id: number): Promise<void>;
  
  // Course module operations
  getCourseModules(courseId: number): Promise<CourseModule[]>;
  getCourseModule(id: number): Promise<CourseModule | undefined>;
  createCourseModule(module: Partial<CourseModule>): Promise<CourseModule>;
  updateCourseModule(id: number, moduleData: Partial<CourseModule>): Promise<CourseModule | null>;
  deleteCourseModule(id: number): Promise<void>;
  
  // Course enrollment operations
  getCourseEnrollments(courseId?: number, userId?: string): Promise<CourseEnrollment[]>;
  enrollUserInCourse(userId: string, courseId: number): Promise<CourseEnrollment>;
  getUserCourseProgress(userId: string, courseId: number): Promise<ModuleProgress[]>;
  markModuleComplete(userId: string, moduleId: number, courseId: number, timeSpent: number, notes?: string): Promise<void>;
  bookmarkModule(userId: string, moduleId: number): Promise<void>;
  
  // Analytics operations
  getCourseStats(): Promise<any>;
  getAdminAnalytics(): Promise<any>;
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
    try {
      const db = await connectToMongoDB();
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
    try {
      const db = await connectToMongoDB();
      const courseId = Date.now();
      
      // Extract modules from course data
      const { modules, ...courseOnlyData } = courseData as any;
      
      const newCourse = {
        id: courseId,
        ...courseOnlyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('Creating course with data:', newCourse);
      const result = await db.collection('courses').insertOne(newCourse);
      console.log('Course created successfully with ID:', result.insertedId);
      
      // Create separate module documents if modules exist
      if (modules && modules.length > 0) {
        console.log('Creating course modules:', modules);
        const moduleDocuments = modules.map((module: any, index: number) => ({
          id: Date.now() + index, // Ensure unique IDs
          courseId: courseId,
          title: module.title,
          description: module.description,
          order: module.order || index + 1,
          textContent: module.textContent || '',
          videoUrl: module.videoUrl || '',
          codeExample: module.codeExample || '',
          language: module.language || '',
          expectedOutput: module.expectedOutput || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        
        await db.collection('courseModules').insertMany(moduleDocuments);
        console.log('Course modules created successfully');
      }
      
      return { ...newCourse, _id: result.insertedId } as Course;
    } catch (error) {
      console.error('Error creating course:', error);
      throw new Error('Failed to create course');
    }
  }

  async getCourse(id: number): Promise<Course | undefined> {
    try {
      const db = await connectToMongoDB();
      const course = await db.collection('courses').findOne({ id: id });
      return course as Course | undefined;
    } catch (error) {
      console.error('Error fetching course:', error);
      return undefined;
    }
  }

  async getCourseModules(courseId: number): Promise<CourseModule[]> {
    try {
      const db = await connectToMongoDB();
      const modules = await db.collection('courseModules')
        .find({ courseId: courseId })
        .sort({ order: 1 })
        .toArray();
      return modules as CourseModule[];
    } catch (error) {
      console.error('Error fetching course modules:', error);
      return [];
    }
  }

  async getCourseEnrollments(courseId?: number, userId?: string): Promise<any[]> {
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
  async getCourseModule(id: number): Promise<CourseModule | undefined> {
    try {
      const db = await connectToMongoDB();
      const module = await db.collection('courseModules').findOne({ id: id });
      return module as CourseModule || undefined;
    } catch (error) {
      console.error('Error fetching course module:', error);
      return undefined;
    }
  }
  async createCourseModule(moduleData: Partial<CourseModule>): Promise<CourseModule> {
    try {
      const db = await connectToMongoDB();
      const newModule = {
        id: Date.now(),
        ...moduleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('Creating course module with data:', newModule);
      const result = await db.collection('courseModules').insertOne(newModule);
      console.log('Course module created successfully with ID:', result.insertedId);
      return { ...newModule, _id: result.insertedId } as CourseModule;
    } catch (error) {
      console.error('Error creating course module:', error);
      throw new Error('Failed to create course module');
    }
  }
  async updateCourseModule(id: number, moduleData: Partial<CourseModule>): Promise<CourseModule | null> {
    try {
      const db = await connectToMongoDB();
      const updateData = {
        ...moduleData,
        updatedAt: new Date(),
      };
      
      const result = await db.collection('courseModules').findOneAndUpdate(
        { id: id },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result as CourseModule || null;
    } catch (error) {
      console.error('Error updating course module:', error);
      return null;
    }
  }
  async enrollUserInCourse(): Promise<any> { return null; }
  async getUserCourseProgress(): Promise<any> { return null; }
  async markModuleComplete(): Promise<void> { }
  async bookmarkModule(userId: string, moduleId: number): Promise<void> { }
  async getCourseStats(): Promise<any> { return {}; }
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