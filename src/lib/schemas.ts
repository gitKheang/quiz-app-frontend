// Zod schemas for runtime validation

import { z } from "zod";

export const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(["single", "multi"]),
  imageUrl: z.string().optional(),
  options: z.array(optionSchema),
  correctOptionIds: z.array(z.string()).optional(),
  explanation: z.string().optional(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  questionCount: z.number().optional(),
});

export const createSessionReqSchema = z.object({
  categoryId: z.string(),
  numQuestions: z.number().min(1).max(50),
  difficulty: z.enum(["easy", "med", "hard"]).optional(),
  timeLimitMin: z.number().min(5).max(60).optional(),
});

export const createSessionRespSchema = z.object({
  attemptId: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  timeLimitSec: z.number(),
  serverNow: z.string(),
  questions: z.array(questionSchema),
  category: categorySchema,
});

export const saveProgressReqSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      chosenOptionIds: z.array(z.string()),
    })
  ),
});

export const submitQuizRespSchema = z.object({
  score: z.number(),
  correctCount: z.number(),
  total: z.number(),
  timeTakenSec: z.number(),
  breakdown: z.array(
    z.object({
      questionId: z.string(),
      isCorrect: z.boolean(),
      userAnswerIds: z.array(z.string()),
      correctAnswerIds: z.array(z.string()),
      explanation: z.string().optional(),
    })
  ),
  rank: z.number().optional(),
  percentile: z.number().optional(),
});

export const leaderboardEntrySchema = z.object({
  id: z.string(),
  userName: z.string(),
  score: z.number(),
  timeSec: z.number(),
  submittedAt: z.string(),
  rank: z.number(),
  categoryId: z.string(),
});

// Form validation schemas
export const quizConfigSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  numQuestions: z
    .number()
    .min(5, "Minimum 5 questions")
    .max(20, "Maximum 20 questions"),
  difficulty: z.enum(["easy", "med", "hard"]).optional(),
  timeLimitMin: z
    .number()
    .min(5, "Minimum 5 minutes")
    .max(60, "Maximum 60 minutes"),
});

export type QuizConfigForm = z.infer<typeof quizConfigSchema>;
