// src/pages/SignIn.tsx
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
import { useAuthStore } from "@/stores/auth";
import { authApi } from "@/lib/auth-client";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Turn backend / network errors into friendly messages
function mapErrorMessage(err: unknown): string {
  // common shapes: Error(message), { status, message, data }, fetch text
  const anyErr = err as any;
  const raw =
    anyErr?.message ||
    anyErr?.data?.message ||
    anyErr?.data?.error ||
    anyErr?.error ||
    "";

  const msg = String(raw).toLowerCase();

  // Backend codes
  if (msg.includes("invalid_credentials")) return "Email or password is incorrect.";
  if (msg.includes("password_not_set")) return "Password not set for this account. Try Google sign-in or reset password.";
  if (msg.includes("missing_token")) return "Session expired. Please sign in again.";
  if (msg.includes("account_disabled")) return "Your account is disabled. Please contact support.";
  if (msg.includes("email_not_verified")) return "Please verify your email before signing in.";

  // Network / platform
  if (msg.includes("timeout")) return "Request timed out. Please try again.";
  if (msg.includes("failed to fetch")) return "Network error. Please check your internet connection.";
  if (msg.includes("cors")) return "Sign-in blocked by CORS/auth settings. Check FRONTEND_URL and cookies.";

  // Fallbacks
  if (!raw) return "Sign in failed. Please try again.";
  return String(raw);
}

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn, loading } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return; // prevent double submit
    setErr(null);

    const email = form.email.trim();
    const password = form.password;

    // Lightweight front-end validation (no UI changes)
    if (!email || !password) {
      setErr("Please enter your email and password.");
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
      await signIn(email, password); // uses store -> calls API -> sets cookie/session
      navigate("/"); // back home after login
    } catch (e: any) {
      setErr(mapErrorMessage(e));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Use your account or continue with Google.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((s) => ({ ...s, email: e.target.value }))
                }
                autoComplete="email"
                aria-invalid={!!err && !isValidEmail(form.email)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) =>
                  setForm((s) => ({ ...s, password: e.target.value }))
                }
                autoComplete="current-password"
                aria-invalid={!!err && form.password.length < 8}
              />
            </div>

            {err && (
              <p
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {err}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="my-4 text-center text-sm text-muted-foreground">
            or
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.assign(authApi.googleStartUrl());
            }}
            disabled={loading}
          >
            Continue with Google
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            New here?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
