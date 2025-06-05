import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import type { User } from "@shared/schema";

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState("all");
  const [limit, setLimit] = useState(50);

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard", { limit }],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-400" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
            {rank}
          </div>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return (
        <Badge 
          className={`${
            rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
            rank === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' :
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
          }`}
        >
          #{rank}
        </Badge>
      );
    }
    return <Badge variant="outline">#{rank}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/6"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const topThree = leaderboard?.slice(0, 3) || [];
  const restOfLeaderboard = leaderboard?.slice(3) || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank against other developers in the community.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="daily">Today</SelectItem>
            </SelectContent>
          </Select>
          <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">Top 25</SelectItem>
              <SelectItem value="50">Top 50</SelectItem>
              <SelectItem value="100">Top 100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Top Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThree.map((user: User, index: number) => {
              const rank = index + 1;
              return (
                <Card 
                  key={user.id} 
                  className={`text-center ${
                    rank === 1 ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950' :
                    rank === 2 ? 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950' :
                    'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      {getRankIcon(rank)}
                    </div>
                    <Avatar className="h-16 w-16 mx-auto mb-4">
                      <AvatarImage src={user.profileImageUrl || ""} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="text-lg">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="text-2xl font-bold text-foreground mb-2">
                      {user.totalPoints || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">points</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Problems:</span>
                        <span className="font-medium">{user.problemsSolved || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Streak:</span>
                        <span className="font-medium">{user.currentStreak || 0} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Rest of Leaderboard */}
      {restOfLeaderboard.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Leaderboard Rankings {topThree.length > 0 ? `(#4 - #${leaderboard.length})` : ''}
          </h2>
          <div className="space-y-3">
            {restOfLeaderboard.map((user: User, index: number) => {
              const rank = index + 4; // Start from 4 since top 3 are shown separately
              return (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          {getRankBadge(rank)}
                        </div>
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={user.profileImageUrl || ""} alt={`${user.firstName} ${user.lastName}`} />
                          <AvatarFallback>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {user.firstName} {user.lastName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{user.problemsSolved || 0} problems</span>
                            <span>{user.currentStreak || 0} day streak</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-foreground">
                          {user.totalPoints || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">points</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!leaderboard || leaderboard.length === 0) && (
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No leaderboard data available yet.</p>
          <p className="text-sm text-muted-foreground">
            Start solving problems to appear on the leaderboard!
          </p>
          <Button className="mt-4" onClick={() => window.location.href = "/problems"}>
            Solve Problems
          </Button>
        </div>
      )}

      {/* Load More */}
      {leaderboard && leaderboard.length >= limit && (
        <div className="text-center mt-8">
          <Button 
            variant="outline"
            onClick={() => setLimit(limit + 25)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
