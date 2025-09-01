"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CheckCircle, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import type { SubmitQuizResp } from "@/types/quiz";

type Props = {
  results: SubmitQuizResp;
  questions?: Array<{
    id: string;
    text: string;
    options: Array<{ id: string; text: string }>;
    explanation?: string;
  }>;
};

function AnswerChips({
  labels,
  variant = "outline",
}: {
  labels: string[];
  variant?: "outline" | "default";
}) {
  if (!labels || labels.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((t, i) => (
        <Badge key={`${t}-${i}`} variant={variant} className="mr-1">
          {t}
        </Badge>
      ))}
    </div>
  );
}

export default function ReviewPanel({ results, questions = [] }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Fast lookup for option text fallbacks
  const qMap = useMemo(() => {
    const m = new Map<
      string,
      {
        id: string;
        text: string;
        options: Array<{ id: string; text: string }>;
        explanation?: string;
      }
    >();
    for (const q of questions) m.set(q.id, q);
    return m;
  }, [questions]);

  // Keep expanded state in sync with showAll
  useEffect(() => {
    if (showAll) {
      setExpanded(new Set(results.breakdown.map((b) => b.questionId)));
    } else {
      setExpanded(new Set());
    }
  }, [showAll, results.breakdown]);

  const toggleOne = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  const getOptionText = (questionId: string, optionId: string): string => {
    const q = qMap.get(questionId);
    const opt = q?.options.find((o) => o.id === optionId);
    return opt?.text ?? optionId;
  };

  const idsToTexts = (questionId: string, ids: string[]) =>
    ids.map((id) => getOptionText(questionId, id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Question Review</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Collapse All" : "Expand All"}
          {showAll ? (
            <ChevronUp size={16} className="ml-2" />
          ) : (
            <ChevronDown size={16} className="ml-2" />
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {results.breakdown.map((b, idx) => {
          const isOpen = showAll || expanded.has(b.questionId);
          const q = qMap.get(b.questionId);

          // Prefer server-provided texts; fall back to resolving from question data
          const userLabels = (b as any).userAnswerTexts?.length
            ? (b as any).userAnswerTexts!
            : idsToTexts(b.questionId, b.userAnswerIds);
          const correctLabels = (b as any).correctAnswerTexts?.length
            ? (b as any).correctAnswerTexts!
            : idsToTexts(b.questionId, b.correctAnswerIds);

          return (
            <Collapsible
              key={b.questionId}
              open={isOpen}
              onOpenChange={() => toggleOne(b.questionId)}
            >
              <Card className="quiz-card">
                <CollapsibleTrigger className="w-full text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {b.isCorrect ? (
                        <CheckCircle size={20} className="text-success" />
                      ) : (
                        <XCircle size={20} className="text-destructive" />
                      )}
                      <div>
                        <span className="font-medium">Question {idx + 1}</span>
                        <Badge
                          variant={b.isCorrect ? "default" : "destructive"}
                          className="ml-2"
                        >
                          {b.isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-4 mt-4 text-sm">
                  {q?.text && (
                    <div className="font-medium text-base mb-3">{q.text}</div>
                  )}

                  <div>
                    <span className="font-medium">Your answer:</span>
                    <div className="mt-1">
                      {b.userAnswerIds.length > 0 ? (
                        <AnswerChips labels={userLabels} variant="outline" />
                      ) : (
                        <span className="text-muted-foreground">
                          No answer selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Correct answer:</span>
                    <div className="mt-1">
                      <AnswerChips labels={correctLabels} variant="default" />
                    </div>
                  </div>

                  {b.explanation && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <span className="font-medium">Explanation:</span>
                      <p className="mt-1 text-muted-foreground">
                        {b.explanation}
                      </p>
                    </div>
                  )}
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </motion.div>
  );
}
