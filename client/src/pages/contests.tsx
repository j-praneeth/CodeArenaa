import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Trophy, MapPin } from "lucide-react";

export default function Contests() {
  const { data: contests, isLoading } = useQuery({
    queryKey: ["/api/contests"],
    retry: false,
  });

  // Mock upcoming contests data
  const mockContests = [
    {
      id: 1,
      title: "Weekly Contest 127",
      description: "Join our weekly competitive programming contest featuring 4 challenging problems.",
      startTime: "2024-12-15T19:00:00Z",
      endTime: "2024-12-15T21:30:00Z",
      participants: 1247,
      prizePool: "500",
      status: "upcoming",
      difficulty: "medium",
    },
    {
      id: 2,
      title: "Monthly Challenge December",
      description: "Special monthly contest with exclusive prizes and recognition.",
      startTime: "2024-12-20T18:00:00Z",
      endTime: "2024-12-20T22:00:00Z",
      participants: 856,
      prizePool: "1500",
      status: "upcoming",
      difficulty: "hard",
    },
    {
      id: 3,
      title: "Beginner's Cup",
      description: "Perfect contest for newcomers to competitive programming.",
      startTime: "2024-12-10T20:00:00Z",
      endTime: "2024-12-10T22:00:00Z",
      participants: 2134,
      prizePool: "200",
      status: "completed",
      difficulty: "easy",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "live":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const upcomingContests = mockContests.filter(c => c.status === "upcoming");
  const completedContests = mockContests.filter(c => c.status === "completed");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Contests
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Participate in competitive programming contests and test your skills against others.
              </p>
            </div>

            {/* Upcoming Contests */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Upcoming Contests
              </h2>
              
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {upcomingContests.map((contest) => (
                    <Card key={contest.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{contest.title}</CardTitle>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getStatusColor(contest.status)}>
                                {contest.status}
                              </Badge>
                              <Badge className={getDifficultyColor(contest.difficulty)}>
                                {contest.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <Trophy className="h-6 w-6 text-yellow-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {contest.description}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(contest.startTime)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>
                              {formatTime(contest.startTime)} - {formatTime(contest.endTime)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{contest.participants} registered</span>
                          </div>
                          
                          {contest.prizePool && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Trophy className="h-4 w-4 mr-2" />
                              <span>${contest.prizePool} Prize Pool</span>
                            </div>
                          )}
                        </div>
                        
                        <Button className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white">
                          Register Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Past Contests */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Past Contests
              </h2>
              
              <div className="grid gap-4">
                {completedContests.map((contest) => (
                  <Card key={contest.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {contest.title}
                            </h3>
                            <Badge className={getStatusColor(contest.status)}>
                              {contest.status}
                            </Badge>
                            <Badge className={getDifficultyColor(contest.difficulty)}>
                              {contest.difficulty}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            {contest.description}
                          </p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(contest.startTime)}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{contest.participants} participants</span>
                            </div>
                            {contest.prizePool && (
                              <div className="flex items-center">
                                <Trophy className="h-4 w-4 mr-1" />
                                <span>${contest.prizePool}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline">
                            View Results
                          </Button>
                          <Button variant="outline">
                            Practice
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
