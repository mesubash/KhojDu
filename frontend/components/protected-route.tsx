"use client"

// Protected Route component - Route protection with role-based access control

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { UserRole } from "@/types/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requireVerified?: boolean
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireVerified = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated || !user) {
        router.push("/auth/login")
        return
      }

      // Check role requirement
      if (requiredRole && user.role !== requiredRole) {
        router.push("/unauthorized")
        return
      }

      // Check email verification requirement
      if (requireVerified && !user.isVerified) {
        router.push("/verify-email-required")
        return
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, requireVerified, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!isAuthenticated || !user) {
    return null
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return null
  }

  // Check verification requirement
  if (requireVerified && !user.isVerified) {
    return null
  }

  // All checks passed - render children
  return <>{children}</>
}

export default ProtectedRoute
