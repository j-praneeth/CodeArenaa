import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProblemSchema, insertSubmissionSchema, insertContestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user progress
      const progress = await storage.getUserProgress(userId);
      
      res.json({ ...user, progress });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Problem routes
  app.get('/api/problems', async (req, res) => {
    try {
      const { difficulty, limit } = req.query;
      const problems = await storage.getProblems(
        limit ? parseInt(limit as string) : undefined,
        difficulty as string
      );
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
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const problemData = insertProblemSchema.parse({ ...req.body, createdBy: userId });
      const problem = await storage.createProblem(problemData);
      res.status(201).json(problem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid problem data", errors: error.errors });
      }
      console.error("Error creating problem:", error);
      res.status(500).json({ message: "Failed to create problem" });
    }
  });

  app.put('/api/problems/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const problemData = insertProblemSchema.partial().parse(req.body);
      const problem = await storage.updateProblem(id, problemData);
      res.json(problem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid problem data", errors: error.errors });
      }
      console.error("Error updating problem:", error);
      res.status(500).json({ message: "Failed to update problem" });
    }
  });

  app.delete('/api/problems/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteProblem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting problem:", error);
      res.status(500).json({ message: "Failed to delete problem" });
    }
  });

  // Submission routes
  app.get('/api/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { problemId } = req.query;
      
      const submissions = await storage.getSubmissions(
        userId,
        problemId ? parseInt(problemId as string) : undefined
      );
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post('/api/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissionData = insertSubmissionSchema.parse({ ...req.body, userId });
      
      const submission = await storage.createSubmission(submissionData);
      
      // Mock code execution - in a real implementation, this would be async
      const problem = await storage.getProblem(submission.problemId);
      if (problem) {
        const mockResult = mockCodeExecution(submission.code, problem.testCases);
        await storage.updateSubmission(submission.id, mockResult);
      }
      
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.get('/api/submissions/user/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      // Users can only see their own submissions unless they're admin
      if (requestedUserId !== currentUserId && currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const submissions = await storage.getSubmissionsByUser(requestedUserId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching user submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
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
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const contestData = insertContestSchema.parse({ ...req.body, createdBy: userId });
      const contest = await storage.createContest(contestData);
      res.status(201).json(contest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contest data", errors: error.errors });
      }
      console.error("Error creating contest:", error);
      res.status(500).json({ message: "Failed to create contest" });
    }
  });

  app.post('/api/contests/:id/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contestId = parseInt(req.params.id);
      
      await storage.registerForContest(contestId, userId);
      res.json({ message: "Successfully registered for contest" });
    } catch (error) {
      console.error("Error registering for contest:", error);
      res.status(500).json({ message: "Failed to register for contest" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const { limit } = req.query;
      const leaderboard = await storage.getLeaderboard(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // User progress routes
  app.get('/api/progress/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      // Users can only see their own progress unless they're admin
      if (requestedUserId !== currentUserId && currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const progress = await storage.getUserProgress(requestedUserId);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Mock code execution function
function mockCodeExecution(code: string, testCases: any): any {
  // This is a simplified mock execution
  // In a real implementation, this would run in a sandboxed environment
  
  const hasBasicStructure = code.includes('def ') || code.includes('function ') || code.includes('class ');
  const isNotEmpty = code.trim().length > 10;
  
  if (!hasBasicStructure || !isNotEmpty) {
    return {
      status: "runtime_error",
      runtime: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 1000),
      testCaseResults: testCases.map(() => ({ passed: false, error: "Runtime error" }))
    };
  }
  
  // Mock success/failure based on code quality indicators
  const hasGoodStructure = code.includes('return') || code.includes('print');
  const isAccepted = hasGoodStructure && Math.random() > 0.3; // 70% success rate for good code
  
  return {
    status: isAccepted ? "accepted" : "wrong_answer",
    runtime: Math.floor(Math.random() * 500) + 50,
    memory: Math.floor(Math.random() * 2000) + 500,
    testCaseResults: testCases.map(() => ({ 
      passed: isAccepted, 
      error: isAccepted ? null : "Wrong answer" 
    }))
  };
}
