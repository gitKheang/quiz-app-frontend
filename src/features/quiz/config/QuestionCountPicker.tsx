import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type Opt = { value: number; disabled: boolean };

export default function QuestionCountPicker({
  value,
  options,
  onChange,
  availableCount,
}: {
  value: number;
  options: Opt[];
  onChange: (val: number) => void;
  availableCount: number | null;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Number of Questions</Label>
      <RadioGroup
        value={value?.toString()}
        onValueChange={(v) => onChange(parseInt(v))}
        className="grid grid-cols-2 gap-3"
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center space-x-2">
            <RadioGroupItem value={opt.value.toString()} id={`questions-${opt.value}`} disabled={opt.disabled} />
            <Label
              htmlFor={`questions-${opt.value}`}
              className={cn("cursor-pointer", opt.disabled && "opacity-50 cursor-not-allowed")}
            >
              {opt.value} questions
            </Label>
          </div>
        ))}
      </RadioGroup>
      <p className="text-xs text-muted-foreground">
        {availableCount === null
          ? "Checking how many questions are available..."
          : availableCount === 0
          ? "This category has no questions yet."
          : `Max available with current selection: ${availableCount}`}
      </p>
    </div>
  );
}
