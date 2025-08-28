"use client"

import type React from "react"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { Home, Trophy } from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import type { SubmitQuizResp } from "@/types/quiz"
import ScoreHeader from "./components/ScoreHeader"
import StatsCards from "./components/StatsCards"
import PerformanceOverview from "./components/PerformanceOverview"
import ReviewPanel from "./components/ReviewPanel"
import ActionButtons from "./components/ActionButtons"

export default function ResultsPage(): React.JSX.Element | null {
  // keep URL shape if you use attemptId elsewhere
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const results = location.state?.result as SubmitQuizResp | undefined
  const questions = location.state?.questions

  useEffect(() => {
    if (!results) navigate("/")
  }, [results, navigate])

  if (!results) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="quiz-focus">
              <Home size={18} />
            </Button>
            <div className="flex items-center space-x-2">
              <Trophy size={18} className="text-primary" />
              <span className="text-lg font-semibold">Quiz Results</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <ScoreHeader results={results} />
          <StatsCards results={results} />
          <PerformanceOverview results={results} />
          <ReviewPanel results={results} questions={questions} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <ActionButtons results={results} />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
