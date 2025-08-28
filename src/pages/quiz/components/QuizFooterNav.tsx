// src/pages/quiz/components/QuizFooterNav.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";

type Props = {
  index: number;
  total: number;
  isSubmitting: boolean;
  lastSavedAt?: string | null;
  onPrev: () => void;
  onNext: () => void;
  onOpenSubmit: () => void;
};

export function QuizFooterNav({
  index,
  total,
  isSubmitting,
  lastSavedAt,
  onPrev,
  onNext,
  onOpenSubmit,
}: Props) {
  const isLast = index === total - 1;

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <Button variant="outline" onClick={onPrev} disabled={index === 0} className="quiz-focus">
        <ChevronLeft size={18} />
        Previous
      </Button>

      <div className="flex items-center gap-3">
        {lastSavedAt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Save size={12} />
            <span>Auto-saved</span>
          </div>
        )}

        <span className="text-sm text-muted-foreground">
          {index + 1} of {total}
        </span>
      </div>

      {isLast ? (
        <Button onClick={onOpenSubmit} disabled={isSubmitting} className="quiz-button-primary">
          <Send size={18} />
          Submit Quiz
        </Button>
      ) : (
        <Button onClick={onNext} className="quiz-button-primary">
          Next
          <ChevronRight size={18} />
        </Button>
      )}
    </div>
  );
}
