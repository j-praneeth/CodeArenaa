import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Code, 
  Trophy, 
  GraduationCap, 
  ClipboardList,
  Menu,
  X
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

export function Sidebar() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

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
    <>
      {/* Collapsed sidebar trigger */}
      <div 
        className={`fixed left-0 top-16 z-40 transition-all duration-300 ease-in-out hidden lg:block ${
          isExpanded ? 'translate-x-64' : 'translate-x-0'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
      >
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-r-lg shadow-lg p-3 hamburger-hover menu-trigger">
          <Menu className="w-5 h-5 text-green-500" />
        </div>
      </div>

      {/* Expanded sidebar */}
      <aside 
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-30 transition-all duration-300 ease-in-out hidden lg:block ${
          isExpanded ? 'translate-x-0 w-64' : '-translate-x-64 w-64'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="relative h-full">
          {/* Close button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>

          <div className="p-6 overflow-y-auto h-full">
            <div className="animate-in slide-in-from-left-5 duration-300">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h2>
              <nav className="space-y-2">
                {sidebarItems.map((item, index) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm group ${
                      isActive(item.path)
                        ? "text-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    style={{
                      transitionDelay: isExpanded ? `${index * 50}ms` : '0ms'
                    }}
                  >
                    <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive(item.path) ? 'text-green-500' : ''
                    }`} />
                    <span className={`transition-all duration-200 ${
                      isActive(item.path) ? "font-medium" : ""
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="mt-8 animate-in slide-in-from-left-5 duration-500 delay-200">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Progress
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Problems Solved</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {userStats?.accepted || 0}/120
                      </span>
                    </div>
                    <Progress value={problemsProgress} className="h-2" />
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Current Streak</span>
                      <span className="font-medium text-green-500 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        {userStats?.streak || 0} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}


    </>
  );
}


export default Sidebar;