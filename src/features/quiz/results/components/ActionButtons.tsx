import { RotateCcw, Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { SubmitQuizResp } from "@/types/quiz";

type Props = { results: SubmitQuizResp };

export default function ActionButtons({ results }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const fallbackShare = (text: string) => {
    navigator.clipboard.writeText(`${text} ${window.location.origin}`);
    toast({
      title: "Results copied!",
      description: "Your results have been copied to clipboard.",
    });
  };

  const handleShareResults = async () => {
    const shareText = `I scored ${results.score}% on QuizMaster! Got ${results.correctCount}/${results.total} questions right. Can you beat my score?`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Quiz Results",
          text: shareText,
          url: window.location.origin,
        });
      } catch {
        fallbackShare(shareText);
      }
    } else {
      fallbackShare(shareText);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        onClick={() => navigate("/quiz/new")}
        size="lg"
        className="quiz-button-primary"
      >
        <RotateCcw size={18} />
        Take Another Quiz
      </Button>

      <Button
        onClick={handleShareResults}
        variant="outline"
        size="lg"
        className="quiz-focus"
      >
        <Share2 size={18} />
        Share Results
      </Button>

      <Button
        onClick={() => navigate("/leaderboard")}
        variant="outline"
        size="lg"
        className="quiz-focus"
      >
        <Trophy size={18} />
        View Leaderboard
      </Button>
    </div>
  );
}
