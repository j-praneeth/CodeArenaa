import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Trophy, Users, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function Landing() {
  const { isAuthenticated, login, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-blue-600 dark:text-blue-400">CodeArena</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Master your programming skills through challenges, contests, and collaborative learning.
          </p>
          <Button size="lg" onClick={login} className="text-lg px-8 py-3">
            Get Started with Google
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Code className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
              <CardTitle>Practice Problems</CardTitle>
              <CardDescription>
                Solve coding challenges across multiple programming languages
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Trophy className="w-12 h-12 mx-auto text-yellow-600 dark:text-yellow-400 mb-4" />
              <CardTitle>Contests</CardTitle>
              <CardDescription>
                Compete with others in timed programming competitions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto text-green-600 dark:text-green-400 mb-4" />
              <CardTitle>Leaderboards</CardTitle>
              <CardDescription>
                Track your progress and see how you rank against peers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BookOpen className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 mb-4" />
              <CardTitle>Learning Paths</CardTitle>
              <CardDescription>
                Follow structured courses to master programming concepts
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to Start Coding?</CardTitle>
              <CardDescription>
                Join thousands of developers improving their skills on CodeArena
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={login} className="w-full">
                Sign in with Google to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}