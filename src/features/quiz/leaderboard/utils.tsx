import { Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

export function getRankIcon(rank: number) {
  if (rank === 1)
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500">
        <Crown size={14} />
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-400">
        <Medal size={14} />
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-700">
        <Medal size={14} />
      </span>
    );
  return <span className="w-6 h-6" />;
}

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export function getRankBadgeVariant(rank: number): BadgeVariant {
  if (rank === 1) return "default";
  if (rank === 2 || rank === 3) return "secondary";
  return "outline";
}

export function getRankRowClass(rank: number) {
  if (rank === 1) return cn("bg-primary/5");
  if (rank === 2) return cn("bg-muted/30");
  if (rank === 3) return cn("bg-amber-950/20");
  return "";
}

export function formatTime(totalSec: number) {
  const sec = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${m}:${pad(s)}`;
}
