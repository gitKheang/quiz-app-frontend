// src/pages/quiz/components/SubmitDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  answered: number;
  total: number;
  flaggedCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function SubmitDialog({
  open,
  onOpenChange,
  answered,
  total,
  flaggedCount,
  isSubmitting,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Quiz?</DialogTitle>
          <DialogDescription>
            Are you ready to submit your quiz? You won&apos;t be able to make changes after submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex justify-between text-sm">
            <span>Questions answered:</span>
            <span className="font-medium">
              {answered} / {total}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Questions flagged:</span>
            <span className="font-medium">{flaggedCount}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="quiz-button-primary">
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
