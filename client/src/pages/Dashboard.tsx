import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProblemModal } from "@/components/ProblemModal";
import { useState } from "react";
import { 
  CheckCircle, 
  Trophy, 
  Flame, 
  GraduationCap, 
  Clock, 
  Calendar,
  Users,
  TrendingUp,
  X
} from "lucide-react";
import type { Problem, Contest, Submission } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);

  const { data: recentProblems = [] } = useQuery({
    queryKey: ["/api/problems", { limit: 5 }],
  });

  const { data: contests = [] } = useQuery({
    queryKey: ["/api/contests"],
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard", { limit: 3 }],
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["/api/submissions"],
  });

  const progress = user?.progress;
  const upcomingContests = contests.filter((contest: Contest) => 
    new Date(contest.startTime) > new Date()
  ).slice(0, 2);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getSubmissionStatus = (problemId: number) => {
    const problemSubmissions = submissions.filter((sub: Submission) => sub.problemId === problemId);
    if (problemSubmissions.length === 0) return "not-attempted";
    
    const hasAccepted = problemSubmissions.some((sub: Submission) => sub.status === "accepted");
    if (hasAccepted) return "solved";
    
    return "attempted";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "solved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "attempted":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full" />;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Continue your coding journey and track your progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Problems Solved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {progress?.problemsSolved || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                +{Math.floor(Math.random() * 5) + 1} this week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Contest Rank</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {progress?.contestRank || "Unranked"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Trophy className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                {Math.floor(Math.random() * 50) + 10} positions
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {progress?.currentStreak || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Flame className="text-orange-500 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                days active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Points</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {progress?.totalPoints || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-purple-500 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Total earned
              </span>
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
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Problems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProblems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No problems available</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Check back later for new challenges
                    </p>
                  </div>
                ) : (
                  recentProblems.map((problem: Problem) => {
                    const status = getSubmissionStatus(problem.id);
                    return (
                      <div
                        key={problem.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => setSelectedProblemId(problem.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center">
                            {getStatusIcon(status)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {problem.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getDifficultyColor(problem.difficulty)}>
                                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                              </Badge>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {problem.tags?.slice(0, 2).join(", ")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium capitalize text-gray-600 dark:text-gray-300">
                            {status === "solved" ? "Solved" : status === "attempted" ? "Attempted" : "New"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => window.location.href = "/problems"}
                >
                  View All Problems
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Upcoming Contests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Contests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingContests.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">No upcoming contests</p>
                  </div>
                ) : (
                  upcomingContests.map((contest: Contest) => (
                    <div key={contest.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {contest.title}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{new Date(contest.startTime).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{contest.participants?.length || 0} registered</span>
                        </div>
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                        Register Now
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">No leaderboard data</p>
                  </div>
                ) : (
                  leaderboard.map((entry: any, index: number) => (
                    <div key={entry.userId} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0 ? "bg-yellow-400" : 
                        index === 1 ? "bg-gray-400" : 
                        "bg-orange-400"
                      }`}>
                        {index + 1}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={entry.user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {entry.user.firstName?.[0]}{entry.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {entry.user.firstName} {entry.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.totalPoints} points
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  className="text-green-600 dark:text-green-400 text-sm font-medium hover:text-green-700 dark:hover:text-green-300"
                  onClick={() => window.location.href = "/leaderboard"}
                >
                  View Full Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Problem Modal */}
      <ProblemModal
        problemId={selectedProblemId}
        isOpen={!!selectedProblemId}
        onClose={() => setSelectedProblemId(null)}
      />
    </div>
  );
}
