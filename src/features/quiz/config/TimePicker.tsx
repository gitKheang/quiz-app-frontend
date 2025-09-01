import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TimePicker({
  value,
  options,
  onChange,
}: {
  value: number;
  options: readonly number[];
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Time Limit (minutes)</Label>
      <Select value={value.toString()} onValueChange={(v) => onChange(parseInt(v))}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          {options.map((t) => (
            <SelectItem key={t} value={t.toString()}>
              {t} min
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
