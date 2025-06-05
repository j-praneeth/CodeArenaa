import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Play,
  CheckCircle2
} from "lucide-react";
import type { Contest } from "@shared/schema";

export default function Contests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contests = [], isLoading } = useQuery({
    queryKey: ["/api/contests"],
  });

  const registerMutation = useMutation({
    mutationFn: async (contestId: number) => {
      const response = await apiRequest("POST", `/api/contests/${contestId}/register`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You have been registered for the contest!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const now = new Date();
  const upcomingContests = contests.filter((contest: Contest) => 
    new Date(contest.startTime) > now
  );
  const activeContests = contests.filter((contest: Contest) => 
    new Date(contest.startTime) <= now && new Date(contest.endTime) > now
  );
  const pastContests = contests.filter((contest: Contest) => 
    new Date(contest.endTime) <= now
  );

  const getContestStatus = (contest: Contest) => {
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);
    
    if (now < startTime) return "upcoming";
    if (now >= startTime && now < endTime) return "active";
    return "past";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Upcoming</Badge>;
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Live</Badge>;
      case "past":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Ended</Badge>;
      default:
        return null;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const ContestCard = ({ contest }: { contest: Contest }) => {
    const status = getContestStatus(contest);
    const startDateTime = formatDateTime(contest.startTime);
    const endDateTime = formatDateTime(contest.endTime);
    const duration = Math.round((new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) / (1000 * 60 * 60));

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg text-gray-900 dark:text-white mb-2">
                {contest.title}
              </CardTitle>
              {getStatusBadge(status)}
            </div>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {contest.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {contest.description}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Start</p>
                <p className="text-gray-600 dark:text-gray-300">{startDateTime.date}</p>
                <p className="text-gray-600 dark:text-gray-300">{startDateTime.time}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Duration</p>
                <p className="text-gray-600 dark:text-gray-300">{duration}h</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {contest.participants?.length || 0} participants
                </span>
              </div>
              {contest.prizePool && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {contest.prizePool}
                  </span>
                </div>
              )}
            </div>
            
            {status === "upcoming" && (
              <Button
                size="sm"
                onClick={() => registerMutation.mutate(contest.id)}
                disabled={registerMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {registerMutation.isPending ? "Registering..." : "Register"}
              </Button>
            )}
            
            {status === "active" && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Join Now
              </Button>
            )}
            
            {status === "past" && (
              <Button size="sm" variant="outline">
                View Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Contests
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Participate in coding contests and compete with developers worldwide
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{upcomingContests.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activeContests.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Live Now</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{pastContests.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contests Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="active">Live</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : upcomingContests.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No upcoming contests</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Check back later for new contests
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeContests.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Play className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No live contests</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  No contests are currently running
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastContests.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No past contests</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Past contests will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
