"use client"

// Auth Context - Global authentication state management
// ✅ SECURITY: Hybrid token storage matching backend architecture
// - AccessToken: Stored in localStorage (persists across tabs) ← From JSON response
// - RefreshToken: Stored as HTTP-only cookie by backend ← Automatic browser handling

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import authService from "@/services/authService"
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthState,
  ApiResponse,
  LoginResponse,
  RegisterResponse,
} from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  const router = useRouter()

  // Initialize auth state on mount - restore from localStorage
  useEffect(() => {
    const initAuth = () => {
      console.log('[AuthContext] Initializing auth state...')
      try {
        if (typeof window === 'undefined') return

        const storedUser = localStorage.getItem('__kd_user')
        const storedToken = localStorage.getItem('__kd_token')

        if (storedUser && storedToken) {
          setState({
            user: JSON.parse(storedUser),
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          console.log('[AuthContext] ✅ Session restored from storage')
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        console.error('[AuthContext] Failed to restore session:', error)
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      }
    }
    initAuth()
  }, [])

  // Sync auth state across tabs using storage events
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      // Only handle changes to our auth keys
      if (e.key === '__kd_token' || e.key === '__kd_user') {
        console.log('[AuthContext] Storage changed in another tab, syncing...')

        const storedUser = localStorage.getItem('__kd_user')
        const storedToken = localStorage.getItem('__kd_token')

        if (storedUser && storedToken) {
          // User logged in in another tab
          setState({
            user: JSON.parse(storedUser),
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          console.log('[AuthContext] ✅ Synced login from another tab')
        } else {
          // User logged out in another tab
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          console.log('[AuthContext] ✅ Synced logout from another tab')
          // Redirect to login if on a protected page
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
            router.push('/auth/login')
          }
        }
      }
    }

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [router])

  // Login handler
  const login = useCallback(
    async (credentials: LoginRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        console.log('[Login] Starting login...')
        const response: ApiResponse<LoginResponse> = await authService.login(credentials)

        console.log('[Login] Full response:', response)
        console.log('[Login] Response data:', response.data)
        console.log('[Login] Cookies after login:', document.cookie)

        // ✅ Check if we got the user data
        if (!response.data?.user) {
          console.error('[Login] Missing user data in response:', response)
          throw new Error("Invalid response from server - missing user data")
        }

        const { user, accessToken } = response.data
        console.log('[Login] Login successful, user:', user.email)

        // ✅ Store in localStorage (persists across tabs)
        if (typeof window !== 'undefined') {
          localStorage.setItem('__kd_user', JSON.stringify(user))
          localStorage.setItem('__kd_token', accessToken)
          console.log('[Login] Stored in localStorage')
        }

        // ✅ Update React state
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        console.log('[AuthContext] ✅ Login successful')
      } catch (error: any) {
        console.error('[Login] Error occurred:', {
          message: error.message,
          status: error.status,
        })

        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: {
            message: error.message || "Login failed",
            status: error.status || 0,
            errors: error.errors,
          },
        })
        throw error
      }
    },
    []
  )

  // Register handler
  const register = useCallback(
    async (userData: RegisterRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        console.log('[Register] Starting registration...')
        const response: ApiResponse<RegisterResponse> = await authService.register(userData)

        console.log('[Register] Full response:', response)
        console.log('[Register] Response data:', response.data)

        // ✅ Check if we got the user data
        if (!response.data?.user) {
          console.error('[Register] Missing user data in response:', response)
          throw new Error("Invalid response from server - missing user data")
        }

        const { user, accessToken } = response.data
        console.log('[Register] Registration successful, user:', user.email)

        // ✅ Store in localStorage (persists across tabs)
        if (typeof window !== 'undefined') {
          localStorage.setItem('__kd_user', JSON.stringify(user))
          localStorage.setItem('__kd_token', accessToken)
          console.log('[Register] Stored in localStorage')
        }

        // ✅ Update React state
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        console.log('[AuthContext] ✅ Registration successful')
      } catch (error: any) {
        console.error('[Register] Error occurred:', {
          message: error.message,
          status: error.status,
        })

        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: {
            message: error.message || "Registration failed",
            status: error.status || 0,
            errors: error.errors,
          },
        })
        throw error
      }
    },
    []
  )

  // Logout handler
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      await authService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('__kd_token')
        localStorage.removeItem('__kd_user')
        console.log('[AuthContext] ✅ Session cleared')
      }

      // Backend clears cookies
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })

      // Redirect to login page
      router.push("/auth/login")
    }
  }, [router])

  // Refresh auth state
  const refreshAuth = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser()

      if (user && typeof window !== 'undefined') {
        // Update localStorage with latest user data
        localStorage.setItem('__kd_user', JSON.stringify(user))
        console.log('[AuthContext] ✅ User data refreshed')
      }

      setState({
        user: user || null,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: {
          message: error.message || "Failed to refresh authentication",
          status: error.status || 0,
        },
      })
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export default AuthContext
