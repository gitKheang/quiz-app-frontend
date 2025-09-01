// src/pages/quiz/QuizPage.tsx
import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/quiz/ProgressBar";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { useSession, useSaveProgress, useSubmitQuiz } from "@/hooks/useQueries";
import { useQuizStore } from "@/stores/quiz";
import { useToast } from "@/hooks/use-toast";

import { QuizHeader } from "./components/QuizHeader";
import { QuizFooterNav } from "./components/QuizFooterNav";
import { SubmitDialog } from "./components/SubmitDialog";
import { ExitDialog } from "./components/ExitDialog";
import { QuestionNavigator } from "@/components/quiz/QuestionNavigator";

import { useAutoSave } from "./hooks/useAutoSave";

export default function QuizPage() {
  const { attemptId } = useParams<{ attemptId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!attemptId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle size={48} className="text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Missing attempt ID</h1>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  // Query hooks
  const { data: session, isLoading, error } = useSession(attemptId);
  const saveProgress = useSaveProgress(attemptId);
  const submitQuiz = useSubmitQuiz(attemptId);

  // Store hooks
  const {
    currentQuestionIndex,
    answers,
    flaggedQuestions,
    isSubmitting,
    lastSavedAt,
    setCurrentQuestionIndex,
    setAnswer,
    toggleFlagQuestion,
    setSubmitting,
    setLastSaved,
    resetQuiz,
    getAnswer,
    isFlagged,
    getAnsweredCount,
  } = useQuizStore();

  // Local UI state
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Auto-save (debounced + periodic)
  useAutoSave({ session, answers, saveProgress, setLastSaved });

  // Navigation helpers
  const navigateToQuestion = (index: number) => {
    if (!session) return;
    if (index >= 0 && index < session.questions.length) {
      setCurrentQuestionIndex(index);
      setIsNavigatorOpen(false);
    }
  };
  const goToNext = () => {
    if (!session) return;
    if (currentQuestionIndex < session.questions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };
  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(currentQuestionIndex - 1);
    }
  };

  // Timer callback
  const handleTimeUp = useCallback(() => {
    toast({ title: "Time's Up!", description: "Your quiz has been automatically submitted." });
    handleSubmitQuiz();
  }, [toast]); // eslint-disable-line

  // Answer changes
  const handleAnswerChange = (questionId: string, optionIds: string[]) => {
    setAnswer(questionId, optionIds);
  };

  // Submit logic (mirrors to /progress first)
  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, chosenOptionIds]) => ({
          questionId,
          chosenOptionIds,
        })),
      };

      if (payload.answers.length > 0) {
        await saveProgress.mutateAsync(payload as any);
      }
      const result = await submitQuiz.mutateAsync(payload);

      resetQuiz();
      navigate(`/result/${attemptId}`, { state: { result } });
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      toast({
        title: "Submission Failed",
        description: "Please try again or check your connection.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  // Exit
  const handleExit = () => {
    resetQuiz();
    navigate("/");
  };

  // Loading / error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg font-medium">Loading your quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle size={48} className="text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Quiz Not Found</h1>
          <p className="text-muted-foreground">
            The quiz session you&apos;re looking for doesn&apos;t exist or has expired.
          </p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const currentAnswer = getAnswer(currentQuestion?.id || "");
  const answeredQuestionIds = new Set(Object.keys(answers));

  return (
    <div className="min-h-screen bg-background">
      <QuizHeader
        category={session.category}
        totalQuestions={session.questions.length}
        answeredCount={getAnsweredCount()}
        endAt={session.endAt}
        serverNow={session.serverNow}
        onTimeUp={handleTimeUp}
        onOpenExit={() => setShowExitDialog(true)}
        isNavigatorOpen={isNavigatorOpen}
        setIsNavigatorOpen={setIsNavigatorOpen}
        currentIndex={currentQuestionIndex}
        answeredQuestions={answeredQuestionIds}
        flaggedQuestions={flaggedQuestions}
        questionIds={session.questions.map((q: any) => q.id)}
        onNavigate={navigateToQuestion}
      />

      {/* Mobile Progress */}
      <div className="md:hidden px-4 py-3 border-b border-border">
        <ProgressBar current={getAnsweredCount()} total={session.questions.length} showText size="sm" />
      </div>

      {/* Main */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <QuestionCard
                  question={currentQuestion}
                  selectedOptions={currentAnswer}
                  onAnswerChange={(optionIds) => handleAnswerChange(currentQuestion.id, optionIds)}
                  isFlagged={isFlagged(currentQuestion.id)}
                  onToggleFlag={() => toggleFlagQuestion(currentQuestion.id)}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={session.questions.length}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <QuizFooterNav
            index={currentQuestionIndex}
            total={session.questions.length}
            isSubmitting={isSubmitting}
            lastSavedAt={lastSavedAt}
            onPrev={goToPrev}
            onNext={goToNext}
            onOpenSubmit={() => setShowSubmitDialog(true)}
          />

          {/* Mobile Navigator (compact) */}
          <div className="mt-6 sm:hidden">
            <QuestionNavigator
              totalQuestions={session.questions.length}
              currentIndex={currentQuestionIndex}
              answeredQuestions={answeredQuestionIds}
              flaggedQuestions={flaggedQuestions}
              questionIds={session.questions.map((q: any) => q.id)}
              onNavigate={navigateToQuestion}
              variant="compact"
              className="justify-center"
            />
          </div>
        </div>
      </main>

      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        answered={getAnsweredCount()}
        total={session.questions.length}
        flaggedCount={flaggedQuestions.size}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitQuiz}
      />

      <ExitDialog open={showExitDialog} onOpenChange={setShowExitDialog} onExit={handleExit} />
    </div>
  );
}
