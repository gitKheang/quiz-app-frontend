// src/types/quiz.ts

// Roles
export type Role = "student" | "admin"

// Difficulty
export type Difficulty = "easy" | "medium" | "hard" | "mixed"
export type QuestionDifficulty = Exclude<Difficulty, "mixed"> // per-question difficulty

// Options & Questions
export type OptionDTO = {
  id: string
  text: string
}

export type QuestionDTO = {
  id: string
  text: string
  type: "single" | "multi"
  imageUrl?: string
  options: OptionDTO[]
  correctOptionIds?: string[] // keep optional to avoid breaking existing flows
  explanation?: string
  /** Per-question difficulty; no 'mixed' at item level */
  difficulty?: QuestionDifficulty
}

// Categories
export type CategoryDTO = {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  questionCount?: number
}

// Create / Start Session
export type CreateSessionReq = {
  categoryId: string
  numQuestions: number
  /** 'mixed' means do not filter by difficulty */
  difficulty?: Difficulty
  timeLimitMin?: number
  timeLimitMinutes?: number // alias for some backends
}

export type CreateSessionResp = {
  attemptId: string
  startAt: string // ISO
  endAt: string // ISO
  timeLimitSec: number
  serverNow: string // ISO for drift calc
  questions: QuestionDTO[] // options already shuffled
  category: CategoryDTO
}

// Progress
export type SaveProgressReq = {
  answers: { questionId: string; chosenOptionIds: string[] }[]
}

export type SaveProgressResp = {
  saved: boolean
  serverNow: string
}

// Submit
export type SubmitQuizResp = {
  score: number
  correctCount: number
  incorrectCount: number
  unselectedCount: number
  total: number
  timeTakenSec: number
  breakdown: {
    questionId: string
    isCorrect: boolean
    userAnswerIds: string[]
    correctAnswerIds: string[]
    /** Optional human-readable texts for UI (server may include these) */
    userAnswerTexts?: string[]
    correctAnswerTexts?: string[]
    explanation?: string
  }[]
  rank?: number
  percentile?: number
}

// Leaderboard
export type LeaderboardEntry = {
  id: string
  userName: string
  score: number
  timeSec: number
  submittedAt: string
  rank: number
  categoryId: string
}

export type LeaderboardRange = "daily" | "weekly" | "monthly" | "all"

export type LeaderboardParams = {
  categoryId?: string
  range?: LeaderboardRange
  limit?: number
  offset?: number
}

// Session model in app
export type QuizSession = {
  id: string
  categoryId: string
  category: CategoryDTO
  numQuestions: number
  difficulty?: Difficulty // can be 'mixed' at session level
  timeLimitSec: number
  startAt: string
  endAt: string
  serverNow: string // ISO string for time drift calculation
  questions: QuestionDTO[]
  currentAnswers: Record<string, string[]>
  isCompleted: boolean
  submittedAt?: string
  score?: number
}

// Answers & State
export type UserAnswer = {
  questionId: string
  chosenOptionIds: string[]
  answeredAt: string
  flagged?: boolean
}

export type QuizState = {
  currentQuestionIndex: number
  answers: Record<string, string[]>
  flaggedQuestions: Set<string>
  timeRemainingSec: number
  isSubmitting: boolean
  lastSavedAt?: string
}
