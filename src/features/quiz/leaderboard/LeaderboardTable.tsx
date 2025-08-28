import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRankIcon, getRankBadgeVariant, getRankRowClass, formatTime } from "./utils";

type Entry = {
  id: string;
  userName: string;
  rank: number;
  score: number;
  timeSec: number;
};

type Props = {
  isLoading: boolean;
  leaderboard?: Entry[];
};

export default function LeaderboardTable({ isLoading, leaderboard }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="quiz-card overflow-hidden">
        <div className="space-y-0 divide-y divide-border">
          {/* Header */}
          <div className="grid grid-cols-4 md:grid-cols-5 gap-4 p-4 bg-muted/20 font-medium text-sm">
            <div>Rank</div>
            <div className="col-span-2">Player</div>
            <div className="text-center">Score</div>
            <div className="hidden md:block text-center">Time</div>
          </div>

          {/* Rows */}
          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 md:grid-cols-5 gap-4 p-4 animate-pulse">
                <div className="h-4 bg-muted rounded" />
                <div className="col-span-2 h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="hidden md:block h-4 bg-muted rounded" />
              </div>
            ))
          ) : leaderboard?.length ? (
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className={cn(
                  "grid grid-cols-4 md:grid-cols-5 gap-4 p-4 hover:bg-accent/30 transition-colors",
                  getRankRowClass(entry.rank)
                )}
              >
                <div className="flex items-center gap-2">{getRankIcon(entry.rank)}</div>

                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                    {entry.userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium truncate">{entry.userName}</span>
                </div>

                <div className="text-center">
                  <Badge variant={getRankBadgeVariant(entry.rank)} className="font-semibold">
                    {entry.score}%
                  </Badge>
                </div>

                <div className="hidden md:block text-center text-sm text-muted-foreground">
                  {formatTime(entry.timeSec)}
                </div>
              </motion.div>
            ))
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
