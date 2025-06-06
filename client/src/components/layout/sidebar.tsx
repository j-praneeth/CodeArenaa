import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  Code, 
  Trophy, 
  GraduationCap, 
  ClipboardList 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

export function Sidebar() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  const { data: userStats } = useQuery({
    queryKey: ["/api/users/me/stats"],
  });

  const sidebarItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/problems", icon: Code, label: "Practice Problems" },
    { path: "/contests", icon: Trophy, label: "Contests" },
    { path: "/courses", icon: GraduationCap, label: "Courses" },
    { path: "/assignments", icon: ClipboardList, label: "Assignments" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && location === "/") return true;
    return location === path || (path !== "/dashboard" && location.startsWith(path));
  };

  const problemsProgress = userStats ? (userStats.accepted / 120) * 100 : 0;

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden lg:block">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h2>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className={isActive(item.path) ? "font-medium" : ""}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Progress
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Problems Solved</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {userStats?.accepted || 0}/120
                </span>
              </div>
              <Progress value={problemsProgress} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Current Streak</span>
                <span className="font-medium text-green-500">
                  {userStats?.streak || 0} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}


export default Sidebar;