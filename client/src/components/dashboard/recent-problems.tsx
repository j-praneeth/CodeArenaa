import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Lock } from "lucide-react";
import { Link } from "wouter";

export function RecentProblems() {
  const { data: problems, isLoading } = useQuery({
    queryKey: ["/api/problems"],
    retry: false,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Problems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get first 3 problems for recent display
  const recentProblems = problems?.slice(0, 3) || [];

  const getStatusIcon = (index: number) => {
    if (index === 0) return <CheckCircle className="text-green-500 h-4 w-4" />;
    if (index === 1) return <Clock className="text-yellow-500 h-4 w-4" />;
    return <Lock className="text-gray-500 h-4 w-4" />;
  };

  const getStatusText = (index: number) => {
    if (index === 0) return { text: "Solved", color: "text-green-600 dark:text-green-400" };
    if (index === 1) return { text: "In Progress", color: "text-yellow-600 dark:text-yellow-400" };
    return { text: "Locked", color: "text-gray-500" };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-800">
        <CardTitle>Recent Problems</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {recentProblems.map((problem, index) => {
            const status = getStatusText(index);
            return (
              <div
                key={problem.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    {getStatusIcon(index)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {problem.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                      {problem.tags && problem.tags.length > 0 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {problem.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${status.color}`}>
                    {status.text}
                  </p>
                  <p className="text-xs text-gray-500">
                    {index === 0 ? "2 hours ago" : index === 1 ? "Started today" : "Complete course"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
            <Link href="/problems">View All Problems</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
