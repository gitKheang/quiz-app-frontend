// Shared helpers for MSW quiz handlers

import type { QuestionDTO } from "@/types/quiz";
import { store } from "../data";

/** Fisher–Yates shuffle */
export function shuffleArray<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateAttemptId(): string {
  return `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Normalize any legacy/stale difficulty values:
 * - 'med' → 'medium'
 * - 'max' → 'hard'   (admin UI used to expose 'max'; treat as 'hard')
 * - undefined/null → 'medium' (sane default for old seeds)
 */
export function normalizeQuestionDifficulty(
  d: any
): "easy" | "medium" | "hard" {
  if (d === "med") return "medium";
  if (d === "max") return "hard";
  if (d === "easy" || d === "medium" || d === "hard") return d;
  return "medium";
}

/** Non-deterministic shuffle (use once when creating an attempt) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deterministic shuffle (stable order on refresh) */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash32(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function deterministicShuffle<T>(arr: T[], seedStr: string): T[] {
  const a = [...arr];
  const rand = mulberry32(hash32(seedStr));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** If a shuffle equals the original order, rotate once so it visibly changes */
export function ensureNotIdentity<T>(original: T[], shuffled: T[]): T[] {
  const same =
    original.length === shuffled.length &&
    original.every((v, i) => v === shuffled[i]);
  return same && shuffled.length > 1
    ? [...shuffled.slice(1), shuffled[0]]
    : shuffled;
}

/**
 * Fetch questions for a category, optionally filtered by difficulty.
 * If difficulty is undefined, we return a mixed set (no filtering).
 * The selected questions are shuffled and options are shuffled per question.
 */
export function getQuestionsForCategory(
  categoryId: string,
  numQuestions: number,
  difficulty?: "easy" | "med" | "hard"
): QuestionDTO[] {
  const all = (store.questions[categoryId] ?? []).map((q) => ({
    ...q,
    // normalize any persisted difficulty variants
    difficulty: normalizeQuestionDifficulty((q as any).difficulty),
  }));

  const targetDiff =
    difficulty === undefined
      ? undefined
      : normalizeQuestionDifficulty(difficulty);

  const pool =
    targetDiff === undefined
      ? all // mixed
      : all.filter(
          (q) =>
            normalizeQuestionDifficulty((q as any).difficulty) === targetDiff
        );

  const usable = pool.length ? pool : all; // graceful fallback if filter empty
  const selected = shuffleArray(usable).slice(
    0,
    Math.min(numQuestions, usable.length)
  );

  // Strip server-only fields and shuffle options client gets
  return selected.map((q) => ({
    ...q,
    options: shuffleArray(q.options),
    correctOptionIds: undefined,
    explanation: undefined,
  }));
}

/**
 * Updated function to get questions WITH correct answers for server-side scoring
 * Now uses the new shuffle function for consistent behavior
 */
export function getQuestionsWithAnswersForCategory(
  categoryId: string,
  numQuestions: number,
  difficulty?: "easy" | "med" | "hard"
): QuestionDTO[] {
  const all = (store.questions[categoryId] ?? []).map((q) => ({
    ...q,
    // normalize any persisted difficulty variants
    difficulty: normalizeQuestionDifficulty((q as any).difficulty),
  }));

  const targetDiff =
    difficulty === undefined
      ? undefined
      : normalizeQuestionDifficulty(difficulty);

  const pool =
    targetDiff === undefined
      ? all // mixed
      : all.filter(
          (q) =>
            normalizeQuestionDifficulty((q as any).difficulty) === targetDiff
        );

  const usable = pool.length ? pool : all; // graceful fallback if filter empty
  const shuffled = shuffle(usable);
  const selected = shuffled.slice(0, Math.min(numQuestions, usable.length));

  const finalSelected =
    usable.length > 1 &&
    selected.length > 1 &&
    usable.slice(0, selected.length).every((q, i) => q.id === selected[i].id)
      ? [...selected.slice(1), selected[0]]
      : selected;

  return finalSelected;
}
