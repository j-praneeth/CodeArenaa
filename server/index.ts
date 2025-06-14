import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToMongoDB } from "./db";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import { Request, Response, NextFunction } from "express";

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'http://localhost:5000'
    : (process.env.REPL_ID ? 'http://0.0.0.0:5000' : 'http://localhost:5000'),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug middleware to log all requests FIRST
app.use((req, res, next) => {
  console.log('----------------------------------------');
  console.log(`[DEBUG] Incoming request: ${req.method} ${req.url}`);
  console.log(`[DEBUG] Headers:`, req.headers);
  next();
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Mount auth routes BEFORE Vite and other routes
app.use('/api/auth', (req, res, next) => {
  console.log('[DEBUG] Auth route hit:', req.method, req.url);
  console.log('[DEBUG] Full path:', req.originalUrl);
  next();
}, authRoutes);

(async () => {
  // Connect to MongoDB first
  await connectToMongoDB();
  
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('[DEBUG] Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  // Setup Vite AFTER auth routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.HOST || (process.env.REPL_ID ? '0.0.0.0' : 'localhost');
  
  server.listen(port, host, () => {
    log(`API Server running on http://${host}:${port}`);
    
    // Log environment check
    log('Environment check:');
    log(`- GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set'}`);
    log(`- GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set'}`);
    log(`- SESSION_SECRET: ${process.env.SESSION_SECRET ? 'Set' : 'Not set'}`);
    log('----------------------------------------');
  });
})();
