// src/pages/quiz/components/ExitDialog.tsx
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onExit: () => void;
};

export function ExitDialog({ open, onOpenChange, onExit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exit Quiz?</DialogTitle>
          <DialogDescription>
            Your progress will be lost if you exit now. Are you sure you want to leave?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Stay
          </Button>
          <Button variant="destructive" onClick={onExit}>
            Exit Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
