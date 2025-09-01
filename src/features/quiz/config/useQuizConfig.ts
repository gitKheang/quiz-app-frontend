import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCategories, useCreateSession } from "@/hooks/useQueries";
import { quizConfigSchema, type QuizConfigForm } from "@/lib/schemas";
import { adminQuestions } from "@/lib/api-client";
import type { QuestionDTO } from "@/types/quiz";
import { useToast } from "@/hooks/use-toast";

const QUESTION_OPTIONS = [5, 10, 15, 20] as const;
const TIME_OPTIONS = [10, 15, 20, 30] as const;

export const difficultyOptions = [
  {
    value: "easy",
    label: "Easy",
    description: "Perfect for beginners",
    icon: "🌱",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Balanced challenge",
    icon: "⚡",
  },
  { value: "hard", label: "Hard", description: "For experts only", icon: "🔥" },
] as const;

// Difficulty mappers
// Raw data sometimes uses "med" instead of "medium"
export type UICanonicalDifficulty = "easy" | "medium" | "hard" | "mixed";
type RawDifficulty = "easy" | "med" | "hard" | undefined;

export function toUI(diff: RawDifficulty): UICanonicalDifficulty {
  if (!diff) return "mixed";
  if (diff === "med") return "medium";
  return diff;
}
export function fromUI(ui: UICanonicalDifficulty): RawDifficulty {
  if (ui === "mixed") return undefined;
  if (ui === "medium") return "med";
  return ui;
}
/** ============================================================= */

export function useQuizConfig() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { data: categories } = useCategories();
  const createSession = useCreateSession();

  const selectedCategoryFromState = location.state?.selectedCategory as
    | string
    | undefined;

  const form = useForm<QuizConfigForm>({
    resolver: zodResolver(quizConfigSchema),
    defaultValues: {
      categoryId: "",
      numQuestions: 10,
      timeLimitMin: 15,
      difficulty: undefined,
    },
    mode: "onChange",
  });

  const { setValue, watch, handleSubmit, formState } = form;
  const watched = watch();
  const uiDifficulty = toUI(watched.difficulty as any); // normalized for UI

  // Preselect category if navigated from home card
  useEffect(() => {
    if (selectedCategoryFromState && categories) {
      setValue("categoryId", selectedCategoryFromState);
    }
  }, [selectedCategoryFromState, categories, setValue]);

  // Load questions count (respect difficulty; mixed => no filter)
  const [availableCount, setAvailableCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const catId = watched.categoryId;
      if (!catId) {
        setAvailableCount(null);
        return;
      }
      try {
        const list: QuestionDTO[] = await adminQuestions.list(catId);

        // Normalize question difficulty the same way, then filter if fixed difficulty
        const filtered =
          uiDifficulty !== "mixed"
            ? list.filter(
                (q) => toUI((q.difficulty as any) ?? "med") === uiDifficulty
              )
            : list;

        if (!cancelled) {
          const count = filtered.length;
          setAvailableCount(count);

          // Clamp numQuestions to what’s available
          if (count >= 0 && watched.numQuestions > count) {
            const allowed = QUESTION_OPTIONS.filter((n) => n <= count);
            setValue(
              "numQuestions",
              allowed.length ? allowed[allowed.length - 1] : 0,
              {
                shouldValidate: true,
              }
            );
          }
        }
      } catch {
        if (!cancelled) setAvailableCount(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched.categoryId, uiDifficulty, setValue]);

  const questionOptionStates = useMemo(
    () =>
      QUESTION_OPTIONS.map((n) => ({
        value: n,
        disabled:
          availableCount === null
            ? true
            : availableCount === 0
            ? true
            : n > availableCount,
      })),
    [availableCount]
  );

  const startDisabled =
    !watched.categoryId ||
    availableCount === null ||
    availableCount === 0 ||
    watched.numQuestions <= 0 ||
    watched.numQuestions > (availableCount || 0) ||
    formState.isSubmitting;

  const onSubmit = handleSubmit(async (data: QuizConfigForm) => {
    try {
      const response = await createSession.mutateAsync({
        categoryId: data.categoryId,
        numQuestions: data.numQuestions,
        difficulty: data.difficulty as any, // undefined -> mixed on server; raw uses "med"
        timeLimitMin: data.timeLimitMin,
      });

      navigate(`/quiz/${response.attemptId}`);
      toast({
        title: "Quiz Started!",
        description: `Good luck with your ${data.numQuestions}-question quiz.`,
      });
    } catch (error: any) {
      const message =
        error?.errorData?.error ||
        error?.message ||
        "Failed to start quiz. Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  });

  return {
    form,
    watched,
    uiDifficulty, // normalized difficulty for UI consumers
    categories,
    availableCount,
    questionOptionStates,
    startDisabled,
    TIME_OPTIONS,
    QUESTION_OPTIONS,
    difficultyOptions,
    onSubmit,
  };
}
