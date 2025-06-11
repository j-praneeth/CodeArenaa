import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { 
  insertProblemSchema, 
  insertSubmissionSchema, 
  insertContestSchema, 
  insertCourseSchema,
  insertCourseModuleSchema,
  insertCourseEnrollmentSchema,
  insertAssignmentSchema,
  insertGroupSchema,
  insertAnnouncementSchema 
} from "@shared/schema";
import { z } from "zod";

// Admin middleware for Replit auth
const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const userId = req.user.user.id;
  const user = await storage.getUser(userId);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin routes
  app.get('/api/admin/analytics', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const analytics = await storage.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      res.status(500).json({ message: "Failed to fetch admin analytics" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/assignments', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const assignments = await storage.getAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get('/api/admin/groups', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get('/api/admin/announcements', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Problem routes
  app.get('/api/problems', isAuthenticated, async (req, res) => {
    try {
      const problems = await storage.getProblems();
      res.json(problems);
    } catch (error) {
      console.error("Error fetching problems:", error);
      res.status(500).json({ message: "Failed to fetch problems" });
    }
  });

  app.get('/api/problems/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/problems', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.sub || req.user.claims?.sub || req.user.id;
      if (!userId) {
        console.error('[DEBUG] No user ID found in request:', req.user);
        return res.status(401).json({ message: "User ID not found" });
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

  // Add PUT endpoint for updating problems
  app.put('/api/problems/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const problemId = parseInt(req.params.id);
      const userId = req.user.sub || req.user.claims?.sub || req.user.id;
      
      if (!userId) {
        console.error('[DEBUG] No user ID found in request:', req.user);
        return res.status(401).json({ message: "User ID not found" });
      }

      // First check if the problem exists
      const existingProblem = await storage.getProblem(problemId);
      if (!existingProblem) {
        return res.status(404).json({ message: "Problem not found" });
      }

      // Validate the update data
      const validatedData = insertProblemSchema.parse({
        ...req.body,
        updatedBy: userId,
        updatedAt: new Date()
      });

      console.log('[DEBUG] Updating problem:', { problemId, data: validatedData });
      
      // Update the problem
      const updatedProblem = await storage.updateProblem(problemId, validatedData);
      if (!updatedProblem) {
        return res.status(404).json({ message: "Problem not found" });
      }

      console.log('[DEBUG] Problem updated successfully:', updatedProblem);
      res.json(updatedProblem);
    } catch (error) {
      console.error('[DEBUG] Error updating problem:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update problem" });
    }
  });

  // Add DELETE endpoint for problems
  app.delete('/api/problems/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const problemId = parseInt(req.params.id);
      
      // First check if the problem exists
      const existingProblem = await storage.getProblem(problemId);
      if (!existingProblem) {
        return res.status(404).json({ message: "Problem not found" });
      }

      console.log('[DEBUG] Deleting problem:', problemId);
      
      // Delete the problem
      await storage.deleteProblem(problemId);
      res.status(204).send();
    } catch (error) {
      console.error('[DEBUG] Error deleting problem:', error);
      res.status(500).json({ message: "Failed to delete problem" });
    }
  });

  // Submission routes
  app.get('/api/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub || req.user.claims?.sub || req.user.id;
      if (!userId) {
        console.error('[DEBUG] No user ID found in request:', req.user);
        return res.status(401).json({ message: "User ID not found" });
      }

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
      const userId = req.user.sub || req.user.claims?.sub || req.user.id;
      if (!userId) {
        console.error('[DEBUG] No user ID found in request:', req.user);
        return res.status(401).json({ message: "User ID not found" });
      }

      const { isTest, ...submissionData } = req.body;
      
      const validatedData = insertSubmissionSchema.parse({
        ...submissionData,
        userId,
        status: 'pending',
        submittedAt: new Date(),
      });

      // Mock code execution - replace with actual judge system
      const mockResult = mockExecuteCode(validatedData.code, validatedData.language);
      
      if (isTest) {
        // For test runs, return results immediately without saving to database
        return res.json({ 
          results: [{
            passed: mockResult.status === 'accepted',
            input: mockResult.input,
            output: mockResult.actualOutput,
            expectedOutput: mockResult.expectedOutput,
            isHidden: false,
            error: mockResult.error,
            runtime: mockResult.runtime,
            memory: mockResult.memory
          }]
        });
      }

      // For actual submissions, save to database
      validatedData.status = mockResult.status;
      validatedData.runtime = mockResult.runtime;
      validatedData.memory = mockResult.memory;
      validatedData.score = mockResult.score;
      validatedData.feedback = mockResult.error || 'Solution accepted';
      
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
  app.get('/api/users/me/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.user.id;
      if (!userId) {
        console.error('[DEBUG] No user ID found in request:', req.user);
        return res.status(401).json({ message: "User ID not found" });
      }

      const stats = await storage.getUserSubmissionStats(userId);
      res.json(stats);
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
  app.get('/api/courses', async (req: any, res) => {
    try {
      // Always fetch all public courses from the database
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

  app.post('/api/courses', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.user.id;

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

  // Course Module routes
  app.get('/api/courses/:id/modules', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const modules = await storage.getCourseModules(courseId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching course modules:", error);
      res.status(500).json({ message: "Failed to fetch course modules" });
    }
  });

  app.get('/api/modules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const module = await storage.getCourseModule(id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error fetching module:", error);
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  app.post('/api/courses/:id/modules', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const validatedData = insertCourseModuleSchema.parse({
        ...req.body,
        courseId,
      });
      
      const module = await storage.createCourseModule(validatedData);
      res.status(201).json(module);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating module:", error);
      res.status(500).json({ message: "Failed to create module" });
    }
  });

  app.put('/api/modules/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCourseModuleSchema.partial().parse(req.body);
      
      const module = await storage.updateCourseModule(id, validatedData);
      res.json(module);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating module:", error);
      res.status(500).json({ message: "Failed to update module" });
    }
  });

  app.delete('/api/modules/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCourseModule(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting module:", error);
      res.status(500).json({ message: "Failed to delete module" });
    }
  });

  // Course Enrollment routes
  app.post('/api/courses/:id/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.user.id;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      const courseId = parseInt(req.params.id);
      const enrollment = await storage.enrollUserInCourse(courseId, userId);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  app.get('/api/users/me/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.user.id;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      const enrollments = await storage.getCourseEnrollments(undefined, userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      res.status(500).json({ message: "Failed to fetch user enrollments" });
    }
  });

  app.get('/api/courses/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.user.id;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      const courseId = parseInt(req.params.id);
      const progress = await storage.getUserCourseProgress(courseId, userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching course progress:", error);
      res.status(500).json({ message: "Failed to fetch course progress" });
    }
  });

  app.post('/api/courses/:courseId/modules/:moduleId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.user.id;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      const courseId = parseInt(req.params.courseId);
      const moduleId = parseInt(req.params.moduleId);
      
      const enrollment = await storage.markModuleComplete(courseId, moduleId, userId);
      res.json(enrollment);
    } catch (error) {
      console.error("Error marking module complete:", error);
      res.status(500).json({ message: "Failed to mark module complete" });
    }
  });

  // Code execution route for course modules
  app.post('/api/modules/execute', isAuthenticated, async (req: any, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ message: "Code and language are required" });
      }

      // Mock code execution - replace with actual judge system
      const mockResult = mockExecuteCode(code, language);
      
      res.json({
        success: mockResult.status === 'accepted',
        output: mockResult.actualOutput,
        error: mockResult.error,
        runtime: mockResult.runtime,
        memory: mockResult.memory
      });
    } catch (error) {
      console.error("Error executing code:", error);
      res.status(500).json({ message: "Failed to execute code" });
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

  // Assignment routes
  app.get('/api/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const assignments = await storage.getAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get('/api/assignments/:id', isAuthenticated, async (req: any, res) => {
    try {
      console.log('[DEBUG] Fetching assignment:', req.params.id);
      const id = parseInt(req.params.id);
      const assignment = await storage.getAssignment(id);
      
      if (!assignment) {
        console.log('[DEBUG] Assignment not found:', id);
        return res.status(404).json({ message: "Assignment not found" });
      }

      if (!assignment.isVisible) {
        console.log('[DEBUG] Assignment not visible:', id);
        return res.status(403).json({ message: "Assignment is not available" });
      }

      console.log('[DEBUG] Assignment found:', assignment);
      res.json(assignment);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      res.status(500).json({ message: "Failed to fetch assignment" });
    }
  });

  app.post('/api/assignments', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.sub || req.user.claims?.sub || req.user.id;
      if (!userId) {
        console.error('[DEBUG] No user ID found in request:', req.user);
        return res.status(401).json({ message: "User ID not found" });
      }

      console.log('[DEBUG] Creating assignment with data:', req.body);

      // Validate MCQ questions have at least one correct answer
      for (const question of req.body.questions || []) {
        if (question.type === 'mcq') {
          if (!question.options || question.options.length < 2) {
            return res.status(400).json({ 
              message: "Invalid data", 
              errors: [`Question "${question.title}" must have at least 2 options`] 
            });
          }

          const hasCorrectAnswer = question.options.some((opt: any) => opt.isCorrect);
          if (!hasCorrectAnswer) {
            return res.status(400).json({ 
              message: "Invalid data", 
              errors: [`Question "${question.title}" must have at least one correct answer`] 
            });
          }
        }
      }

      // Prepare the data for validation
      const data = {
        ...req.body,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
        questions: req.body.questions.map((q: any) => ({
          ...q,
          points: Number(q.points),
          timeLimit: q.timeLimit ? Number(q.timeLimit) : undefined,
          memoryLimit: q.memoryLimit ? Number(q.memoryLimit) : undefined,
          options: q.type === 'mcq' ? q.options?.map((opt: any) => ({
            ...opt,
            isCorrect: !!opt.isCorrect
          })) : undefined
        })),
        maxAttempts: Number(req.body.maxAttempts) || 3,
        isVisible: !!req.body.isVisible,
        autoGrade: !!req.body.autoGrade,
        createdBy: userId
      };

      console.log('[DEBUG] Validating assignment data:', data);
      const validatedData = insertAssignmentSchema.parse(data);
      
      console.log('[DEBUG] Creating assignment in storage');
      const assignment = await storage.createAssignment(validatedData);
      
      console.log('[DEBUG] Assignment created successfully:', assignment);
      res.status(201).json(assignment);
    } catch (error) {
      console.error('[DEBUG] Error creating assignment:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors.map(e => e.message)
        });
      }
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  app.put('/api/assignments/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const assignment = await storage.updateAssignment(id, req.body);
      res.json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating assignment:", error);
      res.status(500).json({ message: "Failed to update assignment" });
    }
  });

  app.delete('/api/assignments/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAssignment(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });

  // Assignment filtering by course tag
  app.get('/api/assignments/course/:courseTag', isAuthenticated, async (req: any, res) => {
    try {
      const courseTag = req.params.courseTag;
      const assignments = await storage.getAssignmentsByCourseTag(courseTag);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments by course tag:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Assignment submission routes
  app.get('/api/assignments/:id/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === 'admin') {
        // Admin can see all submissions for this assignment
        const submissions = await storage.getAssignmentSubmissions(assignmentId);
        res.json(submissions);
      } else {
        // Students can only see their own submission
        const submission = await storage.getUserAssignmentSubmission(assignmentId, userId);
        res.json(submission ? [submission] : []);
      }
    } catch (error) {
      console.error("Error fetching assignment submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get('/api/assignments/:id/submission', isAuthenticated, async (req: any, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const userId = req.user.sub || req.user.claims?.sub || req.user.id;
      
      console.log('[DEBUG] Fetching submission:', { assignmentId, userId });
      
      if (!userId) {
        console.error('[DEBUG] No user ID found in request:', req.user);
        return res.status(401).json({ message: "User ID not found" });
      }
      
      const submission = await storage.getUserAssignmentSubmission(assignmentId, userId);
      console.log('[DEBUG] Submission found:', !!submission);
      
      res.json(submission);
    } catch (error) {
      console.error("Error fetching user assignment submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  app.post('/api/assignments/:id/submission', isAuthenticated, async (req: any, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const userId = req.user.sub || req.user.claims?.sub || req.user.id;
      
      if (!userId) {
        console.error('[DEBUG] No user ID found in request:', req.user);
        return res.status(401).json({ message: "User ID not found" });
      }

      // Check if assignment exists
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Calculate max score
      const maxScore = assignment.questions.reduce((sum, q) => sum + q.points, 0);

      // Check if user already has a submission
      let submission = await storage.getUserAssignmentSubmission(assignmentId, userId);
      
      if (submission) {
        // Update existing submission
        submission = await storage.updateAssignmentSubmission(submission.id, {
          questionSubmissions: req.body.questionSubmissions,
          totalScore: req.body.totalScore || 0,
          status: req.body.status || 'in_progress'
        });
      } else {
        // Create new submission
        submission = await storage.createAssignmentSubmission({
          assignmentId,
          userId,
          questionSubmissions: req.body.questionSubmissions || [],
          totalScore: req.body.totalScore || 0,
          maxScore,
          status: req.body.status || 'in_progress'
        });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error creating/updating assignment submission:", error);
      res.status(500).json({ message: "Failed to save submission" });
    }
  });

  app.post('/api/assignments/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const userId = req.user.sub || req.user.claims?.sub || req.user.id;
      
      if (!userId) {
        console.error('[DEBUG] No user ID found in request:', req.user);
        return res.status(401).json({ message: "User ID not found" });
      }

      // Check if assignment exists
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Check if user has a submission
      const submission = await storage.getUserAssignmentSubmission(assignmentId, userId);
      if (!submission) {
        return res.status(400).json({ message: "No submission found to submit" });
      }

      // Check if submission is already submitted
      if (submission.status === 'submitted' || submission.status === 'graded') {
        return res.status(400).json({ message: "Assignment already submitted" });
      }

      // Submit the assignment
      const submittedAssignment = await storage.submitAssignment(assignmentId, userId);
      res.json(submittedAssignment);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });

  // Code execution for coding problems
  app.post('/api/execute', isAuthenticated, async (req, res) => {
    try {
      const { code, language, input } = req.body;
      
      // Mock code execution for now
      const result = mockExecuteCode(code, language);
      res.json(result);
    } catch (error) {
      console.error("Error executing code:", error);
      res.status(500).json({ message: "Failed to execute code" });
    }
  });

  // Group routes
  app.get('/api/groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.user.id;
      const groups = await storage.getUserGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post('/api/groups', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.user.id;

      const validatedData = insertGroupSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const group = await storage.createGroup(validatedData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  // Announcement routes
  app.get('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const announcements = await storage.getUserAnnouncements(userId);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can create announcements" });
      }

      const validatedData = insertAnnouncementSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const announcement = await storage.createAnnouncement(validatedData);
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // Contest participation
  app.post('/api/contests/:id/participate', isAuthenticated, async (req: any, res) => {
    try {
      const contestId = parseInt(req.params.id);
      const userId = req.user._id;

      const contest = await storage.getContest(contestId);
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }

      const participant = await storage.registerForContest({
        contestId,
        userId,
        score: "0.00",
        submissions: 0
      });

      res.status(201).json(participant);
    } catch (error) {
      console.error("Error registering for contest:", error);
      res.status(500).json({ message: "Failed to register for contest" });
    }
  });

  app.get('/api/contests/:id/participants', async (req, res) => {
    try {
      const contestId = parseInt(req.params.id);
      const participants = await storage.getContestParticipants(contestId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching contest participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // Admin routes
  app.patch('/api/admin/users/:id/role', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      
      const targetUserId = req.params.id;
      const { role } = req.body;
      
      if (!['student', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const updatedUser = await storage.updateUserRole(targetUserId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  return server;
}

// Mock code execution function - replace with actual judge system
function mockExecuteCode(code: string, language: string) {
  // Mock test cases
  const testCases = [
    {
      input: "nums = [2, 7, 11, 15], target = 9",
      expectedOutput: "[0, 1]",
      actualOutput: "[1, 0]" // simulated user's output
    }
  ];

  // Simulate code execution for each test case
  const testCase = testCases[0]; // Using first test case for now
  
  // Simulate different execution scenarios
  const scenarios = [
    {
      status: 'wrong_answer',
      runtime: 100,
      memory: 16,
      score: "0.00",
      actualOutput: testCase.actualOutput,
      expectedOutput: testCase.expectedOutput,
      error: null
    },
    {
      status: 'time_limit_exceeded',
      runtime: 2000,
      memory: 16,
      score: "0.00",
      actualOutput: "Function took too long to execute",
      expectedOutput: testCase.expectedOutput,
      error: "Time limit exceeded: Function took longer than 1000ms to execute"
    },
    {
      status: 'runtime_error',
      runtime: 50,
      memory: 16,
      score: "0.00",
      actualOutput: null,
      expectedOutput: testCase.expectedOutput,
      error: "TypeError: Cannot read property 'length' of undefined"
    },
    {
      status: 'accepted',
      runtime: 95,
      memory: 16,
      score: "100.00",
      actualOutput: testCase.expectedOutput,
      expectedOutput: testCase.expectedOutput,
      error: null
    }
  ];

  // Randomly select a scenario (for testing purposes)
  const result = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  return {
    status: result.status,
    runtime: result.runtime,
    memory: result.memory,
    score: result.score,
    actualOutput: result.actualOutput,
    expectedOutput: result.expectedOutput,
    error: result.error,
    input: testCase.input
  };
}
