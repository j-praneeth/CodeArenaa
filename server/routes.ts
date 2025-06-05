import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProblemSchema, insertSubmissionSchema, insertContestSchema, insertCourseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Problem routes
  app.get('/api/problems', async (req, res) => {
    try {
      const problems = await storage.getProblems();
      res.json(problems);
    } catch (error) {
      console.error("Error fetching problems:", error);
      res.status(500).json({ message: "Failed to fetch problems" });
    }
  });

  app.get('/api/problems/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const problem = await storage.getProblem(id);
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      res.json(problem);
    } catch (error) {
      console.error("Error fetching problem:", error);
      res.status(500).json({ message: "Failed to fetch problem" });
    }
  });

  app.post('/api/problems', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can create problems" });
      }

      const validatedData = insertProblemSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const problem = await storage.createProblem(validatedData);
      res.status(201).json(problem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating problem:", error);
      res.status(500).json({ message: "Failed to create problem" });
    }
  });

  // Submission routes
  app.get('/api/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const problemId = req.query.problemId ? parseInt(req.query.problemId as string) : undefined;
      
      const submissions = await storage.getSubmissions(userId, problemId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post('/api/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertSubmissionSchema.parse({
        ...req.body,
        userId,
        status: 'pending',
        submittedAt: new Date(),
      });

      // Mock code execution - replace with actual judge system
      const mockResult = mockExecuteCode(validatedData.code, validatedData.language);
      validatedData.status = mockResult.status;
      validatedData.runtime = mockResult.runtime;
      validatedData.memory = mockResult.memory;
      validatedData.score = mockResult.score;
      validatedData.feedback = mockResult.feedback;
      
      const submission = await storage.createSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // User stats route
  app.get('/api/users/:id/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id === 'me' ? req.user.claims.sub : req.params.id;
      const currentUserId = req.user.claims.sub;
      
      // Users can only view their own stats unless they're admin
      const currentUser = await storage.getUser(currentUserId);
      if (userId !== currentUserId && currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const stats = await storage.getUserSubmissionStats(userId);
      const progress = await storage.getUserProgress(userId);
      
      res.json({ ...stats, progress });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Contest routes
  app.get('/api/contests', async (req, res) => {
    try {
      const contests = await storage.getContests();
      res.json(contests);
    } catch (error) {
      console.error("Error fetching contests:", error);
      res.status(500).json({ message: "Failed to fetch contests" });
    }
  });

  app.get('/api/contests/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contest = await storage.getContest(id);
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      res.json(contest);
    } catch (error) {
      console.error("Error fetching contest:", error);
      res.status(500).json({ message: "Failed to fetch contest" });
    }
  });

  app.post('/api/contests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can create contests" });
      }

      const validatedData = insertContestSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const contest = await storage.createContest(validatedData);
      res.status(201).json(contest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating contest:", error);
      res.status(500).json({ message: "Failed to create contest" });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can create courses" });
      }

      const validatedData = insertCourseSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const course = await storage.createCourse(validatedData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Leaderboard route
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Mock code execution function - replace with actual judge system
function mockExecuteCode(code: string, language: string) {
  // Simple mock that randomly determines success/failure
  const isCorrect = Math.random() > 0.3; // 70% success rate
  const runtime = Math.floor(Math.random() * 1000) + 50; // 50-1050ms
  const memory = Math.floor(Math.random() * 100) + 20; // 20-120MB
  
  if (isCorrect) {
    return {
      status: 'accepted' as const,
      runtime,
      memory,
      score: "100.00",
      feedback: "All test cases passed!",
    };
  } else {
    const errorTypes = ['wrong_answer', 'time_limit_exceeded', 'runtime_error'];
    const status = errorTypes[Math.floor(Math.random() * errorTypes.length)] as any;
    const score = status === 'wrong_answer' ? (Math.floor(Math.random() * 80) + 10).toString() + ".00" : "0.00";
    
    const feedbacks = {
      wrong_answer: "Wrong answer on test case 2",
      time_limit_exceeded: "Time limit exceeded",
      runtime_error: "Runtime error: division by zero",
    };
    
    return {
      status,
      runtime: status === 'time_limit_exceeded' ? 1000 : runtime,
      memory,
      score,
      feedback: feedbacks[status],
    };
  }
}
