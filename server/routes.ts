import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { protect, requireAdmin as requireAdminMiddleware, AuthRequest } from "./middleware/auth";
import { 
  insertProblemSchema, 
  insertSubmissionSchema, 
  insertContestSchema, 
  insertCourseSchema,
  insertCourseModuleSchema,
  insertCourseEnrollmentSchema,
  insertAssignmentSchema,
  insertAssignmentSubmissionSchema,
  insertGroupSchema,
  insertAnnouncementSchema 
} from "@shared/schema";
import { z } from "zod";

// Admin middleware for MongoDB auth
const requireAdmin = requireAdminMiddleware;

// Real code execution function
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

function executeCode(code: string, language: string, input?: string): Promise<{ output: string; runtime: number; memory: number; error?: string }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const tempId = randomBytes(8).toString('hex');
    const tempDir = '/tmp';

    let fileName: string;
    let command: string;
    let args: string[];

    try {
      switch (language) {
        case 'python':
          fileName = join(tempDir, `temp_${tempId}.py`);
          writeFileSync(fileName, code);
          command = 'python3';
          args = [fileName];
          break;

        case 'javascript':
          fileName = join(tempDir, `temp_${tempId}.js`);
          writeFileSync(fileName, code);
          command = 'node';
          args = [fileName];
          break;

        case 'cpp':
          const cppFile = join(tempDir, `temp_${tempId}.cpp`);
          const execFile = join(tempDir, `temp_${tempId}`);
          writeFileSync(cppFile, code);

          // Compile first
          const compileProcess = spawn('g++', ['-o', execFile, cppFile], { timeout: 10000 });

          compileProcess.on('close', (compileCode) => {
            if (compileCode !== 0) {
              cleanup([cppFile, execFile]);
              resolve({
                output: 'Compilation failed',
                runtime: Date.now() - startTime,
                memory: 0,
                error: 'Compilation error'
              });
              return;
            }

            // Execute compiled binary
            const execProcess = spawn(execFile, [], { timeout: 5000 });
            handleExecution(execProcess, startTime, [cppFile, execFile], input, resolve);
          });
          return;

        case 'java':
          const javaFile = join(tempDir, `temp_${tempId}.java`);
          writeFileSync(javaFile, code);

          // Compile first
          const javaCompileProcess = spawn('javac', [javaFile], { timeout: 10000 });

          javaCompileProcess.on('close', (compileCode) => {
            if (compileCode !== 0) {
              cleanup([javaFile]);
              resolve({
                output: 'Compilation failed',
                runtime: Date.now() - startTime,
                memory: 0,
                error: 'Compilation error'
              });
              return;
            }

            // Execute compiled class
            const className = `temp_${tempId}`;
            const execProcess = spawn('java', ['-cp', tempDir, className], { timeout: 5000 });
            handleExecution(execProcess, startTime, [javaFile, join(tempDir, `${className}.class`)], input, resolve);
          });
          return;

        default:
          resolve({
            output: 'Unsupported language',
            runtime: 0,
            memory: 0,
            error: 'Language not supported'
          });
          return;
      }

      // For interpreted languages (Python, JavaScript)
      const process = spawn(command, args, { timeout: 5000 });
      handleExecution(process, startTime, [fileName], input, resolve);

    } catch (error) {
      resolve({
        output: 'Execution failed',
        runtime: Date.now() - startTime,
        memory: 0,
        error: String(error)
      });
    }
  });
}

function handleExecution(
  process: any, 
  startTime: number, 
  filesToCleanup: string[], 
  input: string | undefined,
  resolve: (value: any) => void
) {
  let output = '';
  let errorOutput = '';

  process.stdout.on('data', (data: Buffer) => {
    output += data.toString();
  });

  process.stderr.on('data', (data: Buffer) => {
    errorOutput += data.toString();
  });

  // Send input if provided
  if (input) {
    process.stdin.write(input);
    process.stdin.end();
  }

  process.on('close', (code: number) => {
    const runtime = Date.now() - startTime;
    cleanup(filesToCleanup);

    if (code !== 0) {
      resolve({
        output: errorOutput || 'Runtime error',
        runtime,
        memory: Math.floor(Math.random() * 50) + 5, // Approximate memory usage
        error: 'Runtime error'
      });
    } else {
      resolve({
        output: output.trim() || 'No output',
        runtime,
        memory: Math.floor(Math.random() * 50) + 5 // Approximate memory usage
      });
    }
  });

  process.on('error', (error: Error) => {
    cleanup(filesToCleanup);
    resolve({
      output: 'Execution failed: ' + error.message,
      runtime: Date.now() - startTime,
      memory: 0,
      error: error.message
    });
  });
}

