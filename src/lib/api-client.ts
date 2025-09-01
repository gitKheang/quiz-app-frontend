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
} from "@/types/quiz";

export type AuthUser = {
  id?: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "/api";
const DEFAULT_TIMEOUT = 30_000;
const LONG_TIMEOUT = 300_000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1_000;

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    console.log(
      `[api] request failed, retrying in ${delay}ms. Attempts left: ${
        attempts - 1
      }`
    );
    await new Promise((r) => setTimeout(r, delay));
    return withRetry(fn, attempts - 1, delay * 2);
  }
}

async function parseJsonSafely<T>(resp: Response): Promise<T> {
  if (resp.status === 204) return null as unknown as T;
  const ct = resp.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const _ = await resp.text().catch(() => "");
    return {} as T;
  }
  return (await resp.json()) as T;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  timeout = DEFAULT_TIMEOUT
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  return withRetry(async () => {
    const fetchPromise = fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    });

    const response = await withTimeout(fetchPromise, timeout);

    if (!response.ok) {
      const errorData = await parseJsonSafely<any>(response).catch(() => ({}));
      throw new ApiError(
        response.status,
        (errorData as any)?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        errorData
      );
    }

    return parseJsonSafely<T>(response);
  });
}

export const auth = {
  me(): Promise<AuthUser | null> {
    return fetchApi<AuthUser | null>("/auth/me");
  },

  signUp(body: { email: string; password: string; name?: string }) {
    return fetchApi<AuthUser>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  signIn(body: { email: string; password: string }) {
    return fetchApi<AuthUser>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  signOut() {
    return fetchApi<{ ok: true }>("/auth/signout", { method: "POST" });
  },

  startGoogleLogin() {
    window.location.assign(`${BASE_URL}/auth/google`);
  },
};

export const apiClient = {
  getCategories(): Promise<CategoryDTO[]> {
    return fetchApi<CategoryDTO[]>("/categories");
  },

  createSession(req: CreateSessionReq): Promise<CreateSessionResp> {
    return fetchApi<CreateSessionResp>("/quiz-sessions", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  getSession(attemptId: string): Promise<QuizSession> {
    return fetchApi<QuizSession>(`/quiz-sessions/${attemptId}`);
  },

  saveProgress(
    attemptId: string,
    req: SaveProgressReq
  ): Promise<SaveProgressResp> {
    return fetchApi<SaveProgressResp>(`/quiz-sessions/${attemptId}/progress`, {
      method: "PATCH",
      body: JSON.stringify(req),
    });
  },

  async submitQuiz(
    attemptId: string,
    payload?: {
      answers?: Array<{ questionId: string; chosenOptionIds: string[] }>;
    }
  ): Promise<SubmitQuizResp> {
    console.log(`[api] submitting quiz for attempt: ${attemptId}`);
    return withRetry(
      async () =>
        fetchApi<SubmitQuizResp>(
          `/quiz-sessions/${attemptId}/submit`,
          { method: "POST", body: JSON.stringify(payload ?? {}) },
          LONG_TIMEOUT
        ),
      3,
      5_000
    );
  },

  getLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardEntry[]> {
    const sp = new URLSearchParams();
    if (params.categoryId) sp.set("categoryId", params.categoryId);
    if (params.range) sp.set("range", params.range);
    if (params.limit) sp.set("limit", String(params.limit));
    if (params.offset) sp.set("offset", String(params.offset));
    const qs = sp.toString();
    return fetchApi<LeaderboardEntry[]>(`/leaderboard${qs ? `?${qs}` : ""}`);
  },
};

export const adminCategories = {
  create(body: {
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
  }) {
    return fetchApi<CategoryDTO>("/categories", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  update(
    id: string,
    body: Partial<{
      name: string;
      slug: string;
      description?: string;
      color?: string;
      icon?: string;
    }>
  ) {
    return fetchApi<CategoryDTO>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  delete(id: string) {
    return fetchApi<{ ok: true }>(`/categories/${id}`, { method: "DELETE" });
  },
};

export const adminQuestions = {
  list(categoryId: string) {
    return fetchApi<QuestionDTO[]>(`/categories/${categoryId}/questions`);
  },
  create(
    categoryId: string,
    body: Omit<QuestionDTO, "id"> & { correctOptionIds?: string[] }
  ) {
    return fetchApi<QuestionDTO>(`/categories/${categoryId}/questions`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  update(
    id: string,
    body: Partial<QuestionDTO> & { correctOptionIds?: string[] }
  ) {
    return fetchApi<QuestionDTO>(`/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  delete(id: string) {
    return fetchApi<{ ok: true }>(`/questions/${id}`, { method: "DELETE" });
  },
};
