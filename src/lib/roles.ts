// Normalizes different role formats and cases.
export function isAdminRole(role?: unknown): boolean {
  if (role == null) return false;
  const r = String(role).trim().toUpperCase();
  // supports: "ADMIN", "ROLE_ADMIN", and any string containing ADMIN
  return r === "ADMIN" || r === "ROLE_ADMIN" || r.includes("ADMIN");
}
