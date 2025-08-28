// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Home from "@/pages/Home";
import QuizPage from "@/pages/quiz/QuizPage"; // ⬅️ updated import
import Results from "@/pages/Results";
import Leaderboard from "@/pages/Leaderboard";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";

// New split config page
import ConfigPage from "@/features/quiz/config/ConfigPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="quiz-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* New quiz configuration flow */}
              <Route path="/quiz/new" element={<ConfigPage />} />
              {/* Quiz runtime and result */}
              <Route path="/quiz/:attemptId" element={<QuizPage />} /> {/* ⬅️ updated usage */}
              <Route path="/result/:attemptId" element={<Results />} />
              {/* Other pages */}
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
