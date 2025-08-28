import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

console.log("[v0] Main.tsx loading...")

function startApp() {
  console.log("[v0] Starting app...")
  const rootElement = document.getElementById("root")

  if (rootElement) {
    createRoot(rootElement).render(<App />)
    console.log("[v0] React app rendered successfully")
  } else {
    console.error("[v0] Root element not found!")
  }
}

async function enableMocking() {
  console.log("[v0] Attempting to enable mocking, mode:", import.meta.env.MODE)

  if (import.meta.env.MODE !== "development") {
    console.log("[v0] Skipping MSW - not in development mode")
    return
  }

  try {
    const importPromise = import("./mocks/browser.ts")
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("MSW import timeout")), 5000))

    const { worker } = (await Promise.race([importPromise, timeoutPromise])) as any
    console.log("[v0] MSW worker imported successfully")

    const startPromise = worker.start({
      onUnhandledRequest: "bypass",
      quiet: false, // Show MSW logs for debugging
    })
    const startTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("MSW start timeout")), 10000),
    )

    await Promise.race([startPromise, startTimeoutPromise])
    console.log("[v0] MSW worker started successfully")

    await new Promise((resolve) => setTimeout(resolve, 100))
  } catch (error) {
    console.error("[v0] Failed to start MSW worker:", error)
    // Continue anyway - the app should work without MSW
  }
}

console.log("[v0] About to enable mocking...")

async function initializeApp() {
  try {
    // Try to enable MSW with a reasonable timeout
    await Promise.race([
      enableMocking(),
      new Promise((resolve) => setTimeout(resolve, 15000)), // 15 second max wait
    ])

    console.log("[v0] MSW setup complete, rendering React app...")
    startApp()
  } catch (error) {
    console.error("[v0] MSW setup failed, starting app anyway:", error)
    startApp()
  }
}

// Start the initialization
initializeApp()

setTimeout(() => {
  const rootElement = document.getElementById("root")
  if (!rootElement?.hasChildNodes()) {
    console.log("[v0] Fallback: Starting app after timeout - MSW may not be ready")
    startApp()
  }
}, 10000) // Reduced from 2000ms to 5000ms to give MSW more time but not too long
