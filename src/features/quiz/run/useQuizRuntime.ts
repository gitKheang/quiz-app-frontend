"use client";

// Quiz runtime hook: data fetching, autosave, navigation, submit, exit

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, useSaveProgress, useSubmitQuiz } from "@/hooks/useQueries";
import { useQuizStore } from "@/stores/quiz";
import type { QuizSession, QuestionDTO } from "@/types/quiz";

type UseQuizRuntimeArgs = {
  attemptId: string;
  toast: (opts: {
    title: string;
    description?: string;
    variant?: "destructive" | "default";
  }) => void;
};

export function useQuizRuntime({ attemptId, toast }: UseQuizRuntimeArgs) {
  const navigate = useNavigate();

  // data
  const { data: session } = useSession(attemptId);
  const saveProgress = useSaveProgress(attemptId);
  const submitQuiz = useSubmitQuiz(attemptId);

  // local UI state
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // global store
  const {
    currentQuestionIndex,
    answers,
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

  // derived
  const questions: QuestionDTO[] = useMemo(
    () => session?.questions ?? [],
    [session]
  );
  const currentQuestion = useMemo(
    () => (questions.length ? questions[currentQuestionIndex] : undefined),
    [questions, currentQuestionIndex]
  );
  const answeredQuestionIds = useMemo(
    () => new Set(Object.keys(answers)),
    [answers]
  );
  const progressPct = useMemo(
    () =>
      questions.length
        ? ((currentQuestionIndex + 1) / questions.length) * 100
        : 0,
    [currentQuestionIndex, questions.length]
  );

  // debounced autosave (2s idle)
  const autoSave = useCallback(async () => {
    if (!session || Object.keys(answers).length === 0) return;
    try {
      const answersArray = Object.entries(answers).map(
        ([questionId, chosenOptionIds]) => ({
          questionId,
          chosenOptionIds,
        })
      );
      await saveProgress.mutateAsync({ answers: answersArray });
      setLastSaved(new Date().toISOString());
    } catch {
      // silent
    }
  }, [session, answers, saveProgress, setLastSaved]);

  useEffect(() => {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    const t = setTimeout(autoSave, 2000);
    setAutoSaveTimeout(t);
    return () => clearTimeout(t);
  }, [answers, autoSave]); // eslint-disable-line react-hooks/exhaustive-deps

  // periodic autosave (30s)
  useEffect(() => {
    const iv = setInterval(autoSave, 30000);
    return () => clearInterval(iv);
  }, [autoSave]);

  // time up handler
  const handleTimeUp = useCallback(() => {
    toast({
      title: "Time's Up!",
      description: "Your quiz has been automatically submitted.",
    });
    void handleSubmitQuiz();
  }, [toast]); // eslint-disable-line react-hooks/exhaustive-deps

  // navigation
  const navigateToQuestion = useCallback(
    (idx: number) => {
      if (!questions.length) return;
      const clamped = Math.max(0, Math.min(idx, questions.length - 1));
      setCurrentQuestionIndex(clamped);
    },
    [questions.length, setCurrentQuestionIndex]
  );

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1)
      navigateToQuestion(currentQuestionIndex + 1);
  }, [currentQuestionIndex, questions.length, navigateToQuestion]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) navigateToQuestion(currentQuestionIndex - 1);
  }, [currentQuestionIndex, navigateToQuestion]);

  // answers
  const handleAnswerChange = useCallback(
    (questionId: string, optionIds: string[]) => {
      setAnswer(questionId, optionIds);
    },
    [setAnswer]
  );

  // submit (FORCE FINAL SAVE BEFORE SUBMIT)  ✅ now builds & sends payload
  const handleSubmitQuiz = useCallback(async () => {
    setSubmitting(true);
    try {
      // Build payload from in-memory answers
      const payload = {
        answers: Object.entries(answers).map(
          ([questionId, chosenOptionIds]) => ({
            questionId,
            chosenOptionIds,
          })
        ),
      };

      // Final sync to server so we never lose the last 2s of answers
      if (payload.answers.length > 0) {
        await saveProgress.mutateAsync(payload as any);
      }

      toast({
        title: "Submitting Quiz...",
        description:
          "This may take a few minutes on first submission after restart.",
      });

      // Submit WITH payload (matches useSubmitQuiz signature)
      const result = await submitQuiz.mutateAsync(payload);

      resetQuiz();
      navigate(`/result/${attemptId}`, { state: { result } });
    } catch (err) {
      toast({
        title: "Submission Failed",
        description:
          "The server may be starting up. Please wait a moment and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  }, [
    answers,
    attemptId,
    navigate,
    resetQuiz,
    saveProgress,
    setSubmitting,
    submitQuiz,
    toast,
  ]);

  // exit
  const handleExit = useCallback(() => {
    resetQuiz();
    navigate("/");
  }, [navigate, resetQuiz]);

  return {
    // state
    session: session as QuizSession | undefined,
    questions,
    currentQuestion,
    currentQuestionIndex,
    progressPct,
    answeredQuestionIds,
    showSubmitDialog,
    setShowSubmitDialog,

    // actions
    getAnswer,
    isFlagged,
    getAnsweredCount,
    toggleFlagQuestion,
    handleAnswerChange,
    navigateToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    handleSubmitQuiz,
    handleExit,
    handleTimeUp,
  };
}
