// src/lib/auth-client.ts
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: "USER" | "ADMIN";
};

// Base URL: prefer env, otherwise infer same-origin /api (works in prod & dev)
const envBase = (import.meta.env?.VITE_API_BASE_URL as string | undefined) ?? undefined;
const inferred =
  typeof window !== "undefined" && window.location?.origin
    ? `${window.location.origin}/api`
    : (import.meta.env?.DEV ? "/api" : undefined);
const rawBase = (envBase ?? inferred ?? "/api").replace(/\/+$/, "");
const BASE_URL = rawBase;

async function ffetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    credentials: "include", // send/receive auth cookies
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });

  if (!res.ok) {
    // Try to extract error message if server returned JSON
    const ct = res.headers.get("content-type") || "";
    const msg = ct.includes("application/json")
      ? (await res.json().catch(() => null))?.message
      : await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return null as any as T;
  }
  return (await res.json()) as T;
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
