// src/pages/SignUp.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { authApi } from "@/lib/auth-client";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Map backend / network errors to friendly messages
function mapErrorMessage(err: unknown): string {
  const anyErr = err as any;
  const raw =
    anyErr?.message ||
    anyErr?.data?.message ||
    anyErr?.data?.error ||
    anyErr?.error ||
    "";

  const msg = String(raw).toLowerCase();

  // Common server-side codes
  if (msg.includes("email_taken")) return "This email is already in use.";
  if (msg.includes("invalid_email")) return "Please enter a valid email address.";
  if (msg.includes("weak_password")) return "Password is too weak. Use at least 8 characters.";
  if (msg.includes("password_too_short")) return "Password must be at least 8 characters.";
  if (msg.includes("rate_limit") || msg.includes("too many")) return "Too many attempts. Please try again later.";

  // Network / platform
  if (msg.includes("timeout")) return "Request timed out. Please try again.";
  if (msg.includes("failed to fetch")) return "Network error. Please check your internet connection.";
  if (msg.includes("cors")) return "Sign up blocked by CORS/auth settings. Check FRONTEND_URL and cookies.";

  // Fallbacks
  if (!raw) return "Sign up failed. Please try again.";
  return String(raw);
}

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, loading } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return; // prevent double submit
    setErr(null);

    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;

    // Lightweight validation (keep UI as-is)
    if (!name || !email || !password) {
      setErr("Please fill in all fields.");
      return;
    }
    if (name.length < 2) {
      setErr("Please enter your full name.");
      return;
    }
    if (!isValidEmail(email)) {
      setErr("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    try {
      await signUp(name, email, password); // store handles API + cookie
      navigate("/"); // go home after successful sign up
    } catch (e: any) {
      setErr(mapErrorMessage(e));
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl border border-border shadow-lg bg-card text-card-foreground">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-4xl font-extrabold leading-tight text-primary">
            QuizMaster
          </h1>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your details to create an account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div className="space-y-2 text-left">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                className="focus-visible:ring-primary"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                required
                aria-invalid={!!err && form.name.trim().length < 2}
              />
            </div>

            {/* Email */}
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="focus-visible:ring-primary"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                required
                aria-invalid={!!err && !isValidEmail(form.email.trim())}
              />
            </div>

            {/* Password + toggle */}
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="focus-visible:ring-primary pr-10"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  minLength={8}
                  required
                  aria-invalid={!!err && form.password.length < 8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {err && (
              <p className="text-sm text-destructive" role="alert" aria-live="polite">
                {err}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-primary hover:opacity-95 text-white"
              disabled={loading}
            >
              {loading ? "Creating..." : "Sign Up"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Google sign-up */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10"
            onClick={() => {
              window.location.assign(authApi.googleStartUrl());
            }}
            disabled={loading}
          >
            <svg
              className="mr-2 h-5 w-5"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path fill="#EA4335" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272.1v95.4h146.9c-6.3 34-25 62.8-53.4 82v67h86.3c50.6-46.6 81.6-115.3 81.6-194z" />
              <path fill="#34A853" d="M272.1 544.3c73.8 0 135.6-24.5 180.8-66.2l-86.3-67c-24 16.1-54.7 25.7-94.5 25.7-72.5 0-134-48.9-155.9-114.5H27.6v71.9c45 89.2 137.4 150.1 244.5 150.1z" />
              <path fill="#4A90E2" d="M116.2 322.3c-10-29.9-10-62.1 0-92l.1-71.9H27.6c-46.6 92.7-46.6 199 0 291.7l88.6-67.8z" />
              <path fill="#FBBC05" d="M272.1 107.7c39.9-.6 78.1 14.7 107.2 42.9l80-80.1C407.9 25.4 343.2 0 272.1 0 165 0 72.6 60.9 27.6 150.1l88.7 71.9c21.8-65.6 83.3-114.3 155.8-114.3z" />
            </svg>
            Sign up with Google
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
