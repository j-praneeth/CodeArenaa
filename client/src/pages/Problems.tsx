import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProblemModal } from "@/components/ProblemModal";
import { Search, Filter, CheckCircle, Clock, Play } from "lucide-react";
import type { Problem, Submission } from "@shared/schema";

export default function Problems() {
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ["/api/problems", { limit: 100, difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined }],
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["/api/submissions"],
  });

  const filteredProblems = problems.filter((problem: Problem) => 
    problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    problem.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getDifficultyStats = () => {
    const stats = { easy: 0, medium: 0, hard: 0 };
    problems.forEach((problem: Problem) => {
      if (problem.difficulty in stats) {
        stats[problem.difficulty as keyof typeof stats]++;
      }
    });
    return stats;
  };

  const solvedCount = problems.filter((problem: Problem) => 
    getSubmissionStatus(problem.id) === "solved"
  ).length;

  const stats = getDifficultyStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Problems
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Practice coding problems to improve your skills
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{problems.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Problems</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{solvedCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Solved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Medium</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.hard}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Hard</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Problems List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Problems ({filteredProblems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No problems found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProblems.map((problem: Problem) => {
                const status = getSubmissionStatus(problem.id);
                return (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => setSelectedProblemId(problem.id)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center justify-center">
                        {getStatusIcon(status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {problem.title}
                          </h3>
                          <Badge className={getDifficultyColor(problem.difficulty)}>
                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {problem.tags?.slice(0, 3).join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium capitalize text-gray-600 dark:text-gray-300">
                          {status === "solved" ? "Solved" : status === "attempted" ? "Attempted" : "New"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProblemId(problem.id);
                        }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Solve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Problem Modal */}
      <ProblemModal
        problemId={selectedProblemId}
        isOpen={!!selectedProblemId}
        onClose={() => setSelectedProblemId(null)}
      />
    </div>
  );
}
