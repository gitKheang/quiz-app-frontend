import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRankRowClass, formatTime } from "./utils";

type Entry = {
  id: string;
  userName: string;
  rank: number;
  score: number;
  timeSec: number;
};

type Props = {
  leaderboard?: Entry[];
};

export default function LeaderboardPodium({ leaderboard }: Props) {
  if (!leaderboard || leaderboard.length < 3) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="grid md:grid-cols-3 gap-6 mb-8"
    >
      {/* Second */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="order-1 md:order-1"
      >
        <Card
          className={cn("quiz-card text-center h-full", getRankRowClass(2))}
        >
          <div className="space-y-3">
            <div className="text-4xl mb-2">🥈</div>
            <Badge variant="secondary" className="mb-2">
              #2
            </Badge>
            <h3 className="font-semibold text-lg">{leaderboard[1].userName}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Trophy size={14} />
                <span>{leaderboard[1].score}%</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock size={14} />
                <span>{formatTime(leaderboard[1].timeSec)}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* First */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="order-2 md:order-2"
      >
        <Card
          className={cn(
            "quiz-card text-center h-full relative",
            getRankRowClass(1)
          )}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="quiz-gradient-hero w-8 h-8 rounded-full flex items-center justify-center">
              <Crown size={16} className="text-white" />
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="text-5xl mb-2">👑</div>
            <Badge className="mb-2 quiz-gradient-hero text-white border-0">
              #1
            </Badge>
            <h3 className="font-bold text-xl">{leaderboard[0].userName}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Trophy size={14} className="text-primary" />
                <span className="font-semibold">{leaderboard[0].score}%</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock size={14} />
                <span>{formatTime(leaderboard[0].timeSec)}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Third */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="order-3 md:order-3"
      >
        <Card
          className={cn("quiz-card text-center h-full", getRankRowClass(3))}
        >
          <div className="space-y-3">
            <div className="text-4xl mb-2">🥉</div>
            <Badge variant="outline" className="mb-2">
              #3
            </Badge>
            <h3 className="font-semibold text-lg">{leaderboard[2].userName}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Trophy size={14} />
                <span>{leaderboard[2].score}%</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock size={14} />
                <span>{formatTime(leaderboard[2].timeSec)}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
