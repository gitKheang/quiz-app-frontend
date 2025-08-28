import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import type { QuestionDTO } from "@/types/quiz";

// Loosely describe an option shape we can read from
type AnyOption = {
  id?: string;
  optionId?: string;
  value?: string;
  text?: string;
  label?: string;
  explanation?: string;
  desc?: string;
};

// Narrow helpers
function isMultipleType(t: unknown): boolean {
  // support 'multi', 'multiple'
  return t === "multi" || t === "multiple";
}

function getQuestionTitle(q: any): string {
  return q?.title ?? q?.text ?? q?.prompt ?? "Question";
}

function getQuestionDescription(q: any): string | undefined {
  return q?.description ?? q?.detail ?? q?.subtitle ?? undefined;
}

function getOptions(q: any): AnyOption[] {
  const arr = Array.isArray(q?.options) ? q.options : [];
  return arr as AnyOption[];
}

function getOptionId(opt: AnyOption): string {
  return String(opt.id ?? opt.optionId ?? opt.value ?? "");
}

function getOptionText(opt: AnyOption): string {
  return String(opt.text ?? opt.label ?? opt.value ?? "");
}

function getOptionExplanation(opt: AnyOption): string | undefined {
  return opt.explanation ?? opt.desc ?? undefined;
}

type Props = {
  question: QuestionDTO;
  selectedOptions?: string[];
  onAnswerChange: (optionIds: string[]) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
  questionNumber: number;
  totalQuestions: number;
};

export function QuestionCard({
  question,
  selectedOptions = [],
  onAnswerChange,
  isFlagged,
  onToggleFlag,
  questionNumber,
  totalQuestions,
}: Props) {
  // Support both "multi" and old "multiple"
  const isMultiple = isMultipleType((question as any).type);

  const options = getOptions(question);
  const title = getQuestionTitle(question);
  const description = getQuestionDescription(question);

  const toggleOption = (optId: string) => {
    if (!optId) return;
    if (isMultiple) {
      const set = new Set(selectedOptions);
      set.has(optId) ? set.delete(optId) : set.add(optId);
      onAnswerChange(Array.from(set));
    } else {
      onAnswerChange([optId]);
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Question {questionNumber} / {totalQuestions}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        </div>
        <Button
          variant={isFlagged ? "destructive" : "outline"}
          size="sm"
          onClick={onToggleFlag}
          className="quiz-focus"
          title={isFlagged ? "Unflag question" : "Flag question"}
        >
          <Flag className={cn("h-4 w-4", isFlagged && "fill-current")} />
        </Button>
      </div>

      {description && (
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      )}

      <div className="mt-5 space-y-2">
        {options.map((opt) => {
          const optId = getOptionId(opt);
          const text = getOptionText(opt);
          const explain = getOptionExplanation(opt);
          const active = selectedOptions.includes(optId);

          return (
            <button
              key={optId}
              onClick={() => toggleOption(optId)}
              className={cn(
                "w-full text-left rounded-lg border px-4 py-3 transition-colors",
                "hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring",
                active ? "border-primary bg-primary/10" : "border-border bg-background"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-1 h-4 w-4 rounded-full border",
                    active ? "border-primary bg-primary" : "border-muted-foreground/40"
                  )}
                />
                <div>
                  <p className="font-medium">{text}</p>
                  {explain && (
                    <p className="text-xs text-muted-foreground mt-1">{explain}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
