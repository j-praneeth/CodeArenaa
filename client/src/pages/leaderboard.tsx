import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("global");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    select: (data) => data?.slice(0, 50), // Top 50 users
  });

  const { data: userStats } = useQuery({
    queryKey: [`/api/users/${user?.id}/stats`],
    enabled: !!user?.id,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 10) return "bg-gold-100 text-gold-800 border-gold-200";
    if (rank <= 50) return "bg-silver-100 text-silver-800 border-silver-200";
    if (rank <= 100) return "bg-bronze-100 text-bronze-800 border-bronze-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track your progress and compete with top performers.
        </p>
      </div>

      {/* User Stats Card */}
      {user && userStats && (
        <Card className="mb-8 bg-gradient-to-r from-arena-green/10 to-arena-blue/10 border-arena-green/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-arena-green" />
              <span>Your Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  #{userStats.rank}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Global Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {userStats.problemsSolved}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {user.totalPoints || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {Math.round((userStats.acceptedSubmissions / Math.max(userStats.totalSubmissions, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard?.length ? (
                  leaderboard.map((leaderUser, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user?.id === leaderUser.id;
                    
                    return (
                      <div 
                        key={leaderUser.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          isCurrentUser 
                            ? 'bg-arena-green/10 border-arena-green/30' 
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 flex items-center justify-center">
                            {getRankIcon(rank)}
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {leaderUser.profileImageUrl ? (
                              <img 
                                src={leaderUser.profileImageUrl} 
                                alt={`${leaderUser.firstName} ${leaderUser.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {leaderUser.firstName?.[0] || leaderUser.email?.[0] || '?'}
                                </span>
                              </div>
                            )}
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {leaderUser.firstName && leaderUser.lastName ? 
                                    `${leaderUser.firstName} ${leaderUser.lastName}` : 
                                    leaderUser.email?.split('@')[0] || 'Anonymous'
                                  }
                                </h3>
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">You</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {leaderUser.problemsSolved || 0} problems solved
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {leaderUser.totalPoints || 0}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">points</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Rankings Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Be the first to solve problems and claim the top spot!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Monthly Leaderboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monthly rankings feature coming soon. Track your monthly progress!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Weekly Leaderboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Weekly rankings feature coming soon. Compete weekly with others!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
