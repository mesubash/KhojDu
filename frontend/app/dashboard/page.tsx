"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/context/AuthContext"
import { getDashboardRouteForRole } from "@/lib/utils"

export default function DashboardRedirect() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user) {
      router.replace("/auth/login?redirect=/dashboard")
      return
    }

    const target = getDashboardRouteForRole(user.role)
    router.replace(target)
  }, [isAuthenticated, isLoading, router, user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header hideNavigation />
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Preparing your dashboard...</p>
        </div>
      </div>
    </div>
  )
}
