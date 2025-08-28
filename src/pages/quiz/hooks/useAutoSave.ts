// src/pages/quiz/hooks/useAutoSave.ts
import { useCallback, useEffect, useRef } from "react";

type SaveProgress = { mutateAsync: (payload: any) => Promise<any> };

type Params = {
  session: any | undefined;
  answers: Record<string, string[]>;
  saveProgress: SaveProgress;
  setLastSaved: (iso: string) => void;
};

export function useAutoSave({ session, answers, saveProgress, setLastSaved }: Params) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoSave = useCallback(async () => {
    if (!session || Object.keys(answers).length === 0) return;

    const answersArray = Object.entries(answers).map(([questionId, chosenOptionIds]) => ({
      questionId,
      chosenOptionIds,
    }));

    try {
      await saveProgress.mutateAsync({ answers: answersArray });
      setLastSaved(new Date().toISOString());
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }, [session, answers, saveProgress, setLastSaved]);

  // Debounced save (2s after last change)
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(autoSave, 2000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [answers, autoSave]);

  // Periodic save every 30s
  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);
}
