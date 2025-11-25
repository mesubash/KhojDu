// Debug component to check authentication state
// Remove this after testing!

"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"

export function AuthDebugger() {
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    const checkSession = () => {
      console.group("🔍 Auth State Debug")
      console.log("isAuthenticated:", isAuthenticated)
      console.log("isLoading:", isLoading)
      console.log("user:", user)
      console.log("accessToken in window:", !!(window as any).__getAccessToken?.())
      console.log("All cookies:", document.cookie) // Won't show HttpOnly cookies
      console.groupEnd()
    }

    // Check on mount and every 5 seconds
    checkSession()
    const interval = setInterval(checkSession, 5000)

    return () => clearInterval(interval)
  }, [user, isAuthenticated, isLoading])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  // Check if we're in browser
  const hasToken = typeof window !== 'undefined' ? !!(window as any).__getAccessToken?.() : false

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <div className="font-bold mb-2">🔐 Auth Debug</div>
      <div>Status: {isLoading ? "⏳ Loading" : isAuthenticated ? "✅ Authenticated" : "❌ Not Auth"}</div>
      <div>User: {user?.email || "None"}</div>
      <div>Token: {hasToken ? "✅ Set" : "❌ Not set"}</div>
      <div className="text-yellow-400 mt-2">
        Check DevTools → Application → Cookies for refreshToken
      </div>
    </div>
  )
}
