type Category = { id: string; name: string };
type Watched = {
  categoryId: string;
  numQuestions: number;
  timeLimitMin: number;
  difficulty?: any; // raw can be "med" | "easy" | "hard" | undefined
};

export default function SummaryCard({
  categories,
  watched,
  availableCount,
  difficultyOptions,
  uiDifficulty, // normalized: "easy" | "medium" | "hard" | "mixed"
}: {
  categories: Category[];
  watched: Watched;
  availableCount: number | null;
  difficultyOptions: readonly { value: string; label: string }[];
  uiDifficulty: "easy" | "medium" | "hard" | "mixed";
}) {
  const catName = categories.find((c) => c.id === watched.categoryId)?.name || "—";

  const diffLabel =
    uiDifficulty === "mixed"
      ? "Mixed"
      : difficultyOptions.find((d) => d.value === uiDifficulty)?.label ?? "Mixed";

  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">Quiz Preview</div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{catName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{watched.numQuestions} questions</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{watched.timeLimitMin} minutes</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{diffLabel}</span>
        </div>
      </div>
      {availableCount === 0 && (
        <div className="text-xs text-destructive mt-1">
          This category has no questions yet. Please pick another category or ask an admin to add questions.
        </div>
      )}
    </div>
  );
}
