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
import { createServer } from "http";

// Load environment variables
dotenv.config();

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://*.replit.dev',
    'https://*.replit.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-replit-user-id']
};

// Enable CORS for development
app.use(cors(corsOptions));

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

const server = createServer(app);

const PORT = parseInt(process.env.PORT ?? "5000", 10);

// Initialize database connection before starting server
async function startServer() {
  try {
    await connectToMongoDB();
    console.log('[DEBUG] Database connected successfully');

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5000'}`);
    });
  } catch (error) {
    console.error('[DEBUG] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();