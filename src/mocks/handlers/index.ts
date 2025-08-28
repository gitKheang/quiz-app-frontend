import { categoryHandlers } from "./categories";
import { questionHandlers } from "./questions";
import { sessionHandlers } from "./sessions";
import { leaderboardHandlers } from "./leaderboard";

export const handlers = [
  ...categoryHandlers,
  ...questionHandlers,
  ...sessionHandlers,
  ...leaderboardHandlers,
];
