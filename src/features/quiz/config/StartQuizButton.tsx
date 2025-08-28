import { Button } from "@/components/ui/button";

export default function StartQuizButton({ disabled }: { disabled: boolean }) {
  return (
    <div className="flex items-center justify-end mt-4 md:mt-0">
      <Button type="submit" disabled={disabled}>
        Start Quiz
      </Button>
    </div>
  );
}
