// src/pages/quiz/components/QuizHeader.tsx
import { Dispatch, SetStateAction } from "react";
import { X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Timer } from "@/components/quiz/Timer";
import { ProgressBar } from "@/components/quiz/ProgressBar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { QuestionNavigator } from "@/components/quiz/QuestionNavigator";

type Category = { name: string; icon?: string; color?: string };

type Props = {
  category: Category;
  totalQuestions: number;
  answeredCount: number;
  endAt: string;
  serverNow: string;
  onTimeUp: () => void;

  onOpenExit: () => void;

  // Navigator sheet props
  isNavigatorOpen: boolean;
  setIsNavigatorOpen: Dispatch<SetStateAction<boolean>>;
  currentIndex: number;
  answeredQuestions: Set<string>;
  flaggedQuestions: Set<string>;
  questionIds: string[];
  onNavigate: (index: number) => void;
};

export function QuizHeader({
  category,
  totalQuestions,
  answeredCount,
  endAt,
  serverNow,
  onTimeUp,
  onOpenExit,
  isNavigatorOpen,
  setIsNavigatorOpen,
  currentIndex,
  answeredQuestions,
  flaggedQuestions,
  questionIds,
  onNavigate,
}: Props) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onOpenExit} className="quiz-focus">
            <X size={18} />
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{
                backgroundColor: `${category.color ?? "#6366f1"}20`,
                color: category.color ?? "#6366f1",
              }}
            >
              {category.icon ?? "📚"}
            </div>
            <span className="font-medium">{category.name}</span>
          </div>
        </div>

        {/* Center */}
        <div className="hidden md:block flex-1 max-w-xs mx-4">
          <ProgressBar current={answeredCount} total={totalQuestions} showText={false} size="sm" />
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Timer endAt={endAt} serverNow={serverNow} onTimeUp={onTimeUp} size="md" />

          <Sheet open={isNavigatorOpen} onOpenChange={setIsNavigatorOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl">
                <Menu size={16} />
                <span className="hidden sm:inline ml-2">Questions</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-80 sm:w-96 p-0 bg-background/95 border-l border-border flex h-screen max-h-screen flex-col"
            >
              <div className="px-4 py-3 border-b">
                <SheetTitle>Question Navigator</SheetTitle>
              </div>

              <div className="flex-1 min-h-0">
                <QuestionNavigator
                  totalQuestions={totalQuestions}
                  currentIndex={currentIndex}
                  answeredQuestions={answeredQuestions}
                  flaggedQuestions={flaggedQuestions}
                  questionIds={questionIds}
                  onNavigate={onNavigate}
                  variant="sidebar"
                  className="h-full"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
