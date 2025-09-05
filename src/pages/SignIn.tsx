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

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn, loading } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    try {
      await signIn(form.email.trim(), form.password);
      navigate("/"); // back home after login
    } catch (e: any) {
      setErr(e?.message || "Sign in failed");
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
          <form onSubmit={onSubmit} className="space-y-4">
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
              window.location.href = authApi.googleStartUrl();
            }}
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
