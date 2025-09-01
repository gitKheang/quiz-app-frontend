// src/lib/auth-client.ts
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: "USER" | "ADMIN";
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function ffetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (res.headers.get("content-type") || "").includes("application/json")
    ? res.json()
    : (null as any);
}

export const authApi = {
  me: () => ffetch<AuthUser | null>("/auth/me"),
  signUp: (body: { name: string; email: string; password: string }) =>
    ffetch<AuthUser>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  signIn: (body: { email: string; password: string }) =>
    ffetch<AuthUser>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  signOut: () => ffetch<{ ok: true }>("/auth/signout", { method: "POST" }),
  googleStartUrl: () => `${BASE_URL}/auth/google`,
};
