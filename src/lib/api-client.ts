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
  QuizSession
} from '@/types/quiz';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      (errorData as any).message || `HTTP ${response.status}: ${response.statusText}`,
      errorData
    );
  }

  return response.json();
}

export const apiClient = {
  // Categories
  async getCategories(): Promise<CategoryDTO[]> {
    return fetchApi<CategoryDTO[]>('/categories');
  },

  // Quiz Sessions
  async createSession(req: CreateSessionReq): Promise<CreateSessionResp> {
    return fetchApi<CreateSessionResp>('/quiz-sessions', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async getSession(attemptId: string): Promise<QuizSession> {
    return fetchApi<QuizSession>(`/quiz-sessions/${attemptId}`);
  },

  async saveProgress(attemptId: string, req: SaveProgressReq): Promise<SaveProgressResp> {
    return fetchApi<SaveProgressResp>(`/quiz-sessions/${attemptId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(req),
    });
  },

  async submitQuiz(attemptId: string): Promise<SubmitQuizResp> {
    return fetchApi<SubmitQuizResp>(`/quiz-sessions/${attemptId}/submit`, {
      method: 'POST',
    });
  },

  // Leaderboard
  async getLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardEntry[]> {
    const searchParams = new URLSearchParams();
    
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params.range) searchParams.set('range', params.range);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));

    const query = searchParams.toString();
    return fetchApi<LeaderboardEntry[]>(`/leaderboard${query ? `?${query}` : ''}`);
  },
};

export { ApiError };

// ===== Admin: Categories =====
export const adminCategories = {
  create(body: { name: string; slug: string; description?: string; color?: string; icon?: string }) {
    return fetchApi<CategoryDTO>('/categories', { method: 'POST', body: JSON.stringify(body) });
  },
  update(id: string, body: Partial<{ name: string; slug: string; description?: string; color?: string; icon?: string }>) {
    return fetchApi<CategoryDTO>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },
  delete(id: string) {
    return fetchApi<{ ok: true }>(`/categories/${id}`, { method: 'DELETE' });
  },
};

// ===== Admin: Questions =====
export const adminQuestions = {
  list(categoryId: string) {
    return fetchApi<QuestionDTO[]>(`/categories/${categoryId}/questions`);
  },
  create(categoryId: string, body: Omit<QuestionDTO, 'id'> & { correctOptionIds?: string[] }) {
    return fetchApi<QuestionDTO>(`/categories/${categoryId}/questions`, { method: 'POST', body: JSON.stringify(body) });
  },
  update(id: string, body: Partial<QuestionDTO> & { correctOptionIds?: string[] }) {
    return fetchApi<QuestionDTO>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },
  delete(id: string) {
    return fetchApi<{ ok: true }>(`/questions/${id}`, { method: 'DELETE' });
  },
};