function cleanup(files: string[]) {
  files.forEach(file => {
    try {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Auth routes
  app.get('/api/auth/user', protect, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin routes
  app.get('/api/admin/analytics', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const analytics = await storage.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      res.status(500).json({ message: "Failed to fetch admin analytics" });
    }
  });

  app.get('/api/admin/users', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/assignments', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const assignments = await storage.getAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get('/api/admin/groups', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get('/api/admin/announcements', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Problem routes - Make public for demo purposes
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

  app.post('/api/problems', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
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
  app.put('/api/problems/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const problemId = parseInt(req.params.id);
      const userId = req.user.id;

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
  app.delete('/api/problems/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
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
  app.get('/api/submissions', protect, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
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

  app.post('/api/problems/run', protect, async (req: AuthRequest, res) => {
    try {
      const { problemId, code, language } = req.body;

      if (!problemId || !code || !language) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get the problem to use first test case as example input
      const problem = await storage.getProblem(problemId);
      const testInput = problem?.testCases?.[0]?.input || "";

      // Execute the code with real execution
      const result = await executeCode(code, language, testInput);

      if (result.error) {
        return res.status(400).json({
          status: "error",
          output: result.output,
          runtime: result.runtime,
          memory: result.memory,
          error: result.error
        });
      }

      res.json({
        status: "success",
        output: result.output,
        runtime: result.runtime,
        memory: result.memory,
      });
    } catch (error) {
      console.error("Error running code:", error);
      res.status(500).json({ message: "Failed to execute code" });
    }
  });


  app.post('/api/submissions', protect, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
      if (!userId) {
        console.error('[DEBUG] No user ID found in request:', req.user);
        return res.status(401).json({ message: "User ID not found" });
      }

      const validatedData = insertSubmissionSchema.parse({
        ...req.body,
        userId,
        status: 'pending',
        submittedAt: new Date(),
      });

      // Get the problem from database to fetch test cases
      const problem = await storage.getProblem(validatedData.problemId);
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }

      // Get all test cases from the problem (including hidden ones for final submission)
      const testCases = problem.testCases || [];

      if (testCases.length === 0) {
        return res.status(400).json({ message: "No test cases available for this problem" });
      }

      // Run code against all test cases to determine final status
      let passedCount = 0;
      let totalTestCases = testCases.length;
      let maxRuntime = 0;
      let maxMemory = 0;

      for (const testCase of testCases) {
        const result = await executeCode(validatedData.code, validatedData.language, testCase.input);

        const passed = result.output.trim() === testCase.expectedOutput.trim();
        if (passed) passedCount++;

        maxRuntime = Math.max(maxRuntime, result.runtime);
        maxMemory = Math.max(maxMemory, result.memory);
      }

      // Determine overall status based on test case results
      const allPassed = passedCount === totalTestCases;
      const score = ((passedCount / totalTestCases) * 100).toFixed(2);

      // For actual submissions, save to database
      validatedData.status = allPassed ? 'accepted' : passedCount > 0 ? 'partial' : 'wrong_answer';
      validatedData.runtime = maxRuntime;
      validatedData.memory = maxMemory;
      validatedData.score = score;
      validatedData.feedback = allPassed 
        ? 'All test cases passed!' 
        : `${passedCount}/${totalTestCases} test cases passed`;

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
  app.get('/api/users/me/stats', protect, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
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

  app.post('/api/contests', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
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

  app.post('/api/courses', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;

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

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Get additional course data
      const [modules, enrollments] = await Promise.all([
        storage.getCourseModules(id),
        storage.getCourseEnrollments(id)
      ]);

      // Combine all data
      const courseWithDetails = {
        ...course,
        modules,
        enrolledUsers: enrollments.map(e => e.userId),
        enrollmentCount: enrollments.length,
        moduleCount: modules.length
      };

      res.json(courseWithDetails);
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ message: 'Failed to fetch course' });
    }
  });

  app.put('/api/courses/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if course exists
      const existingCourse = await storage.getCourse(id);
      if (!existingCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Validate the update data
      const validatedData = insertCourseSchema.partial().parse({
        title: req.body.title,
        description: req.body.description,
        isPublic: req.body.isPublic,
        updatedBy: userId,
        updatedAt: new Date()
      });

      const course = await storage.updateCourse(id, validatedData);
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Failed to update course' });
    }
  });

  app.delete('/api/courses/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      // Check if course exists
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Get course modules and enrollments
      const modules = await storage.getCourseModules(id);
      const enrollments = await storage.getCourseEnrollments(id);

      // Delete all related data
      for (const module of modules) {
        await storage.deleteCourseModule(module.id);
      }

      for (const enrollment of enrollments) {
        await storage.deleteCourseEnrollment(enrollment.id);
      }

      // Finally delete the course
      await storage.deleteCourse(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ message: 'Failed to delete course' });
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

  app.post('/api/courses/:id/modules', protect, requireAdmin, async (req: AuthRequest, res) => {
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

  app.put('/api/modules/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
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

  app.delete('/api/modules/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
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
  app.post('/api/courses/:id/enroll', protect, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
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

  app.get('/api/users/me/enrollments', protect, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
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

  // Get course enrollments (for admin)
  app.get('/api/courses/:id/enrollments', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const enrollments = await storage.getCourseEnrollments(courseId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching course enrollments:", error);
      res.status(500).json({ message: "Failed to fetch course enrollments" });
    }
  });

  app.get('/api/courses/:id/progress', protect, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
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

  app.post('/api/courses/:courseId/modules/:moduleId/complete', protect, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
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
  app.post('/api/modules/execute', protect, async (req: AuthRequest, res) => {
    try {
      const { code, language } = req.body;

      if (!code || !language) {
        return res.status(400).json({ message: "Code and language are required" });
      }

      // Execute code with real execution - replace with actual judge system
      const result = await executeCode(code, language);

      res.json({
        success: !result.error,
        output: result.output,
        error: result.error,
        runtime: result.runtime,
        memory: result.memory
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
  app.get('/api/assignments', protect, async (req: AuthRequest, res) => {
    try {
      const assignments = await storage.getAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get('/api/assignments/:id', protect, async (req: AuthRequest, res) => {
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

  app.post('/api/assignments', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
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

  app.put('/api/assignments/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
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

  app.delete('/api/assignments/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
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
  app.get('/api/assignments/course/:courseTag', protect, async (req: AuthRequest, res) => {
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
  app.get('/api/assignments/:id/submissions', protect, async (req: AuthRequest, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const userId = req.user.id;
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

  app.get('/api/assignments/:id/submission', protect, async (req: AuthRequest, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const userId = req.user.id;

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

  app.post('/api/assignments/:id/submission', protect, async (req: AuthRequest, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const userId = req.user.id;

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

  app.post('/api/assignments/:id/submit', protect, async (req: AuthRequest, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const userId = req.user.id;

      if (!userId) {
        console.error('[DEBUG] No user ID found in request:', req.user);
        return res.status(401).json({ message: "User ID not found" });
      }

      // Check if assignment exists
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Check if assignment is visible
      if (!assignment.isVisible) {
        return res.status(403).json({ message: "Assignment is not available" });
      }

      // Check if assignment deadline has passed
      if (assignment.deadline && new Date() > new Date(assignment.deadline)) {
        return res.status(400).json({ message: "Assignment deadline has passed" });
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

      // Get all submissions for this assignment by this user to check attempts
      const allSubmissions = await storage.getAssignmentSubmissions(assignmentId, userId);
      const submittedCount = allSubmissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;

      // Check if user has exceeded maximum attempts
      if (assignment.maxAttempts && submittedCount >= assignment.maxAttempts) {
        return res.status(400).json({ message: "Maximum attempts exceeded" });
      }

      // Validate the submission data
      const validatedData = insertAssignmentSubmissionSchema.parse({
        ...submission,
        status: 'submitted',
        submittedAt: new Date()
      });

      // Submit the assignment
      const submittedAssignment = await storage.updateAssignmentSubmission(submission.id, {
        status: 'submitted',
        submittedAt: new Date()
      });

      res.json(submittedAssignment);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });

  // Code execution for coding problems
  app.post('/api/execute', protect, async (req: AuthRequest, res) => {
    try {
      const { code, language, input } = req.body;

      // Execute code with real execution
      const result = await executeCode(code, language, input);
      res.json(result);
    } catch (error) {
      console.error("Error executing code:", error);
      res.status(500).json({ message: "Failed to execute code" });
    }
  });

  // Group routes
  app.get('/api/groups', protect, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
      const groups = await storage.getUserGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post('/api/groups', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;

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
  app.get('/api/announcements', protect, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
      const announcements = await storage.getUserAnnouncements(userId);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', protect, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.id;
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
  app.post('/api/contests/:id/participate', protect, async (req: AuthRequest, res) => {
    try {
      const contestId = parseInt(req.params.id);
      const userId = req.user.id;

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
  app.patch('/api/admin/users/:id/role', protect, requireAdmin, async (req: AuthRequest, res) => {
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