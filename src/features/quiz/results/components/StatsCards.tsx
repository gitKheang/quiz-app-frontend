"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Clock, Target, XCircle, HelpCircle } from "lucide-react";
import type { SubmitQuizResp } from "@/types/quiz";
import { formatTime } from "../utils";

type Props = { results: SubmitQuizResp };

export default function StatsCards({ results }: Props) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="quiz-card text-center">
          <div className="space-y-3">
            <Target className="w-10 h-10 mx-auto text-green-500" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {results.correctCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Correct Answers
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <Card className="quiz-card text-center">
          <div className="space-y-3">
            <XCircle className="w-10 h-10 mx-auto text-red-500" />
            <div>
              <div className="text-2xl font-bold text-red-600">
                {results.incorrectCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Incorrect Answers
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="quiz-card text-center">
          <div className="space-y-3">
            <HelpCircle className="w-10 h-10 mx-auto text-orange-500" />
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {results.unselectedCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Unselected Answers
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        <Card className="quiz-card text-center">
          <div className="space-y-3">
            <Clock className="w-10 h-10 mx-auto text-primary" />
            <div>
              <div className="text-2xl font-bold">
                {formatTime(results.timeTakenSec)}
              </div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
