import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "wouter";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { RecentProblems } from "@/components/dashboard/recent-problems";
import { UpcomingContests } from "@/components/dashboard/upcoming-contests";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle } from "lucide-react";
import AdminDashboard from "./admin-dashboard";

function UserDashboard({ user }: { user: any }) {
  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.firstName || "student"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Continue your coding journey and track your progress.
        </p>
      </div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentProblems />
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          <UpcomingContests />
          <Leaderboard />
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 space-y-3">
        <Button 
          size="icon"
          className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Button>
        <Button 
          size="icon"
          className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Handle authentication data from URL parameters (Google OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userStr));
        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Clean up URL parameters
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Show success message
        toast({
          title: "Successfully signed in",
          description: `Welcome back${userData.firstName ? ', ' + userData.firstName : ''}!`
        });
      } catch (error) {
        console.error('[DEBUG] Error processing auth data:', error);
      }
    }
  }, []); // Run only once on mount

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]); // Only depend on isAuthenticated and setLocation

  if (!isAuthenticated || !user) {
    return null;
  }

  // Render different dashboards based on user role
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <UserDashboard user={user} />;
}
