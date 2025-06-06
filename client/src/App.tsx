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
import Assignments from "@/pages/Assignments";
import AdminProblems from "@/pages/admin/problems";
import AdminContests from "@/pages/admin/contests";
import AdminCourses from "@/pages/admin/courses";
import AdminAssignments from "@/pages/admin/assignments";
import AdminLeaderboard from "@/pages/admin/leaderboard";
import { useAuth } from "@/hooks/useAuth";

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token validity
      fetch(`${config.apiUrl}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
        .then(res => {
          if (res.ok) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setLocation('/login');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLocation('/login');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [setLocation]);

  // Public route wrapper
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token');
    
    useEffect(() => {
      if (token) {
        setLocation('/dashboard');
      }
    }, [token]);

    return !token ? <>{children}</> : null;
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
            <Route path="/">
              <Redirect to="/dashboard" />
            </Route>
            <Route path="/dashboard">
              <Dashboard />
            </Route>

            {/* Regular routes with admin alternatives */}
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
            <Route path="/assignments">
              {user?.role === 'admin' ? <AdminAssignments /> : <Assignments />}
            </Route>
            <Route path="/leaderboard">
              {user?.role === 'admin' ? <AdminLeaderboard /> : <Leaderboard />}
            </Route>

            {/* Admin-only routes */}
            <Route path="/admin">
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </Route>

            {/* Common routes */}
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
        <Route>
          <Redirect to="/login" />
        </Route>
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
