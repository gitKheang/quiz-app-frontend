import { cn } from "@/lib/utils";

type Props = {
  totalQuestions: number;
  currentIndex: number;
  answeredQuestions: Set<string>;
  flaggedQuestions: Set<string>;
  questionIds: string[];
  onNavigate: (index: number) => void;
  variant?: "sidebar" | "compact";
  className?: string;
};

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answeredQuestions,
  flaggedQuestions,
  questionIds,
  onNavigate,
  variant = "sidebar",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "grid gap-2",
        variant === "sidebar" ? "grid-cols-5" : "grid-cols-8",
        className
      )}
    >
      {Array.from({ length: totalQuestions }, (_, i) => {
        const qid = questionIds[i];
        const answered = answeredQuestions.has(qid);
        const flagged = flaggedQuestions.has(qid);
        const isCurrent = i === currentIndex;

        return (
          <button
            key={qid}
            onClick={() => onNavigate(i)}
            className={cn(
              "h-9 w-9 rounded-md text-sm font-medium border transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              isCurrent
                ? "border-primary bg-primary/10"
                : answered
                ? "border-green-500/40 bg-green-500/10"
                : "border-border bg-background",
              flagged && "ring-2 ring-destructive/50"
            )}
            title={`Question ${i + 1}${flagged ? " (flagged)" : ""}${answered ? " (answered)" : ""}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
