import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Trophy, Flame, GraduationCap, Calendar, Users } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/stats`],
    enabled: !!user?.id,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const { data: recentProblems, isLoading: problemsLoading } = useQuery({
    queryKey: ["/api/problems"],
    select: (data) => data?.slice(0, 3),
  });

  const { data: upcomingContests, isLoading: contestsLoading } = useQuery({
    queryKey: ["/api/contests/upcoming"],
    select: (data) => data?.slice(0, 2),
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    select: (data) => data?.slice(0, 3),
  });

  if (statsLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = user?.problemsSolved ? (user.problemsSolved / 120) * 100 : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.firstName || "Coder"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Continue your coding journey and track your progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Problems Solved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {user?.problemsSolved || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-arena-green text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">
                +{userStats?.acceptedSubmissions || 0} accepted
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contest Rank</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {userStats?.rank || user?.contestRank || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Trophy className="text-arena-blue text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600 font-medium">Global ranking</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {user?.currentStreak || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Flame className="text-orange-500 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-orange-600 font-medium">days active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Course Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {Math.round(progressPercentage)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-purple-500 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-purple-600 font-medium">Data Structures</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Problems */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {problemsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))
                ) : recentProblems?.length ? (
                  recentProblems.map((problem) => (
                    <Link key={problem.id} href={`/problems/${problem.id}`}>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-arena-green text-white rounded-lg flex items-center justify-center font-medium">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{problem.title}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                problem.difficulty === 'easy' ? 'default' :
                                problem.difficulty === 'medium' ? 'secondary' : 'destructive'
                              }>
                                {problem.difficulty}
                              </Badge>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {problem.tags?.slice(0, 2).join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-500">Click to solve</p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No problems available yet.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 text-center">
                <Link href="/problems">
                  <Button className="bg-arena-green hover:bg-green-600 text-white">
                    View All Problems
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Upcoming Contests */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Contests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contestsLoading ? (
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))
                ) : upcomingContests?.length ? (
                  upcomingContests.map((contest) => (
                    <div key={contest.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">{contest.title}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{new Date(contest.startTime).toLocaleTimeString()}</span>
                        </div>
                        {contest.participants && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{contest.participants.length} registered</span>
                          </div>
                        )}
                      </div>
                      <Button className="w-full bg-arena-blue hover:bg-blue-600 text-white mt-4">
                        Register Now
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">No upcoming contests.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))
                ) : leaderboard?.length ? (
                  leaderboard.map((user, index) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${
                        index === 0 ? 'bg-yellow-400' : 
                        index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      } text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                        {index + 1}
                      </div>
                      {user.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.firstName?.[0] || user.email?.[0] || '?'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.firstName && user.lastName ? 
                            `${user.firstName} ${user.lastName}` : 
                            user.email?.split('@')[0] || 'Anonymous'
                          }
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.totalPoints || 0} points
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">No leaderboard data available.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <Link href="/leaderboard">
                  <Button variant="ghost" className="text-arena-green hover:text-green-600">
                    View Full Leaderboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
