import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Trophy, Flame, GraduationCap } from "lucide-react";

interface UserStats {
  total: number;
  accepted: number;
  streak: number;
  problemsSolved: number;
  totalProblems: number;
  courseProgress: {
    currentCourse: string;
    progress: number;
  };
  contestRank: number;
}

export function StatsGrid() {
  const { user } = useAuth();
  
  const { data: userStats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/users/me/stats"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Problems Solved",
      value: userStats?.problemsSolved || 0,
      icon: CheckCircle,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-500",
      change: `${userStats?.problemsSolved || 0}/${userStats?.totalProblems || 0} total`,
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Contest Rank",
      value: userStats?.contestRank ? `#${userStats.contestRank}` : "Unranked",
      icon: Trophy,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-500",
      change: userStats?.contestRank ? `Top ${Math.round((userStats.contestRank / (userStats.totalProblems || 1)) * 100)}%` : "Join contests to rank up",
      changeColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Current Streak",
      value: userStats?.streak || 0,
      icon: Flame,
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-500",
      change: "points earned",
      changeColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Course Progress",
      value: `${userStats?.courseProgress?.progress || 0}%`,
      icon: GraduationCap,
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-500",
      change: userStats?.courseProgress?.currentCourse || "No course started",
      changeColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className={`text-sm ${stat.changeColor}`}>
                {stat.change}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
