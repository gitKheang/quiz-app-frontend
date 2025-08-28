// TanStack Query hooks for API calls

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { CreateSessionReq, SaveProgressReq, LeaderboardParams, SubmitQuizResp } from "@/types/quiz"

// ---- Types ----
type SubmitPayload = {
  answers?: Array<{ questionId: string; chosenOptionIds: string[] }>
}

// Query keys
export const queryKeys = {
  categories: ["categories"] as const,
  session: (id: string) => ["session", id] as const,
  leaderboard: (params: LeaderboardParams) => ["leaderboard", params] as const,
}

// Categories (used in Admin and Home/Student)
export function useCategories() {
  console.log("useCategories hook called")

  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => {
      console.log("Fetching categories...")
      return apiClient.getCategories()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    // ensure fresh data when coming back from Admin
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  })
}

// Quiz Session
export function useCreateSession() {
  return useMutation({
    mutationFn: (req: CreateSessionReq) => apiClient.createSession(req),
  })
}

export function useSession(attemptId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.session(attemptId!),
    queryFn: () => apiClient.getSession(attemptId!),
    enabled: !!attemptId,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  })
}

export function useSaveProgress(attemptId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (req: SaveProgressReq) => apiClient.saveProgress(attemptId, req),
    onSuccess: () => {
      // Optionally refetch session data
      queryClient.invalidateQueries({
        queryKey: queryKeys.session(attemptId),
      })
    },
  })
}

/**
 * Submit quiz with answers payload to avoid losing the last clicks to debounce/interval timing.
 * Usage: submitQuiz.mutateAsync({ answers: [{ questionId, chosenOptionIds }, ...] })
 */
export function useSubmitQuiz(attemptId: string) {
  const queryClient = useQueryClient()

  return useMutation<SubmitQuizResp, Error, SubmitPayload | undefined>({
    mutationFn: async (body) => {
      return apiClient.submitQuiz(attemptId, body)
    },
    onSuccess: () => {
      // If you show a leaderboard, you may want this refreshed
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
    },
  })
}

// Leaderboard
export function useLeaderboard(params: LeaderboardParams = {}) {
  return useQuery({
    queryKey: queryKeys.leaderboard(params),
    queryFn: () => apiClient.getLeaderboard(params),
    staleTime: 30 * 1000, // 30 seconds
  })
}
