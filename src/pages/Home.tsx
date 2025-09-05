// src/pages/Home.tsx

import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Clock, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCategories } from "@/hooks/useQueries";
import { useAuthStore } from "@/stores/auth";

export default function Home() {
  const { data: categories, isLoading } = useCategories();

  const stats = [
    { icon: Users, label: "Active Players", value: "10,000+" },
    { icon: Target, label: "Questions", value: "500+" },
    { icon: Trophy, label: "Daily Champions", value: "50+" },
    { icon: Clock, label: "Avg. Quiz Time", value: "12 min" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="shadow-md sticky top-0 z-50 bg-background px-4 py-4 mt-2">
        <div className="container mx-auto flex items-center justify-between">
          {/* Left-hand side: Logo */}
          <div>
            <Link to="/">
              <h1 className="text-xl font-bold text-primary">QuizMaster</h1>
            </Link>
          </div>

          {/* Right-hand side: Buttons (auth-aware) */}
          <HomeHeaderActions />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 quiz-gradient-hero opacity-5" />
          <div className="container mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Test Your Knowledge,
                <br />
                <span className="quiz-gradient-hero bg-clip-text text-transparent">
                  Challenge Yourself
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join thousands of quiz enthusiasts in exciting knowledge
                battles. Choose from multiple categories, track your progress,
                and compete on global leaderboards.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/quiz/new">
                  <Button size="lg" className="quiz-button-primary group">
                    Start Quiz Now
                    <ArrowRight
                      size={18}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="outline" size="lg" className="quiz-focus">
                    View Leaderboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                    <stat.icon size={24} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Choose Your Challenge
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore diverse categories and test your knowledge across
                different subjects.
              </p>
            </motion.div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories?.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="quiz-card-hover group cursor-pointer h-full">
                      <Link
                        to="/quiz/new"
                        state={{ selectedCategory: category.id }}
                        className="block p-6 h-full"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color,
                              }}
                            >
                              {category.icon}
                            </div>
                            <ArrowRight
                              size={18}
                              className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
                            />
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {category.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {category.questionCount} questions
                            </span>
                            <span className="text-primary font-medium">
                              Start Quiz →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary/5">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Test Your Knowledge?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join the challenge today and see how you rank against quiz
                masters worldwide.
              </p>
              <Link to="/quiz/new">
                <Button size="lg" className="quiz-button-primary">
                  Start Your First Quiz
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>
            &copy; 2025 QuizMaster. Built with React, TypeScript, and Tailwind
            CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}

/** ---- tiny helper: robust admin detection (logic-only, no UI change) ---- */
function isAdminUser(user: any): boolean {
  const check = (role: unknown): boolean => {
    if (!role) return false;
    if (typeof role === "string") {
      const r = role.trim().toUpperCase();
      return r === "ADMIN" || r === "ROLE_ADMIN" || r.includes("ADMIN");
    }
    if (Array.isArray(role)) return role.some(check);
    if (typeof role === "object") {
      const o = role as Record<string, unknown>;
      return ["role", "roles", "name", "value", "type"].some((k) => check(o[k]));
    }
    return false;
  };

  return (
    !!user &&
    (check(user.role) ||
      check(user.roles) ||
      check(user.permissions) ||
      check(user.claims?.role) ||
      check(user.claims?.roles))
  );
}

/** Auth-aware header actions; preserves Sign in / Sign up styles exactly */
function HomeHeaderActions() {
  const navigate = useNavigate();
  const { user, initializing, loading, signOut } = useAuthStore();

  return (
    <div className="flex items-center space-x-4">
      <Link to="/leaderboard">
        <Button variant="ghost" size="sm" className="quiz-focus">
          Leaderboard
        </Button>
      </Link>

      {/* Admin button (shows for any admin-like role) */}
      {isAdminUser(user) && (
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="quiz-focus">
            Admin
          </Button>
        </Link>
      )}

      {/* Signed-out */}
      {!initializing && !user && (
        <>
          <Link to="/signin">
            <Button
              variant="outline"
              size="sm"
              className="border border-gray-600 text-gray-600 hover:bg-gray-20 hover:shadow-md rounded-md px-4 py-2 transition duration-200"
            >
              Sign in
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-md px-4 py-2"
            >
              Sign up
            </Button>
          </Link>
        </>
      )}

      {/* Signed-in (user or admin) */}
      {!initializing && user && (
        <Button
          size="sm"
          variant="destructive"
          disabled={loading}
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
        >
          Log out
        </Button>
      )}

      <ThemeToggle />
    </div>
  );
}
