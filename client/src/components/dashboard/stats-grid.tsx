import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Trophy, Flame, GraduationCap } from "lucide-react";

export function StatsGrid() {
  const { user } = useAuth();
  
  const { data: userStats, isLoading } = useQuery({
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
      value: userStats?.accepted || 0,
      icon: CheckCircle,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-500",
      change: "+3 this week",
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Contest Rank",
      value: "152",
      icon: Trophy,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-500",
      change: "↑ 23 positions",
      changeColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Current Streak",
      value: userStats?.streak || 0,
      icon: Flame,
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-500",
      change: "days active",
      changeColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Course Progress",
      value: "78%",
      icon: GraduationCap,
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-500",
      change: "Data Structures",
      changeColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm border border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} h-6 w-6`} />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${stat.changeColor}`}>
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
