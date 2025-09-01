import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AdminHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="quiz-focus"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center space-x-2">
            <Settings size={18} className="text-primary" />
            <span className="text-lg font-semibold">Quiz Admin</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
