"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, ArrowLeft, User, Building, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { UserRole } from "@/types/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/logo"
import { getDashboardRouteForRole } from "@/lib/utils"

export default function SignupPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError, isAuthenticated, user } = useAuth()

  const [role, setRole] = useState<"tenant" | "landlord">("tenant")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    occupation: "",
  })

  // If already authenticated, send to the role dashboard instead of showing signup
  useEffect(() => {
    if (isAuthenticated) {
      const target = getDashboardRouteForRole(user?.role)
      router.replace(target)
    }
  }, [isAuthenticated, user?.role, router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!")
      return
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions")
      return
    }

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate phone number format (up to 14 digits, allow country code and symbols)
    const digitsOnly = formData.phone.replace(/\D/g, "")
    if (digitsOnly.length < 8 || digitsOnly.length > 14) {
      toast.error("Phone number must be 8–14 digits (country code allowed)")
      return
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    try {
      // Map tenant/landlord to TENANT/LANDLORD role
      const userRole = role === "landlord" ? UserRole.LANDLORD : UserRole.TENANT

      const registeredUser = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: digitsOnly,
        role: userRole,
        dateOfBirth: formData.dateOfBirth || undefined,
        occupation: formData.occupation || undefined,
      })

      // ✅ Registration successful
      toast.success("Account created successfully!")

      // Redirect to dashboard
      const target = getDashboardRouteForRole(registeredUser?.role)
      router.push(target)
    } catch (err: any) {
      // Error is already set in context, but also show toast
      const errorMessage = err?.message || error?.message || "Registration failed. Please try again."
      toast.error(errorMessage)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (error) clearError()
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-3xl relative z-10">
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
          <h1 className="text-3xl font-bold text-gradient mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join KhojDu and find your perfect place</p>
        </div>

        <Card className="glass-card hover-lift smooth-shadow border-0 relative z-20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Sign up as a Tenant or Landlord. We’ll tailor the dashboard based on your choice.
              </CardDescription>
            </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
              {/* Role Selection */}
              <div>
                <Label className="text-base font-medium">I am a:</Label>
                <Tabs
                  value={role}
                  onValueChange={(value) => setRole(value as "tenant" | "landlord")}
                  className="mt-2"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="tenant"
                      className="flex items-center space-x-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 data-[state=active]:border data-[state=active]:border-orange-200"
                    >
                      <User className="h-4 w-4" />
                      <span>Tenant</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="landlord"
                      className="flex items-center space-x-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 data-[state=active]:border data-[state=active]:border-orange-200"
                    >
                      <Building className="h-4 w-4" />
                      <span>Landlord</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-1 h-12 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm placeholder:text-muted-foreground/60"
                />
                </div>

                <div>
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
                  className="mt-1 h-12 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md placeholder:text-muted-foreground/50"
                />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (827) 629-8376"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                  disabled={isLoading}
                  maxLength={20}
                  className="mt-1 h-12 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md placeholder:text-muted-foreground/50"
                />
                <p className="text-xs text-muted-foreground mt-1">We strip spaces/symbols; enter 8–14 digits including country code.</p>
              </div>

              {/* Role-specific optional details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {role === "tenant" && (
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                      Date of Birth (optional)
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      disabled={isLoading}
                      className="mt-1 h-12 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md placeholder:text-muted-foreground/50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Used to personalize your tenant profile.</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="occupation" className="text-sm font-medium">
                    {role === "landlord" ? "Business / Occupation (optional)" : "Occupation (optional)"}
                  </Label>
                  <Input
                    id="occupation"
                    type="text"
                    placeholder={role === "landlord" ? "e.g., Property owner / Agent" : "e.g., Designer"}
                    value={formData.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    disabled={isLoading}
                    className="mt-1 h-12 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 pr-10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md placeholder:text-muted-foreground/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 pr-10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md placeholder:text-muted-foreground/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-orange-600 hover:text-orange-700">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-orange-600 hover:text-orange-700">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full gradient-orange hover-lift text-white h-12 font-semibold shadow-lg shadow-orange-500/30"
                disabled={isLoading || !agreeToTerms}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
