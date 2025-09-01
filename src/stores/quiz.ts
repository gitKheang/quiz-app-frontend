import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuizState } from "@/types/quiz";

interface QuizStore extends QuizState {
  // Actions
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionId: string, optionIds: string[]) => void;
  toggleFlagQuestion: (questionId: string) => void;
  clearFlagQuestion: (questionId: string) => void;
  setTimeRemaining: (seconds: number) => void;
  setSubmitting: (submitting: boolean) => void;
  setLastSaved: (timestamp: string) => void;
  resetQuiz: () => void;

  // Getters
  getAnswer: (questionId: string) => string[];
  isFlagged: (questionId: string) => boolean;
  getAnsweredCount: () => number;
  getFlaggedCount: () => number;
}

const initialState: QuizState = {
  currentQuestionIndex: 0,
  answers: {},
  flaggedQuestions: new Set<string>(),
  timeRemainingSec: 0,
  isSubmitting: false,
  lastSavedAt: undefined,
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

      setAnswer: (questionId, optionIds) => {
        console.log(
          "[v0] Quiz Store - Setting answer for question:",
          questionId
        );
        console.log("[v0] Quiz Store - Option IDs:", optionIds);
        console.log(
          "[v0] Quiz Store - Current answers before update:",
          get().answers
        );

        set((state) => {
          const newAnswers = { ...state.answers, [questionId]: optionIds };
          console.log(
            "[v0] Quiz Store - New answers after update:",
            newAnswers
          );
          return { answers: newAnswers };
        });

        // Verify the answer was set correctly
        const verifyAnswers = get().answers;
        console.log(
          "[v0] Quiz Store - Verified stored answers:",
          verifyAnswers
        );
        console.log(
          "[v0] Quiz Store - Answer for this question:",
          verifyAnswers[questionId]
        );
      },

      toggleFlagQuestion: (questionId) =>
        set((state) => {
          const next = new Set(state.flaggedQuestions);
          next.has(questionId) ? next.delete(questionId) : next.add(questionId);
          return { flaggedQuestions: next };
        }),

      clearFlagQuestion: (questionId) =>
        set((state) => {
          const next = new Set(state.flaggedQuestions);
          next.delete(questionId);
          return { flaggedQuestions: next };
        }),

      setTimeRemaining: (seconds) => set({ timeRemainingSec: seconds }),
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),
      setLastSaved: (timestamp) => set({ lastSavedAt: timestamp }),
      resetQuiz: () => set(initialState),

      // Getters
      getAnswer: (questionId) => get().answers[questionId] || [],
      isFlagged: (questionId) => get().flaggedQuestions.has(questionId),
      getAnsweredCount: () => Object.keys(get().answers).length,
      getFlaggedCount: () => get().flaggedQuestions.size,
    }),
    {
      name: "quiz-store",
      partialize: (s) => ({
        currentQuestionIndex: s.currentQuestionIndex,
        answers: s.answers,
        flaggedQuestions: Array.from(s.flaggedQuestions),
        lastSavedAt: s.lastSavedAt,
      }),
      onRehydrateStorage: () => (state: any) => {
        if (state && Array.isArray(state.flaggedQuestions)) {
          state.flaggedQuestions = new Set(state.flaggedQuestions);
        }
      },
    }
  )
);

// tiny selector helpers
export const useCurrentQuestion = () =>
  useQuizStore((s) => s.currentQuestionIndex);
export const useQuizAnswers = () => useQuizStore((s) => s.answers);
export const useFlaggedQuestions = () =>
  useQuizStore((s) => s.flaggedQuestions);
export const useTimeRemaining = () => useQuizStore((s) => s.timeRemainingSec);
export const useIsSubmitting = () => useQuizStore((s) => s.isSubmitting);
