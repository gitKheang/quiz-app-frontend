"use client";

import type React from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Trophy } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuthStore } from "@/stores/auth";
import type { SubmitQuizResp } from "@/types/quiz";
import ScoreHeader from "./components/ScoreHeader";
import StatsCards from "./components/StatsCards";
import PerformanceOverview from "./components/PerformanceOverview";
import ReviewPanel from "./components/ReviewPanel";
import ActionButtons from "./components/ActionButtons";

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const results = location.state?.result as SubmitQuizResp | undefined;
  const questions = location.state?.questions;

  // Redirect if results missing (refresh of /results)
  useEffect(() => {
    if (!results) navigate("/");
  }, [results, navigate]);

  // Persist last quiz result so we can highlight user on the leaderboard
  useEffect(() => {
    if (!results) return;
    try {
      const payload = {
        rank: typeof results.rank === "number" ? results.rank : undefined,
        score: results.score,
        timeTakenSec: results.timeTakenSec,
        userName: user?.name ?? null,
        savedAt: new Date().toISOString(),
      };
      sessionStorage.setItem("lastQuizResult", JSON.stringify(payload));
    } catch {
      // non-blocking
    }
  }, [results, user?.name]);

  if (!results) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="quiz-focus"
              title="Back to Home"
            >
              <Home size={18} />
            </Button>
            <div className="flex items-center space-x-2">
              <Trophy size={18} className="text-primary" />
              <span className="text-lg font-semibold">Results</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <ScoreHeader results={results} />
          <StatsCards results={results} />
          <PerformanceOverview results={results} />
          <ReviewPanel results={results} questions={questions} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <ActionButtons results={results} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
