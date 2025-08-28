"use client"

// Main quiz page with timer and question navigation

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Menu, X, Send, AlertTriangle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Timer } from "@/components/quiz/Timer"
import { ProgressBar } from "@/components/quiz/ProgressBar"
import { QuestionCard } from "@/components/quiz/QuestionCard"
import { QuestionNavigator } from "@/components/quiz/QuestionNavigator"
import { useSession, useSaveProgress, useSubmitQuiz } from "@/hooks/useQueries"
import { useQuizStore } from "@/stores/quiz"
import { useToast } from "@/hooks/use-toast"

export default function Quiz() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout>()

  // Query hooks
  const { data: session, isLoading, error } = useSession(attemptId)
  const saveProgress = useSaveProgress(attemptId!)
  const submitQuiz = useSubmitQuiz(attemptId!)

  // Store hooks
  const {
    currentQuestionIndex,
    answers,
    flaggedQuestions,
    timeRemainingSec,
    isSubmitting,
    lastSavedAt,
    setCurrentQuestionIndex,
    setAnswer,
    toggleFlagQuestion,
    setTimeRemaining,
    setSubmitting,
    setLastSaved,
    resetQuiz,
    getAnswer,
    isFlagged,
    getAnsweredCount,
  } = useQuizStore()

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!session || Object.keys(answers).length === 0) return

    try {
      const answersArray = Object.entries(answers).map(([questionId, chosenOptionIds]) => ({
        questionId,
        chosenOptionIds,
      }))

      await saveProgress.mutateAsync({ answers: answersArray })
      setLastSaved(new Date().toISOString())
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }, [session, answers, saveProgress, setLastSaved])

  // Set up auto-save
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    const timeout = setTimeout(autoSave, 2000)
    setAutoSaveTimeout(timeout)
    return () => clearTimeout(timeout)
  }, [answers, autoSave])

  // Periodic auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000)
    return () => clearInterval(interval)
  }, [autoSave])

  // Handle time up
  const handleTimeUp = useCallback(() => {
    toast({
      title: "Time's Up!",
      description: "Your quiz has been automatically submitted.",
    })
    handleSubmitQuiz()
  }, [toast])

  // Navigate between questions
  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < (session?.questions.length || 0)) {
      setCurrentQuestionIndex(index)
      setIsNavigatorOpen(false)
    }
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < (session?.questions.length || 0) - 1) {
      navigateToQuestion(currentQuestionIndex + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(currentQuestionIndex - 1)
    }
  }

  // Handle answer changes
  const handleAnswerChange = (questionId: string, optionIds: string[]) => {
    setAnswer(questionId, optionIds)
  }

  // Submit quiz  ✅ now sends answers payload (and force-saves before submit)
  const handleSubmitQuiz = async () => {
    setSubmitting(true)
    try {
      // Build payload from in-memory store answers
      const payload = {
        answers: Object.entries(answers).map(([questionId, chosenOptionIds]) => ({
          questionId,
          chosenOptionIds,
        })),
      }

      // Optional but robust: mirror to /progress first so server has latest
      if (payload.answers && payload.answers.length > 0) {
        await saveProgress.mutateAsync(payload as any)
      }

      toast({
        title: "Submitting Quiz...",
        description: "This may take a few minutes on first submission after restart.",
      })

      // Submit WITH the answers so debounce/interval timing can't lose them
      const result = await submitQuiz.mutateAsync(payload)

      resetQuiz()
      navigate(`/result/${attemptId}`, { state: { result } })
    } catch (error) {
      console.error("Failed to submit quiz:", error)
      toast({
        title: "Submission Failed",
        description: "The server may be starting up. Please wait a moment and try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
      setShowSubmitDialog(false)
    }
  }

  // Handle exit confirmation
  const handleExit = () => {
    resetQuiz()
    navigate("/")
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg font-medium">Loading your quiz...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle size={48} className="text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Quiz Not Found</h1>
          <p className="text-muted-foreground">The quiz session you're looking for doesn't exist or has expired.</p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    )
  }

  const currentQuestion = session.questions[currentQuestionIndex]
  const currentAnswer = getAnswer(currentQuestion?.id || "")
  const answeredQuestionIds = new Set(Object.keys(answers))

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setShowExitDialog(true)} className="quiz-focus">
              <X size={18} />
            </Button>

            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{
                  backgroundColor: `${session.category.color}20`,
                  color: session.category.color,
                }}
              >
                {session.category.icon}
              </div>
              <span className="font-medium">{session.category.name}</span>
            </div>
          </div>

          {/* Center - Progress */}
          <div className="hidden md:block flex-1 max-w-xs mx-4">
            <ProgressBar current={getAnsweredCount()} total={session.questions.length} showText={false} size="sm" />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Timer endAt={session.endAt} serverNow={session.serverNow} onTimeUp={handleTimeUp} size="md" />

            {/* Questions Sheet */}
            <Sheet open={isNavigatorOpen} onOpenChange={setIsNavigatorOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                  <Menu size={16} />
                  <span className="hidden sm:inline ml-2">Questions</span>
                </Button>
              </SheetTrigger>

              {/* FULL-HEIGHT sidebar so footer pins to screen bottom */}
              <SheetContent
                side="right"
                className="w-80 sm:w-96 p-0 bg-background/95 border-l border-border flex h-screen max-h-screen flex-col"
              >
                <div className="px-4 py-3 border-b">
                  <SheetTitle>Question Navigator</SheetTitle>
                </div>

                {/* Let the navigator own the remaining space */}
                <div className="flex-1 min-h-0">
                  <QuestionNavigator
                    totalQuestions={session.questions.length}
                    currentIndex={currentQuestionIndex}
                    answeredQuestions={answeredQuestionIds}
                    flaggedQuestions={flaggedQuestions}
                    questionIds={session.questions.map((q) => q.id)}
                    onNavigate={navigateToQuestion}
                    variant="sidebar"
                    className="h-full" // important for sticky footer
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Mobile Progress Bar */}
      <div className="md:hidden px-4 py-3 border-b border-border">
        <ProgressBar current={getAnsweredCount()} total={session.questions.length} showText={true} size="sm" />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <QuestionCard
                  question={currentQuestion}
                  selectedOptions={currentAnswer}
                  onAnswerChange={(optionIds) => handleAnswerChange(currentQuestion.id, optionIds)}
                  isFlagged={isFlagged(currentQuestion.id)}
                  onToggleFlag={() => toggleFlagQuestion(currentQuestion.id)}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={session.questions.length}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation and Submit */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="quiz-focus bg-transparent"
            >
              <ChevronLeft size={18} />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              {/* Auto-save indicator */}
              {lastSavedAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Save size={12} />
                  <span>Auto-saved</span>
                </div>
              )}

              {/* Question counter */}
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} of {session.questions.length}
              </span>
            </div>

            {currentQuestionIndex === session.questions.length - 1 ? (
              <Button onClick={() => setShowSubmitDialog(true)} disabled={isSubmitting} className="quiz-button-primary">
                <Send size={18} />
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={goToNextQuestion} className="quiz-button-primary">
                Next
                <ChevronRight size={18} />
              </Button>
            )}
          </div>

          {/* Mobile Navigator */}
          <div className="mt-6 sm:hidden">
            <QuestionNavigator
              totalQuestions={session.questions.length}
              currentIndex={currentQuestionIndex}
              answeredQuestions={answeredQuestionIds}
              flaggedQuestions={flaggedQuestions}
              questionIds={session.questions.map((q) => q.id)}
              onNavigate={navigateToQuestion}
              variant="compact"
              className="justify-center"
            />
          </div>
        </div>
      </main>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quiz?</DialogTitle>
            <DialogDescription>
              Are you ready to submit your quiz? You won't be able to make changes after submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex justify-between text-sm">
              <span>Questions answered:</span>
              <span className="font-medium">
                {getAnsweredCount()} / {session.questions.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Questions flagged:</span>
              <span className="font-medium">{flaggedQuestions.size}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitQuiz} disabled={isSubmitting} className="quiz-button-primary">
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Quiz?</DialogTitle>
            <DialogDescription>
              Your progress will be lost if you exit now. Are you sure you want to leave?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Stay
            </Button>
            <Button variant="destructive" onClick={handleExit}>
              Exit Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
