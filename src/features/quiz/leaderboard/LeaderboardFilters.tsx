import { Filter, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeaderboardRange } from "@/types/quiz";

type Category = { id: string; name: string };

type Props = {
  /** Full list of categories (id + name). */
  categories?: Category[];
  /** Currently selected category id (undefined = all). */
  selectedCategory?: string;
  /** Called when category changes. Pass undefined for “All Categories”. */
  onChangeCategory: (id?: string) => void;

  /** Current leaderboard range. */
  activeTab: LeaderboardRange;
  /** Change leaderboard range (daily | weekly | monthly | all). */
  onChangeTab: (tab: LeaderboardRange) => void;
};

export default function LeaderboardFilters({
  categories,
  selectedCategory,
  onChangeCategory,
  activeTab,
  onChangeTab,
}: Props) {
  return (
    <Card className="quiz-card p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left: label */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter size={16} />
          <span>Filter Results</span>
        </div>

        {/* Middle: range selector (mirrors the page tabs) */}
        <div className="flex flex-wrap items-center gap-2">
          {(["daily", "weekly", "monthly", "all"] as LeaderboardRange[]).map(
            (r) => (
              <Button
                key={r}
                type="button"
                size="sm"
                variant={activeTab === r ? "default" : "outline"}
                onClick={() => onChangeTab(r)}
                className="capitalize"
              >
                <CalendarDays size={14} className="mr-2" />
                {r === "all" ? "All Time" : r}
              </Button>
            )
          )}
        </div>

        {/* Right: category dropdown */}
        <div className="w-full md:w-64">
          <Select
            value={selectedCategory ?? "all"}
            onValueChange={(val) =>
              onChangeCategory(val === "all" ? undefined : val)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
