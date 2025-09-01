// src/App.tsx
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Pages
import Home from "@/pages/Home";
import QuizPage from "@/pages/quiz/QuizPage";
import Results from "@/pages/Results";
import Leaderboard from "@/pages/Leaderboard";
import Admin from "@/pages/Admin";
import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import NotFound from "@/pages/NotFound";

// Config page to create attempts
import ConfigPage from "@/features/quiz/config/ConfigPage";

// Auth
import { useAuthStore } from "@/stores/auth";
import RequireAdmin from "@/components/routes/RequireAdmin";

const queryClient = new QueryClient();

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    // Ensure session/user role is known on first load; ignore network errors
    fetchMe().catch(() => void 0);
  }, [fetchMe]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="quiz-theme">
        <TooltipProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Users land here first to configure & create an attempt */}
              <Route path="/quiz/new" element={<ConfigPage />} />

              {/* Runtime expects an attemptId */}
              <Route path="/quiz/:attemptId" element={<QuizPage />} />

              <Route path="/result/:attemptId" element={<Results />} />
              <Route path="/leaderboard" element={<Leaderboard />} />

              {/* Admin is locked down by role and server checks */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <Admin />
                  </RequireAdmin>
                }
              />

              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
