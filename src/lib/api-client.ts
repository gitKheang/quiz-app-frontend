// API Client for Quiz App

import type {
  CategoryDTO,
  QuestionDTO,
  CreateSessionReq,
  CreateSessionResp,
  SaveProgressReq,
  SaveProgressResp,
  SubmitQuizResp,
  LeaderboardEntry,
  LeaderboardParams,
  QuizSession,
} from "@/types/quiz"

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"

const DEFAULT_TIMEOUT = 30000 // 30 seconds instead of indefinite wait
const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000 // 1 second

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs),
    ),
  ])
}

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY,
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (attempts <= 1) {
      throw error
    }

    console.log(`[v0] API request failed, retrying in ${delay}ms. Attempts remaining: ${attempts - 1}`)
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Exponential backoff: double the delay for next attempt
    return withRetry(fn, attempts - 1, delay * 2)
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  return withRetry(async () => {
    const fetchPromise = fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    const response = await withTimeout(fetchPromise, DEFAULT_TIMEOUT)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        response.status,
        (errorData as any).message || `HTTP ${response.status}: ${response.statusText}`,
        errorData,
      )
    }

    return response.json()
  })
}

export const apiClient = {
  // Categories
  async getCategories(): Promise<CategoryDTO[]> {
    return fetchApi<CategoryDTO[]>("/categories")
  },

  // Quiz Sessions
  async createSession(req: CreateSessionReq): Promise<CreateSessionResp> {
    return fetchApi<CreateSessionResp>("/quiz-sessions", {
      method: "POST",
      body: JSON.stringify(req),
    })
  },

  async getSession(attemptId: string): Promise<QuizSession> {
    return fetchApi<QuizSession>(`/quiz-sessions/${attemptId}`)
  },

  async saveProgress(attemptId: string, req: SaveProgressReq): Promise<SaveProgressResp> {
    return fetchApi<SaveProgressResp>(`/quiz-sessions/${attemptId}/progress`, {
      method: "PATCH",
      body: JSON.stringify(req),
    })
  },

  async submitQuiz(
    attemptId: string,
    payload?: { answers?: Array<{ questionId: string; chosenOptionIds: string[] }> },
  ): Promise<SubmitQuizResp> {
    console.log(`[v0] Submitting quiz for attempt: ${attemptId}`)

    return withRetry(
      async () => {
        const fetchPromise = fetch(`${BASE_URL}/quiz-sessions/${attemptId}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload ?? {}),
        })

        const response = await withTimeout(fetchPromise, 300000) // 5 minutes for cold start

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new ApiError(
            response.status,
            (errorData as any).message || `HTTP ${response.status}: ${response.statusText}`,
            errorData,
          )
        }

        const result = await response.json()
        console.log(`[v0] Quiz submission successful for attempt: ${attemptId}`)
        return result
      },
      3, // Increase retries to 3 for cold start resilience
      5000, // Increase initial delay to 5 seconds
    )
  },

  // Leaderboard
  async getLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardEntry[]> {
    const searchParams = new URLSearchParams()

    if (params.categoryId) searchParams.set("categoryId", params.categoryId)
    if (params.range) searchParams.set("range", params.range)
    if (params.limit) searchParams.set("limit", String(params.limit))
    if (params.offset) searchParams.set("offset", String(params.offset))

    const query = searchParams.toString()
    return fetchApi<LeaderboardEntry[]>(`/leaderboard${query ? `?${query}` : ""}`)
  },
}

export { ApiError }

// ===== Admin: Categories =====
export const adminCategories = {
  create(body: { name: string; slug: string; description?: string; color?: string; icon?: string }) {
    return fetchApi<CategoryDTO>("/categories", { method: "POST", body: JSON.stringify(body) })
  },
  update(
    id: string,
    body: Partial<{ name: string; slug: string; description?: string; color?: string; icon?: string }>,
  ) {
    return fetchApi<CategoryDTO>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(body) })
  },
  delete(id: string) {
    return fetchApi<{ ok: true }>(`/categories/${id}`, { method: "DELETE" })
  },
}

// ===== Admin: Questions =====
export const adminQuestions = {
  list(categoryId: string) {
    return fetchApi<QuestionDTO[]>(`/categories/${categoryId}/questions`)
  },
  create(categoryId: string, body: Omit<QuestionDTO, "id"> & { correctOptionIds?: string[] }) {
    return fetchApi<QuestionDTO>(`/categories/${categoryId}/questions`, { method: "POST", body: JSON.stringify(body) })
  },
  update(id: string, body: Partial<QuestionDTO> & { correctOptionIds?: string[] }) {
    return fetchApi<QuestionDTO>(`/questions/${id}`, { method: "PUT", body: JSON.stringify(body) })
  },
  delete(id: string) {
    return fetchApi<{ ok: true }>(`/questions/${id}`, { method: "DELETE" })
  },
}
