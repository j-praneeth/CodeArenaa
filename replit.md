# CodeArena - Competitive Programming Platform

## Overview

CodeArena is a comprehensive competitive programming platform built with a modern full-stack architecture. The application provides a complete coding education and competition environment with features for students, instructors, and administrators. It supports problem solving, contests, courses, assignments, and real-time code execution across multiple programming languages.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: Zustand for global state, React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Code Editor**: Monaco Editor for in-browser code editing
- **Theme Support**: Dark/light mode with theme provider

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: MongoDB Atlas with native MongoDB driver
- **Authentication**: Multiple strategies including JWT tokens, Google OAuth, and Replit OIDC
- **Session Management**: Express sessions with MongoDB store
- **Code Execution**: Secure sandboxed execution using child processes

### Data Storage
- **Primary Database**: MongoDB Atlas cluster
- **Schema Validation**: Zod schemas for runtime validation
- **Collections**: Users, problems, submissions, courses, assignments, contests, and more
- **Session Store**: MongoDB-based session storage for authentication

## Key Components

### Authentication System
- **Multi-provider Support**: Email/password, Google OAuth, and Replit OIDC
- **Role-based Access**: Student and admin roles with middleware protection
- **Token Management**: JWT tokens with secure cookie storage
- **Session Persistence**: MongoDB-backed sessions for reliability

### Problem Management
- **CRUD Operations**: Complete problem lifecycle management
- **Multiple Languages**: Support for Python, JavaScript, C++, Java
- **Test Cases**: Hidden and visible test cases with custom validation
- **Code Templates**: Language-specific starter code
- **Difficulty Levels**: Easy, medium, hard categorization

### Code Execution Engine
- **Sandboxed Execution**: Secure isolated code execution
- **Multiple Languages**: Python, JavaScript, C++, Java support
- **Resource Limits**: Time and memory constraints
- **Real-time Results**: Immediate feedback on code submissions

### Course System
- **Modular Content**: Text, video, and interactive code modules
- **Progress Tracking**: Student enrollment and completion tracking
- **Assignment Integration**: Course-linked assignments and assessments
- **Admin Management**: Full CRUD operations for course content

### Contest Platform
- **Live Competitions**: Real-time contest participation
- **Leaderboards**: Dynamic ranking and scoring
- **Time Management**: Contest scheduling and duration controls
- **Problem Sets**: Curated problem collections for contests

## Data Flow

### Authentication Flow
1. User initiates login via email/password or OAuth provider
2. Server validates credentials and generates JWT token
3. Token stored in secure HTTP-only cookie
4. Subsequent requests authenticated via middleware
5. Role-based route protection enforced

### Problem Solving Flow
1. User selects problem from catalog
2. Monaco editor loads with starter code
3. Code submitted to execution engine
4. Sandboxed execution with test case validation
5. Results returned with performance metrics
6. Submission stored in database with status

### Course Progression Flow
1. Student enrolls in course
2. Progress tracked through module completion
3. Interactive code exercises validated
4. Completion status updated in real-time
5. Certificates generated upon course completion

## External Dependencies

### Core Technologies
- **React Ecosystem**: React, React DOM, React Query for frontend
- **Node.js Stack**: Express, TypeScript, various middleware
- **MongoDB**: Native driver with connection pooling
- **Authentication**: Passport.js with multiple strategies

### UI Components
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library
- **Monaco Editor**: Code editor component

### Development Tools
- **Build Tools**: Vite, esbuild for production builds
- **Type Safety**: TypeScript throughout the stack
- **Validation**: Zod for runtime schema validation
- **Testing**: Basic setup for unit and integration tests

## Deployment Strategy

### Replit Platform
- **Primary Target**: Optimized for Replit deployment
- **Configuration**: .replit file with Node.js 20 environment
- **Build Process**: npm run build for production assets
- **Port Configuration**: Default port 5000 with proxy setup

### Environment Configuration
- **Development**: Hot reload with Vite dev server
- **Production**: Compiled assets served by Express
- **Environment Variables**: Comprehensive .env configuration
- **Database**: MongoDB Atlas connection with fallback options

### Scaling Considerations
- **Connection Pooling**: MongoDB connection management
- **Session Storage**: Scalable session persistence
- **Asset Optimization**: Vite build optimization
- **Caching Strategy**: Query caching with React Query

## Changelog

```
Changelog:
- June 14, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```