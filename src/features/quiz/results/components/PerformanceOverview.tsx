import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/quiz/ProgressBar";
import type { SubmitQuizResp } from "@/types/quiz";
import { getScoreVariant } from "../utils";

type Props = { results: SubmitQuizResp };

export default function PerformanceOverview({ results }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="quiz-card">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Performance Overview</h2>
          <ProgressBar
            current={results.correctCount}
            total={results.total}
            variant={getScoreVariant(results.score)}
            size="lg"
          />
          {typeof results.percentile === "number" && (
            <p className="text-sm text-muted-foreground text-center">
              You scored better than {results.percentile}% of quiz takers
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
