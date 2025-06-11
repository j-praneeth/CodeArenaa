import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useEffect, useState } from 'react';
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Problems from "@/pages/problems";
import ProblemDetail from "@/pages/problem-detail";
import Contests from "@/pages/contests";
import Leaderboard from "@/pages/leaderboard";
import AdminDashboard from "@/pages/admin-dashboard";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import AuthCallback from '@/pages/auth/AuthCallback';
import { useLocation } from 'wouter';
import { config } from '@/config';
import Courses from "@/pages/Courses";
import CourseModuleViewer from "@/pages/CourseModuleViewer";
import Assignments from "@/pages/Assignments";
import AssignmentSubmission from "@/pages/AssignmentSubmission";
import AdminAssignments from "@/pages/AdminAssignments";
import CreateAssignment from "@/pages/CreateAssignment";
import AdminProblems from "@/pages/admin/problems";
import AdminContests from "@/pages/admin/contests";
import AdminCourses from "@/pages/admin/courses";
import CreateCourse from "@/pages/admin/CreateCourse";
import AdminLeaderboard from "@/pages/admin/leaderboard";
import { useAuth } from "@/hooks/useAuth";

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // Public route wrapper
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated) {
      return <Redirect to="/dashboard" />;
    }
    return <>{children}</>;
  };

  // Admin route wrapper
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return <Redirect to="/dashboard" />;
    }
    return <>{children}</>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/auth-callback">
        <AuthCallback />
      </Route>
      <Route path="/login">
        <PublicRoute><LoginPage /></PublicRoute>
      </Route>
      <Route path="/register">
        <PublicRoute><RegisterPage /></PublicRoute>
      </Route>
      <Route path="/">
        <PublicRoute><Landing /></PublicRoute>
      </Route>

      {/* Protected routes wrapped in Layout */}
      {isAuthenticated ? (
        <Layout>
          <Switch>
            <Route path="/" component={() => <Redirect to="/dashboard" />} />
            <Route path="/dashboard">
              <Dashboard />
            </Route>
            <Route path="/problems">
              {user?.role === 'admin' ? <AdminProblems /> : <Problems />}
            </Route>
            <Route path="/problems/:id">
              <ProblemDetail />
            </Route>
            <Route path="/contests">
              {user?.role === 'admin' ? <AdminContests /> : <Contests />}
            </Route>
            <Route path="/courses">
              {user?.role === 'admin' ? <AdminCourses /> : <Courses />}
            </Route>
            <Route path="/courses/:courseId/modules/:moduleId">
              <CourseModuleViewer />
            </Route>
            <Route path="/assignments">
              {user?.role === 'admin' ? <AdminAssignments /> : <Assignments />}
            </Route>
            <Route path="/assignments/:id">
              <AssignmentSubmission />
            </Route>
            <Route path="/admin/assignments">
              <AdminRoute>
                <AdminAssignments />
              </AdminRoute>
            </Route>
            <Route path="/admin/assignments/create">
              <AdminRoute>
                <CreateAssignment />
              </AdminRoute>
            </Route>
            <Route path="/admin/assignments/:id/edit">
              <AdminRoute>
                <CreateAssignment />
              </AdminRoute>
            </Route>
            <Route path="/leaderboard">
              {user?.role === 'admin' ? <AdminLeaderboard /> : <Leaderboard />}
            </Route>
            <Route path="/admin/courses/create">
              <AdminRoute>
                <CreateCourse />
              </AdminRoute>
            </Route>
            <Route path="/admin">
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </Route>
            <Route path="/profile">
              <Profile />
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </Layout>
      ) : (
        <Redirect to="/login" />
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="codearena-ui-theme">
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;