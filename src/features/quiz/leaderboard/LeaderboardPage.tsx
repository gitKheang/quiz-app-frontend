// Leaderboard page – split container

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCategories, useLeaderboard } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import type { LeaderboardRange } from "@/types/quiz";
import { useAuthStore } from "@/stores/auth";

import LeaderboardFilters from "./LeaderboardFilters";
import LeaderboardPodium from "./LeaderboardPodium";
import LeaderboardTable from "./LeaderboardTable";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<LeaderboardRange>("all");

  const { data: categories } = useCategories();
  const { data: leaderboard, isLoading, refetch } = useLeaderboard({
    categoryId: selectedCategory,
    range: activeTab,
    limit: 50,
  });

  const currentCategoryName =
    categories?.find((c) => c.id === selectedCategory)?.name ?? "All Categories";

  // Pull the last saved result from sessionStorage so we can highlight that rank.
  const { lastRank } = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("lastQuizResult");
      if (!raw) return { lastRank: undefined as number | undefined };
      const parsed = JSON.parse(raw) as {
        rank?: number;
        userName?: string | null;
      };
      return { lastRank: parsed?.rank };
    } catch {
      return { lastRank: undefined as number | undefined };
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="quiz-focus"
            >
              <ArrowLeft size={18} />
            </Button>
            <div className="flex items-center space-x-2">
              <Trophy size={18} className="text-primary" />
              <span className="text-lg font-semibold">Leaderboard</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              title="Refresh"
            >
              <RefreshCw size={16} />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <div className="quiz-gradient-hero w-16 h-16 rounded-2xl flex items-center justify-center">
                <Trophy size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Quiz Champions</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compete with quiz masters worldwide and climb the ranks. Challenge
              yourself to reach the top!
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <LeaderboardFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onChangeCategory={setSelectedCategory}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
            />
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              {(["daily", "weekly", "monthly", "all"] as LeaderboardRange[]).map(
                (tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-6">
                    {/* Section header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">
                          {tab === "all"
                            ? "All Time Champions"
                            : tab[0].toUpperCase() + tab.slice(1)}
                        </h2>
                        <p className="text-muted-foreground">
                          {currentCategoryName} • Top performers
                        </p>
                      </div>
                      <Link to="/quiz/new">
                        <Button className="quiz-button-primary">Start New Quiz</Button>
                      </Link>
                    </div>

                    {/* Top 3 */}
                    <LeaderboardPodium leaderboard={leaderboard} />

                    {/* Table */}
                    <LeaderboardTable
                      isLoading={isLoading}
                      leaderboard={leaderboard}
                      highlightName={user?.name}
                      highlightRank={lastRank}
                    />
                  </TabsContent>
                )
              )}
              <TabsList className="sr-only">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="quiz-card text-center p-8">
              <div className="space-y-4">
                <Trophy size={32} className="mx-auto text-primary" />
                <h3 className="text-lg font-semibold">
                  Think you can make it to the top?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Challenge yourself and see how you rank against other quiz
                  masters.
                </p>
                {/* add gap below the paragraph */}
                <Link to="/quiz/new" className="inline-block mt-6">
                  <Button className="quiz-button-primary">Start New Quiz</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
