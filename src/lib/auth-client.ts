// src/lib/auth-client.ts
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: "USER" | "ADMIN";
};

// --- Base URL: prod must be set via VITE_API_BASE_URL ---
const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? undefined;
const rawBase = envBase ?? (import.meta.env.DEV ? "/api" : undefined);
if (!rawBase) {
  throw new Error("VITE_API_BASE_URL is not set");
}
const BASE_URL = rawBase.replace(/\/+$/, ""); // remove trailing slash

async function ffetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return (res.headers.get("content-type") || "").includes("application/json")
    ? ((await res.json()) as T)
    : (null as any as T);
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
