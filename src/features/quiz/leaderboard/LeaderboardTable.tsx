import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getRankIcon,
  getRankBadgeVariant,
  getRankRowClass,
  formatTime,
} from "./utils";

type Entry = {
  id: string;
  userName: string;
  rank: number;
  score: number;
  timeSec: number;
  /** ISO string; newest = latest attempt */
  submittedAt?: string;
  categoryId?: string;
};

type Props = {
  leaderboard: Entry[] | undefined;
  isLoading?: boolean;
  /** current signed-in user's display name */
  highlightName?: string;
  /** last submitted rank saved in sessionStorage (if any) */
  highlightRank?: number;
};

export default function LeaderboardTable({
  leaderboard,
  isLoading,
  highlightName,
  highlightRank,
}: Props) {
  // pick exactly ONE row to highlight
  const highlightIndex = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return undefined;

    // 1) prefer the last submitted rank (exact match)
    if (typeof highlightRank === "number" && highlightRank > 0) {
      const idx = leaderboard.findIndex((e) => e.rank === highlightRank);
      if (idx >= 0) return idx;
    }

    // 2) otherwise, latest by submittedAt for the current username
    if (highlightName) {
      const target = highlightName.trim().toLowerCase();
      let latestIdx: number | undefined = undefined;
      let latestTs = -Infinity;

      leaderboard.forEach((e, i) => {
        if (e.userName.trim().toLowerCase() === target) {
          const t = e.submittedAt ? Date.parse(e.submittedAt) : NaN;
          if (!Number.isNaN(t)) {
            if (t > latestTs) {
              latestTs = t;
              latestIdx = i;
            }
          } else if (latestIdx === undefined) {
            // fall back to first if no timestamp
            latestIdx = i;
          }
        }
      });

      return latestIdx;
    }

    return undefined;
  }, [leaderboard, highlightName, highlightRank]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="quiz-card overflow-hidden">
        <div className="grid grid-cols-4 md:grid-cols-5 gap-4 p-4 text-sm text-muted-foreground bg-muted/30">
          <div>Rank</div>
          <div className="col-span-2">Player</div>
          <div className="text-center">Score</div>
          <div className="hidden md:block text-center">Time</div>
        </div>

        <div>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading…</div>
          ) : leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => {
              const isMe = highlightIndex === index;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className={cn(
                    "relative grid grid-cols-4 md:grid-cols-5 gap-4 p-4 hover:bg-accent/30 transition-colors",
                    getRankRowClass(entry.rank),
                    isMe && "ring-2 ring-primary/60 rounded-xl bg-primary/5"
                  )}
                >
                  {/* Rank / Icon */}
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                    <span className="font-medium">#{entry.rank}</span>
                  </div>

                  {/* Player */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                      {entry.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium truncate">{entry.userName}</span>
                    {isMe && <Badge className="ml-2">You</Badge>}
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <Badge
                      variant={getRankBadgeVariant(entry.rank)}
                      className="font-semibold"
                    >
                      {entry.score}%
                    </Badge>
                  </div>

                  {/* Time */}
                  <div className="hidden md:block text-center text-sm text-muted-foreground">
                    {formatTime(entry.timeSec)}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Sparkles size={32} className="mx-auto mb-3 opacity-50" />
              <p>No results found for this time range.</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
