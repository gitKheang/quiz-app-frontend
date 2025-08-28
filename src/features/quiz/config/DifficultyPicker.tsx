import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type DiffOpt = {
  value: "easy" | "medium" | "hard";
  label: string;
  description: string;
  icon: string;
};

/**
 * Controlled difficulty selector used on the Configure page.
 * Supports three fixed levels (easy/medium/hard) + a 'mixed' mode.
 * 'mixed' means do not filter by difficulty when building the quiz.
 */
export default function DifficultyPicker({
  value,
  options,
  onChange,
}: {
  value: "easy" | "medium" | "hard" | "mixed";
  options: readonly DiffOpt[];
  onChange: (val: "easy" | "medium" | "hard" | "mixed") => void;
}) {
  return (
    <RadioGroup
      className="grid gap-3"
      value={value}
      onValueChange={(v) => onChange(v as any)}
    >
      {options.map((opt) => (
        <div
          key={opt.value}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4 transition-colors",
            value === opt.value ? "border-primary/60 ring-1 ring-primary/40" : "border-border"
          )}
        >
          <RadioGroupItem value={opt.value} id={`diff-${opt.value}`} />
          <div className="flex items-center gap-3 flex-1">
            <span className="text-xl">{opt.icon}</span>
            <div>
              <Label htmlFor={`diff-${opt.value}`} className="font-medium cursor-pointer">
                {opt.label}
              </Label>
              <p className="text-sm text-muted-foreground">{opt.description}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Mixed (all difficulties) */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border p-4 transition-colors",
          value === "mixed" ? "border-primary/60 ring-1 ring-primary/40" : "border-border"
        )}
      >
        <RadioGroupItem value="mixed" id="diff-mixed" />
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xl">🎲</span>
          <div>
            <Label htmlFor="diff-mixed" className="font-medium cursor-pointer">
              Mixed
            </Label>
            <p className="text-sm text-muted-foreground">Random difficulty levels</p>
          </div>
        </div>
      </div>
    </RadioGroup>
  );
}
