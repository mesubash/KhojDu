"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Mail, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/context/AuthContext"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getDashboardRouteForRole } from "@/lib/utils"
import authService from "@/services/authService"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [step, setStep] = useState(1)
  const [verificationCode, setVerificationCode] = useState("")
  const [inactiveMessage, setInactiveMessage] = useState<string | null>(null)
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendDelay, setResendDelay] = useState(30)

  // Cooldown timer for resend verification
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  })

  // If already authenticated, bounce to the correct dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const target = getDashboardRouteForRole(user?.role)
      router.replace(target)
    }
  }, [isAuthenticated, user?.role, router])

  // Show pending login notice (set by axios interceptor)
  useEffect(() => {
    if (typeof window === "undefined") return
    const pending = localStorage.getItem("__kd_login_notice")
    if (pending) {
      toast.error(pending)
      localStorage.removeItem("__kd_login_notice")
    }
  }, [])

  // Prefill remembered email
  useEffect(() => {
    if (typeof window === "undefined") return
    const remembered = localStorage.getItem("__kd_remember_email")
    if (remembered) {
      setFormData((prev) => ({ ...prev, email: remembered }))
      setRememberMe(true)
    }
  }, [])

  // ✅ Don't auto-redirect here - let middleware handle it
  // The handleSubmit function already handles post-login redirect

  const handleInputChange = (field: string, value: string) => {
    if (error) clearError()
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInactiveMessage(null)
    setVerifyMessage(null)

    const identifier = formData.email.trim()

    // Validate form
    if (!identifier || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      console.log("[Login Page] Attempting login with:", identifier)

      const loggedInUser = await login({
        email: identifier,
        password: formData.password,
      })

      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("__kd_remember_email", formData.email)
      } else if (typeof window !== "undefined") {
        localStorage.removeItem("__kd_remember_email")
      }

      console.log("[Login Page] Login successful, redirecting...")

      // ✅ Login successful - tokens are now set in memory and cookie
      toast.success("Login successful!")

      // Redirect using router.push for better Next.js integration
      const requestedRedirect = searchParams.get("redirect")
      const roleDashboard = getDashboardRouteForRole(loggedInUser?.role)
      const redirect = requestedRedirect && requestedRedirect !== "/dashboard" ? requestedRedirect : roleDashboard
      console.log("[Login Page] Redirecting to:", redirect)
      router.push(redirect)
    } catch (err: any) {
      console.error("[Login Page] Login failed:", err)
      // Error is already set in context, but also show toast
      const status = err?.status || error?.status
      const errorMessage = err?.message || error?.message || "Login failed. Please check your credentials."

      if (status === 403 && (errorMessage?.toLowerCase()?.includes("inactive") || errorMessage?.toLowerCase()?.includes("reactivate"))) {
        setInactiveMessage(errorMessage)
        toast.error(errorMessage)
      } else if (status === 403 && errorMessage?.toLowerCase()?.includes("verify")) {
        setVerifyMessage(errorMessage)
        toast.error(errorMessage)
      } else {
        toast.error(errorMessage)
      }
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-orange-500 hover:text-orange-600 mb-6 transition-all hover:translate-x-1 glass-subtle px-4 py-2 rounded-full cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="flex items-center justify-center mb-4">
            <Logo type="banner" size="md" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue your journey</p>
        </div>

        {inactiveMessage && (
          <div className="mb-4 rounded-xl border border-orange-200/70 bg-orange-50/80 px-4 py-3 text-sm text-orange-900 shadow-sm backdrop-blur">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 text-orange-500" />
              <div className="space-y-1">
                <p className="font-semibold">Account inactive</p>
                <p>{inactiveMessage}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => router.push("/auth/reactivate")}
                    className="rounded-full"
                  >
                    Reactivate now
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => router.push("/contact?topic=reactivation")}
                    className="rounded-full"
                  >
                    Contact support
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => setInactiveMessage(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {verifyMessage && (
          <div className="mb-4 rounded-xl border border-blue-200/70 bg-blue-50/80 px-4 py-3 text-sm text-blue-900 shadow-sm backdrop-blur">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 text-blue-500" />
              <div className="space-y-1">
                <p className="font-semibold">Verify your email</p>
                <p>{verifyMessage}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    disabled={resending || !formData.email || resendCooldown > 0}
                    onClick={async () => {
                      if (!formData.email) {
                        toast.error("Enter your email to resend verification.")
                        return
                      }
                      setResending(true)
                      try {
                        await authService.resendVerification(formData.email)
                        toast.success("Verification email sent. Check your inbox.")
                        setResendCooldown(resendDelay)
                        setResendDelay((prev) => Math.min(prev * 2, 5 * 60))
                      } catch (err: any) {
                        toast.error(err?.message || "Could not resend verification.")
                      } finally {
                        setResending(false)
                      }
                    }}
                    className="rounded-full"
                  >
                    {resending
                      ? "Sending..."
                      : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend verification"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => setVerifyMessage(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card className="glass-card hover-lift smooth-shadow border-0 relative z-20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">
              {step === 1 ? "Sign In" : "Verify Your Account"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "Enter your credentials to access your account"
                : "Enter the verification code sent to your device"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 mt-4">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-white/15 shadow-md backdrop-blur-xl placeholder:text-muted-foreground/30 placeholder:font-light transition-all duration-300 focus:bg-white/90 dark:focus:bg-gray-900/80 focus:backdrop-blur-xl focus:ring-2 focus:ring-orange-300/70 focus:border-orange-300/70 focus:shadow-lg focus:shadow-orange-500/20 focus:placeholder:text-muted-foreground/60"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 pr-10 bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-white/15 shadow-md backdrop-blur-xl placeholder:text-muted-foreground/30 placeholder:font-light transition-all duration-300 focus:bg-white/90 dark:focus:bg-gray-900/80 focus:backdrop-blur-xl focus:ring-2 focus:ring-orange-300/70 focus:border-orange-300/70 focus:shadow-lg focus:shadow-orange-500/20 focus:placeholder:text-muted-foreground/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>

                  <Link
                    href="/auth/forgot-password"
                    className="text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-orange hover-lift text-white h-12 font-semibold shadow-lg shadow-orange-500/30"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={() => { }} className="space-y-6">
                <Label htmlFor="verification" className="text-sm font-medium">
                  Verification Code
                </Label>
                <Input
                  id="verification"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                  className="mt-1 text-center text-lg tracking-widest h-12"
                />
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
                >
                  Verify & Sign In
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
