import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: any;
}

interface JwtPayload {
  id: string;
  sub?: string;
  role?: string;
}

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { 
      id: userId,
      sub: userId
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check for token in cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      console.log('[DEBUG] No token found in request');
      return res.status(401).json({ 
        message: 'Authentication required. Please log in.',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Verify token
      console.log('[DEBUG] Verifying token:', token);
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      if (!decoded.id && !decoded.sub) {
        console.log('[DEBUG] Invalid token format:', decoded);
        return res.status(401).json({ 
          message: 'Invalid token format',
          code: 'INVALID_TOKEN_FORMAT'
        });
      }

      // Get user from database
      const userId = decoded.id || decoded.sub;
      console.log('[DEBUG] Looking up user:', userId);
      const user = await User.findById(userId)
        .select('-password')
        .lean()
        .exec();

      if (!user) {
        console.log('[DEBUG] User not found:', userId);
        return res.status(401).json({ 
          message: 'User not found or deactivated',
          code: 'USER_NOT_FOUND'
        });
      }

      console.log('[DEBUG] User found:', user);
      
      // Attach user to request
      req.user = {
        ...user,
        id: user._id.toString(),
        claims: {
          sub: user._id.toString(),
          role: user.role
        }
      };

      next();
    } catch (jwtError) {
      console.error('[DEBUG] JWT Verification Error:', jwtError);
      return res.status(401).json({ 
        message: 'Session expired. Please log in again.',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('[DEBUG] Auth Middleware Error:', error);
    res.status(500).json({ 
      message: 'Internal server error during authentication',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};