"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SubmitQuizResp } from "@/types/quiz";
import { formatTime, getScoreColor } from "../utils";

type Props = { results: SubmitQuizResp };

export default function ScoreHeader({ results }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center space-y-6"
    >
      <div className="relative">
        <div
          className={cn(
            "text-8xl font-bold mb-4",
            getScoreColor(results.score)
          )}
        >
          {results.score}%
        </div>
        <div className="absolute inset-0 quiz-gradient-hero opacity-10 blur-3xl" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold">
        {results.score >= 80
          ? "Excellent Work!"
          : results.score >= 60
          ? "Good Job!"
          : "Keep Practicing!"}
      </h1>

      <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-success" />
          <span>{results.correctCount} correct</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle size={16} className="text-destructive" />
          <span>{results.incorrectCount} incorrect</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{formatTime(results.timeTakenSec)}</span>
        </div>
        {typeof results.rank === "number" && (
          <Badge variant="outline">Rank #{results.rank}</Badge>
        )}
      </div>
    </motion.div>
  );
}
