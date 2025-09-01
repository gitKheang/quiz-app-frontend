// src/components/routes/RequireAdmin.tsx
import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

type RequireAdminProps = {
  children: ReactNode;
  /** Render while checking session (default: nothing) */
  fallback?: ReactNode;
  /** Where to send non-admins (default: "/") */
  redirectTo?: string;
};

/** ---- helpers (logic only, no UI change) ---- */
function isAdminRole(role: unknown): boolean {
  if (role == null) return false;

  // String role: "ADMIN", "admin", "ROLE_ADMIN", etc.
  if (typeof role === "string") {
    const r = role.trim().toUpperCase();
    return r === "ADMIN" || r === "ROLE_ADMIN" || r.includes("ADMIN");
  }

  // Array of roles/strings/objects
  if (Array.isArray(role)) {
    return role.some(isAdminRole);
  }

  // Object role: try common fields
  if (typeof role === "object") {
    const obj = role as Record<string, unknown>;
    const candidates = ["role", "name", "value", "type"];
    return candidates.some((k) => isAdminRole(obj[k]));
  }

  return false;
}

function isAdminUser(user: any): boolean {
  if (!user) return false;
  return (
    isAdminRole(user.role) ||
    isAdminRole(user.roles) ||
    isAdminRole(user.permissions) ||
    isAdminRole(user.claims?.role) ||
    isAdminRole(user.claims?.roles)
  );
}

/**
 * Client-side admin guard.
 * - Renders `fallback` while auth is initializing (prevents flicker).
 * - Allows any admin-like role ("ADMIN", "ROLE_ADMIN", arrays, etc.).
 * - Redirects others to `redirectTo` (default "/") and preserves `from` in state.
 *
 * Note: Backend must still protect admin APIs.
 */
export default function RequireAdmin({
  children,
  fallback = null,
  redirectTo = "/",
}: RequireAdminProps) {
  const { user, initializing } = useAuthStore();
  const location = useLocation();

  if (initializing) return <>{fallback}</>;
  if (isAdminUser(user)) return <>{children}</>;

  return (
    <Navigate
      to={redirectTo}
      replace
      state={{ from: location }}
    />
  );
}
