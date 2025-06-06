// Environment variables with fallbacks
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5000',
  env: import.meta.env.MODE || 'development'
} as const;

// API endpoints
export const endpoints = {
  register: `${config.apiUrl}/api/auth/register`,
  login: `${config.apiUrl}/api/auth/login`,
  logout: `${config.apiUrl}/api/auth/logout`,
  googleAuth: `${config.apiUrl}/api/auth/google`,
  user: `${config.apiUrl}/api/auth/user`,
  problems: `${config.apiUrl}/api/problems`,
  contests: `${config.apiUrl}/api/contests`,
  leaderboard: `${config.apiUrl}/api/leaderboard`,
  profile: `${config.apiUrl}/api/profile`,
  settings: `${config.apiUrl}/api/settings`,
} as const;