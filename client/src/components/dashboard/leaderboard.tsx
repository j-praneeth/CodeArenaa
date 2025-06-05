import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

export function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    retry: false,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-400 text-white";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-orange-400 text-white";
      default:
        return "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white";
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-800">
        <CardTitle>Top Performers</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {leaderboard?.slice(0, 3).map((entry, index) => (
            <div key={entry.user.id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeColor(index + 1)}`}>
                {index + 1}
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src={entry.user.profileImageUrl || ""} />
                <AvatarFallback>
                  {entry.user.firstName?.[0]}{entry.user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {entry.user.firstName} {entry.user.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.problemsSolved} problems • {Math.round(entry.totalScore)} points
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button variant="ghost" asChild>
            <Link href="/leaderboard" className="text-green-500 hover:text-green-600">
              View Full Leaderboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
