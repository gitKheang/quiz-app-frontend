// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Boot the app — MSW is not used. All API calls should hit your real backend.
const rootEl = document.getElementById("root");
if (!rootEl) {
  // Fail fast if the root element is missing
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Optional: tiny dev hint so you know which backend you're hitting during local dev
if (import.meta.env.DEV) {
  // If your API client reads VITE_API_BASE_URL, this will confirm it's set.
  const base = (import.meta as any).env?.VITE_API_BASE_URL;
  if (!base) {
    console.warn(
      "[dev] VITE_API_BASE_URL is not set. Use absolute URLs in your API client or configure the base URL."
    );
  } else {
    console.log("[dev] Using API base URL:", base);
  }
}
