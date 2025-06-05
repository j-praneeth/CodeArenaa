import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Problems from "@/pages/problems";
import Contests from "@/pages/contests";
import Leaderboard from "@/pages/leaderboard";
import ProblemDetail from "@/pages/problem-detail";
import AdminDashboard from "@/pages/admin-dashboard";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/problems" component={Problems} />
          <Route path="/problems/:id" component={ProblemDetail} />
          <Route path="/contests" component={Contests} />
          <Route path="/courses" component={Dashboard} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/assignments" component={Dashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="codearena-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
