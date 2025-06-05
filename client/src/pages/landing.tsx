import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Trophy, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Code className="text-white h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CodeArena</h1>
          </div>
          <Button asChild size="lg" className="bg-green-500 hover:bg-green-600 text-white">
            <a href="/api/login">Get Started</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Master Coding Through
            <span className="text-green-500"> Competition</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers improving their skills through challenging problems, 
            live contests, and comprehensive courses on CodeArena.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-500 hover:bg-green-600 text-white">
              <a href="/api/login">Start Coding Now</a>
            </Button>
            <Button variant="outline" size="lg">
              View Problems
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose CodeArena?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code className="text-blue-500 h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Practice Problems
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Solve thousands of problems across different difficulty levels and topics.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Trophy className="text-green-500 h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Live Contests
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Participate in weekly contests and compete with developers worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="text-purple-500 h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Community
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Learn from peers, share solutions, and discuss approaches.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-orange-500 h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Real-time Execution
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Test your code instantly with our powerful online judge system.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-green-500">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Level Up Your Coding Skills?
          </h3>
          <p className="text-green-100 text-lg mb-8">
            Join CodeArena today and start your journey to becoming a better programmer.
          </p>
          <Button asChild size="lg" variant="secondary">
            <a href="/api/login">Sign Up Free</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Code className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-white">CodeArena</span>
          </div>
          <p className="text-sm">
            © 2024 CodeArena. Built for developers, by developers.
          </p>
        </div>
      </footer>
    </div>
  );
}
