import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User, IUser } from '../models/User';
import { generateToken, protect, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { Document, Types } from 'mongoose';
import jwt from 'jsonwebtoken';

// Passport serialization
passport.serializeUser((user: any, done) => {
  console.log('[DEBUG] Serializing user:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    console.log('[DEBUG] Deserializing user:', id);
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('[DEBUG] Deserialize error:', error);
    done(error);
  }
});

const router = Router();

// Debug middleware for auth routes
router.use((req, res, next) => {
  console.log('[DEBUG] Auth middleware:', req.method, req.originalUrl);
  console.log('[DEBUG] Session:', req.session);
  console.log('[DEBUG] User:', req.user);
  next();
});

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
];

interface UserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

// Register with email/password
router.post('/register', validateRegistration, async (req: Request, res: Response) => {
  try {
    console.log('[DEBUG] Registration attempt:', { 
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      hasPassword: !!req.body.password
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[DEBUG] Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      
      console.log('[DEBUG] Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    // Check if user exists
    console.log('[DEBUG] Checking for existing user with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('[DEBUG] User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    console.log('[DEBUG] Attempting to create user...');
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'student'
    }) as UserDocument;

    console.log('[DEBUG] User created successfully:', { 
      id: user._id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Generate token
    const token = generateToken(user._id.toString());
    console.log('[DEBUG] Generated authentication token');

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    console.log('[DEBUG] Set authentication cookie');

    // Send response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[DEBUG] Registration error:', error);
    
    // Check for mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      console.error('[DEBUG] Mongoose validation error');
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values((error as any).errors).map((err: any) => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    // Check for MongoDB duplicate key error
    if (error instanceof Error && 
        (error as any).code === 11000 && 
        (error as any).keyPattern?.email) {
      console.error('[DEBUG] Duplicate email error');
      return res.status(400).json({ 
        message: 'Email already exists',
        field: 'email'
      });
    }

    console.error('[DEBUG] Unexpected error:', error);
    console.error('[DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    res.status(500).json({ 
      message: 'Server error during registration',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Login with email/password
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('[DEBUG] Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password') as UserDocument;
    if (!user || !(await user.comparePassword(password))) {
      console.log('[DEBUG] Invalid credentials for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('[DEBUG] User authenticated:', { id: user._id, email: user.email });
    const token = generateToken(user._id.toString());

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.log('[DEBUG] Token generated and cookie set');

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl
      },
    });
  } catch (error) {
    console.error('[DEBUG] Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user endpoint
router.get('/user', protect, async (req: AuthRequest, res: Response) => {
  try {
    console.log('[DEBUG] /user endpoint hit with authenticated user');
    console.log('[DEBUG] User from middleware:', req.user);
    
    if (!req.user) {
      console.log('[DEBUG] No user found in request after auth middleware');
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      profileImageUrl: req.user.profileImageUrl
    });
  } catch (error) {
    console.error('[DEBUG] Error in /user endpoint:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout endpoint
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // Clear any server-side session/token if needed
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '835089395113-em66ufur3muaj47ea3b53mubjonpreq0.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const GOOGLE_CALLBACK_URL = 'http://localhost:5000/api/auth/google/callback';
const FRONTEND_URL = 'http://localhost:5000';

console.log('[DEBUG] Setting up Google OAuth with:');
console.log('- Client ID:', GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('- Client Secret:', GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
console.log('- Callback URL:', GOOGLE_CALLBACK_URL);
console.log('- Frontend URL:', FRONTEND_URL);

// Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL,
}, async (accessToken: string, refreshToken: string, profile: passport.Profile, done: (error: any, user?: any) => void) => {
  try {
    console.log('[DEBUG] Google callback received');
    console.log('[DEBUG] Profile:', {
      id: profile.id,
      displayName: profile.displayName,
      emails: profile.emails,
      photos: profile.photos
    });
    
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      console.log('[DEBUG] Creating new user from Google profile');
      // Check if this email is registered as an admin
      const email = profile.emails?.[0]?.value;
      const existingUser = await User.findOne({ email });
      const role = existingUser?.role || 'student'; // Use existing user's role or default to student

      user = await User.create({
        googleId: profile.id,
        email: email,
        firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
        lastName: profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' '),
        profileImageUrl: profile.photos?.[0]?.value,
        role: role, // Assign role based on existing user or default
      });
      console.log('[DEBUG] New user created:', { ...user.toObject(), role });
    } else {
      console.log('[DEBUG] Existing user found:', { ...user.toObject(), role: user.role });
    }

    return done(null, user);
  } catch (error) {
    console.error('[DEBUG] Google strategy error:', error);
    return done(error as Error, undefined);
  }
}));

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('[DEBUG] Starting Google OAuth flow');
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    console.log('[DEBUG] Google callback route hit');
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`
    })(req, res, next);
  },
  (req: Request, res: Response) => {
    try {
      console.log('[DEBUG] Google authentication successful');
      const user = req.user as UserDocument;
      const token = generateToken(user._id.toString());
      
      const userData = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl
      };

      console.log('[DEBUG] User data:', userData);
      console.log('[DEBUG] User role:', user.role);
      
      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Set user data in a non-httpOnly cookie so frontend can access it
      res.cookie('user_data', JSON.stringify(userData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect based on user role
      const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
      console.log('[DEBUG] Redirecting to:', `${FRONTEND_URL}${redirectPath}`);
      
      // Add a script to store data in localStorage before redirecting
      const script = `
        <script>
          localStorage.setItem('token', '${token}');
          localStorage.setItem('user', '${JSON.stringify(userData)}');
          window.location.href = '${FRONTEND_URL}${redirectPath}';
        </script>
      `;
      res.send(script);
    } catch (error) {
      console.error('[DEBUG] Error in callback handler:', error);
      res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
  }
);

console.warn('[DEBUG] End of auth routes configuration');
export default router; 
