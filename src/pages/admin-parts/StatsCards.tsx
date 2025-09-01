import { Card } from "@/components/ui/card";
import { FolderOpen, HelpCircle, BookOpen } from "lucide-react";

export default function StatsCards({
  categoriesCount,
}: {
  categoriesCount: number;
}) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="quiz-card text-center">
        <div className="space-y-3">
          <FolderOpen className="w-8 h-8 mx-auto text-primary" />
          <div>
            <div className="text-2xl font-bold">{categoriesCount}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
        </div>
      </Card>

      <Card className="quiz-card text-center">
        <div className="space-y-3">
          <HelpCircle className="w-8 h-8 mx-auto text-primary" />
          <div>
            <div className="text-2xl font-bold">50+</div>
            <div className="text-sm text-muted-foreground">Questions</div>
          </div>
        </div>
      </Card>

      <Card className="quiz-card text-center">
        <div className="space-y-3">
          <BookOpen className="w-8 h-8 mx-auto text-primary" />
          <div>
            <div className="text-2xl font-bold">1,000+</div>
            <div className="text-sm text-muted-foreground">Quiz Attempts</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
