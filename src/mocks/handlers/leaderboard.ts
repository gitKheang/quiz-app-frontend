import { http, HttpResponse } from "msw";
import type { LeaderboardParams } from "@/types/quiz";
import { generateLeaderboardData } from "../data";

export const leaderboardHandlers = [
  http.get("/api/leaderboard", ({ request }) => {
    const url = new URL(request.url);
    const params: LeaderboardParams = {
      categoryId: url.searchParams.get("categoryId") || undefined,
      range: (url.searchParams.get("range") as any) || "all",
      limit: parseInt(url.searchParams.get("limit") || "50"),
      offset: parseInt(url.searchParams.get("offset") || "0"),
    };

    const entries = generateLeaderboardData(
      params.categoryId,
      params.range,
      params.limit
    );

    const result = entries.slice(params.offset || 0);
    return HttpResponse.json(result);
  }),
];
