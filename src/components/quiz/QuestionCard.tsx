// Question card component with single/multi choice support

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flag, FlagOff, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { QuestionDTO } from "@/types/quiz";

interface QuestionCardProps {
  question: QuestionDTO;
  selectedOptions: string[];
  onAnswerChange: (optionIds: string[]) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
  questionNumber: number;
  totalQuestions: number;
  className?: string;
}

export function QuestionCard({
  question,
  selectedOptions,
  onAnswerChange,
  isFlagged,
  onToggleFlag,
  questionNumber,
  totalQuestions,
  className,
}: QuestionCardProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [question.imageUrl]);

  const handleSingleChoice = (optionId: string) => {
    onAnswerChange([optionId]);
  };

  const handleMultiChoice = (optionId: string, checked: boolean) => {
    if (checked) {
      onAnswerChange([...selectedOptions, optionId]);
    } else {
      onAnswerChange(selectedOptions.filter((id) => id !== optionId));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn("quiz-card space-y-6", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {questionNumber}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              Question {questionNumber} of {totalQuestions}
            </span>
            {question.type === "multi" && (
              <span className="px-2 py-1 bg-primary-light text-primary text-xs font-medium rounded-full">
                Multiple Choice
              </span>
            )}
          </div>

          <h2 className="text-lg font-semibold leading-relaxed text-foreground">
            {question.text}
          </h2>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFlag}
          className={cn(
            "shrink-0 p-2 h-auto",
            isFlagged
              ? "text-warning hover:text-warning/80"
              : "text-muted-foreground"
          )}
          aria-label={isFlagged ? "Remove flag" : "Flag question for review"}
        >
          {isFlagged ? <Flag size={18} /> : <FlagOff size={18} />}
        </Button>
      </div>

      {question.imageUrl && !imageError && (
        <div className="relative rounded-xl overflow-hidden bg-muted">
          <img
            src={question.imageUrl}
            alt="Question illustration"
            className="w-full h-48 object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      )}

      {question.imageUrl && imageError && (
        <div className="flex items-center justify-center h-48 bg-muted rounded-xl text-muted-foreground">
          <div className="text-center space-y-2">
            <ImageIcon size={32} />
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground font-medium">
          {question.type === "single"
            ? "Select one answer:"
            : "Select all correct answers:"}
        </p>

        {question.type === "single" ? (
          <RadioGroup
            value={selectedOptions[0] || ""}
            onValueChange={handleSingleChoice}
            className="space-y-3"
          >
            {question.options.map((option, index) => {
              const isSelected = selectedOptions.includes(option.id);
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-start space-x-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:bg-accent/50",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/20"
                  )}
                  onClick={() => handleSingleChoice(option.id)}
                >
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="mt-0.5 shrink-0"
                  />
                  <Label
                    htmlFor={option.id}
                    className="flex-1 cursor-pointer text-sm leading-relaxed"
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-medium mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option.text}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedOptions.includes(option.id);
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-start space-x-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:bg-accent/50",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/20"
                  )}
                  onClick={() => handleMultiChoice(option.id, !isSelected)}
                >
                  <Checkbox
                    id={option.id}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleMultiChoice(option.id, checked as boolean)
                    }
                    className="mt-0.5 shrink-0"
                  />
                  <Label
                    htmlFor={option.id}
                    className="flex-1 cursor-pointer text-sm leading-relaxed"
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-medium mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option.text}
                  </Label>
                </div>
              );
            })}

            {selectedOptions.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {selectedOptions.length} option
                {selectedOptions.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}
      </div>
      <div className="sr-only" aria-live="polite">
        {selectedOptions.length > 0 && (
          <span>Answer selected for question {questionNumber}</span>
        )}
        {isFlagged && (
          <span>Question {questionNumber} is flagged for review</span>
        )}
      </div>
    </motion.div>
  );
}
