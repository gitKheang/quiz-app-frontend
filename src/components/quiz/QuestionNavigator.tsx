// Question navigator component for quiz navigation

import { motion } from "framer-motion";
import { Flag, Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answeredQuestions: Set<string>;
  flaggedQuestions: Set<string>;
  questionIds: string[];
  onNavigate: (index: number) => void;
  className?: string;
  variant?: "sidebar" | "grid" | "compact";
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answeredQuestions,
  flaggedQuestions,
  questionIds,
  onNavigate,
  className,
  variant = "sidebar",
}: QuestionNavigatorProps) {
  const getQuestionStatus = (index: number) => {
    const questionId = questionIds[index];
    const isAnswered = answeredQuestions.has(questionId);
    const isFlagged = flaggedQuestions.has(questionId);
    const isCurrent = index === currentIndex;
    return { isAnswered, isFlagged, isCurrent, questionId };
  };

  const getStatusIcon = (s: ReturnType<typeof getQuestionStatus>) => {
    if (s.isAnswered) return Check;
    if (s.isFlagged) return Flag;
    return Circle;
  };

  const getStatusColor = (s: ReturnType<typeof getQuestionStatus>) => {
    if (s.isCurrent) return "bg-primary text-primary-foreground";
    if (s.isAnswered && s.isFlagged)
      return "bg-quiz-answered border-warning border-2";
    if (s.isAnswered) return "bg-quiz-answered text-white";
    if (s.isFlagged) return "bg-warning text-warning-foreground";
    return "bg-muted text-muted-foreground hover:bg-muted/80";
  };

  // compact + grid variants

  if (variant !== "sidebar") {
  }

  // Sidebar: full-height + sticky footer
  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="font-semibold">Questions</h3>
        <div className="text-sm text-muted-foreground">
          {answeredQuestions.size}/{totalQuestions}
        </div>
      </div>

      {/* Scrollable area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full px-4 py-2">
          <div className="space-y-2">
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const s = getQuestionStatus(i);
              const Icon = getStatusIcon(s);

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => onNavigate(i)}
                    className={cn(
                      "w-full justify-start gap-3 h-auto p-3 transition-all duration-200",
                      getStatusColor(s)
                    )}
                    aria-label={`Question ${i + 1}${
                      s.isAnswered ? " (answered)" : ""
                    }${s.isFlagged ? " (flagged)" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-xs font-semibold">
                        {i + 1}
                      </span>
                      <Icon size={14} />
                    </div>

                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">
                        Question {i + 1}
                      </div>
                      <div className="text-xs opacity-80">
                        {s.isAnswered && s.isFlagged
                          ? "Answered • Flagged"
                          : s.isAnswered
                          ? "Answered"
                          : s.isFlagged
                          ? "Flagged for review"
                          : "Not answered"}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Footer pinned to screen bottom */}
      <div className="sticky bottom-0 border-t px-4 py-3 text-xs text-muted-foreground bg-background/95 backdrop-blur">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Check size={12} className="text-quiz-answered" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag size={12} className="text-warning" />
            <span>Flagged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
