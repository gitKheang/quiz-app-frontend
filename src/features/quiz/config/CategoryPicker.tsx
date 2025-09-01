import { cn } from "@/lib/utils";

type Category = { id: string; name: string; icon?: string; questionCount?: number };

export default function CategoryPicker({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className={cn(
            "p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer",
            selectedId === category.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"
          )}
          onClick={() => onSelect(category.id)}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">{category.icon || "📚"}</div>
            <div>
              <div className="font-semibold">{category.name}</div>
              <div className="text-sm text-muted-foreground">{category.questionCount ?? 0} questions</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
