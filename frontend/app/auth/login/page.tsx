"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Mail, Phone, AlertCircle } from "lucide-react"
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

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [step, setStep] = useState(1)
  const [verificationCode, setVerificationCode] = useState("")

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

    // Validate form
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      console.log("[Login Page] Attempting login with:", formData.email)

      const loggedInUser = await login({
        email: formData.email,
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
      const errorMessage = err?.message || error?.message || "Login failed. Please check your credentials."
      toast.error(errorMessage)
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
                <Tabs
                  value={loginMethod}
                  onValueChange={(value) => setLoginMethod(value as "email" | "phone")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="email"
                      className="flex items-center space-x-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 data-[state=active]:border data-[state=active]:border-orange-200"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="phone"
                      className="flex items-center space-x-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 data-[state=active]:border data-[state=active]:border-orange-200"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="space-y-4 mt-4">
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
                      className="h-12 bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-white/15 shadow-md backdrop-blur-xl placeholder:text-muted-foreground/30 placeholder:font-light transition-all duration-300 focus:bg-white/80 dark:focus:bg-white/90 focus:backdrop-blur-2xl focus:ring-2 focus:ring-orange-400/70 focus:border-orange-400/70 focus:shadow-lg focus:shadow-orange-500/20 focus:placeholder:text-muted-foreground/60"
                    />
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-4 mt-4">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+977 9812345678"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      disabled={isLoading}
                      maxLength={14}
                      className="h-12 bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-white/15 shadow-md backdrop-blur-xl placeholder:text-muted-foreground/30 placeholder:font-light transition-all duration-300 focus:bg-white/80 dark:focus:bg-white/90 focus:backdrop-blur-2xl focus:ring-2 focus:ring-orange-400/70 focus:border-orange-400/70 focus:shadow-lg focus:shadow-orange-500/20 focus:placeholder:text-muted-foreground/60"
                    />
                  </TabsContent>
                </Tabs>

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
                      className="h-12 pr-10 bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-white/15 shadow-md backdrop-blur-xl placeholder:text-muted-foreground/30 placeholder:font-light transition-all duration-300 focus:bg-white/80 dark:focus:bg-white/90 focus:backdrop-blur-2xl focus:ring-2 focus:ring-orange-400/70 focus:border-orange-400/70 focus:shadow-lg focus:shadow-orange-500/20 focus:placeholder:text-muted-foreground/60"
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
