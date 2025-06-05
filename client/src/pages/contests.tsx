import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, Trophy, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ContestCard from "@/components/contest/contest-card";

export default function Contests() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: allContests, isLoading } = useQuery({
    queryKey: ["/api/contests"],
  });

  const { data: upcomingContests } = useQuery({
    queryKey: ["/api/contests/upcoming"],
  });

  const now = new Date();
  const ongoingContests = allContests?.filter(contest => 
    new Date(contest.startTime) <= now && new Date(contest.endTime) >= now
  ) || [];

  const pastContests = allContests?.filter(contest => 
    new Date(contest.endTime) < now
  ) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contests</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Compete with developers worldwide in programming contests.
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button className="bg-arena-green hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Contest
          </Button>
        )}
      </div>

      {/* Contest Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming ({upcomingContests?.length || 0})</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing ({ongoingContests.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastContests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid gap-6">
            {upcomingContests?.length ? (
              upcomingContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} type="upcoming" />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Upcoming Contests
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Check back soon for new contests, or create one if you're an admin.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ongoing" className="mt-6">
          <div className="grid gap-6">
            {ongoingContests.length ? (
              ongoingContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} type="ongoing" />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Ongoing Contests
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    No contests are currently active. Check the upcoming tab for scheduled contests.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="grid gap-6">
            {pastContests.length ? (
              pastContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} type="past" />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Past Contests
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Past contest results will appear here after contests conclude.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Contest Stats */}
      {allContests?.length ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Contests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {allContests.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {allContests.reduce((total, contest) => 
                  total + (contest.participants?.length || 0), 0
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Prize Pool Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {allContests.filter(c => c.prizePool).length > 0 ? "Active" : "No prizes"}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
