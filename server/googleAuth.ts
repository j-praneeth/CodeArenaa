
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role?: string;
}

export function generateAuthUrl(): string {
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid'
    ],
  });
}

export async function verifyGoogleToken(code: string) {
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Unable to verify Google token');
  }

  return {
    sub: payload.sub!,
    email: payload.email!,
    firstName: payload.given_name || '',
    lastName: payload.family_name || '',
    profileImageUrl: payload.picture,
  };
}

export function generateJWT(user: JWTPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJWT(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export async function setupGoogleAuth(app: Express) {
  // Google OAuth login endpoint
  app.get('/api/auth/google', (req, res) => {
    const authUrl = generateAuthUrl();
    res.redirect(authUrl);
  });

  // Google OAuth callback endpoint
  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: 'Authorization code not provided' });
      }

      const googleUser = await verifyGoogleToken(code);
      
      // Upsert user in database
      await storage.upsertUser({
        id: googleUser.sub,
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        profileImageUrl: googleUser.profileImageUrl,
      });

      // Get user with role from database
      const dbUser = await storage.getUser(googleUser.sub);
      
      // Generate JWT token
      const token = generateJWT({
        sub: googleUser.sub,
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        profileImageUrl: googleUser.profileImageUrl,
        role: dbUser?.role || 'student',
      });

      // Set JWT as httpOnly cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.redirect('/');
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
  });

  // Get current user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    const token = req.cookies?.auth_token;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyJWT(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const requireAdmin: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(403).json({ message: "Admin access required" });
  }
};
