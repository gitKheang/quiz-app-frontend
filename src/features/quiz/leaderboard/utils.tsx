// Shared UI/format helpers for leaderboard

import { Crown, Medal } from "lucide-react";

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown size={20} className="text-yellow-500" />;
    case 2:
      return <Medal size={20} className="text-gray-400" />;
    case 3:
      return <Medal size={20} className="text-yellow-600" />;
    default:
      return (
        <span className="w-5 text-center font-semibold text-muted-foreground">
          #{rank}
        </span>
      );
  }
};

export const getRankBadgeVariant = (rank: number): "default" | "secondary" | "outline" => {
  if (rank <= 3) return "default";
  if (rank <= 10) return "secondary";
  return "outline";
};

export const getRankRowClass = (rank: number) => {
  if (rank === 1)
    return "bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-yellow-500/20";
  if (rank === 2)
    return "bg-gradient-to-r from-gray-400/10 to-gray-500/5 border-gray-400/20";
  if (rank === 3)
    return "bg-gradient-to-r from-yellow-600/10 to-yellow-700/5 border-yellow-600/20";
  return "";
};

export const timeRangeLabels = {
  daily: "Today",
  weekly: "This Week",
  monthly: "This Month",
  all: "All Time",
} as const;
