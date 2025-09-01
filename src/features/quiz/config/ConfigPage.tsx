import { motion } from "framer-motion";
import { ArrowLeft, Settings, Clock, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

import { useQuizConfig, fromUI } from "./useQuizConfig";
import CategoryPicker from "./CategoryPicker";
import QuestionCountPicker from "./QuestionCountPicker";
import TimePicker from "./TimePicker";
import DifficultyPicker from "./DifficultyPicker";
import SummaryCard from "./SummaryCard";
import StartQuizButton from "./StartQuizButton";

export default function ConfigPage() {
  const navigate = useNavigate();
  const cfg = useQuizConfig();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Settings className="text-primary" size={20} />
              <span className="text-lg font-semibold">Quiz Setup</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Configure Your Quiz</h1>
            <p className="text-lg text-muted-foreground">
              Customize your quiz experience to match your preferences and skill level.
            </p>
          </div>

          <form onSubmit={cfg.onSubmit} className="space-y-8">
            {/* Category Selection */}
            <Card className="quiz-card">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="text-primary" size={20} />
                  <h2 className="text-xl font-semibold">Choose Category</h2>
                </div>
                <CategoryPicker
                  categories={cfg.categories || []}
                  selectedId={cfg.watched.categoryId}
                  onSelect={(id) => cfg.form.setValue("categoryId", id)}
                />
              </div>
            </Card>

            {/* Quiz Settings */}
            <Card className="quiz-card">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Clock className="text-primary" size={20} />
                  <h2 className="text-xl font-semibold">Quiz Settings</h2>
                </div>

                <QuestionCountPicker
                  value={cfg.watched.numQuestions}
                  options={cfg.questionOptionStates}
                  onChange={(v) => cfg.form.setValue("numQuestions", v, { shouldValidate: true })}
                  availableCount={cfg.availableCount}
                />

                <TimePicker
                  value={cfg.watched.timeLimitMin}
                  options={cfg.TIME_OPTIONS}
                  onChange={(v) => cfg.form.setValue("timeLimitMin", v, { shouldValidate: true })}
                />
              </div>
            </Card>

            {/* Difficulty */}
            <Card className="quiz-card">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="text-primary" size={20} />
                  <h2 className="text-xl font-semibold">Difficulty Level</h2>
                </div>
                <DifficultyPicker
                  value={cfg.uiDifficulty} // normalized for UI
                  options={cfg.difficultyOptions}
                  onChange={(v) =>
                    cfg.form.setValue("difficulty", fromUI(v as any) as any, {
                      shouldValidate: true,
                    })
                  }
                />
              </div>
            </Card>

            {/* Preview & Start */}
            <Card className="quiz-card">
              <div className="flex items-center justify-between">
                <SummaryCard
                  categories={cfg.categories || []}
                  watched={cfg.watched}
                  availableCount={cfg.availableCount}
                  difficultyOptions={cfg.difficultyOptions as any}
                  uiDifficulty={cfg.uiDifficulty}
                />
                <StartQuizButton disabled={cfg.startDisabled} />
              </div>
            </Card>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
