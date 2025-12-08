"use client"

import { useState } from "react"
import authService from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await authService.forgotPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-shell flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/auth/login" 
            className="inline-flex items-center space-x-2 text-orange-500 hover:text-orange-600 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
          
          <div className="flex items-center justify-center mb-2">
            <Logo type="banner" size="md"  />
          </div>
          
          <p className="text-muted-foreground">Reset your password</p>
        </div>

        <Card className="shadow-lg rounded-xl border-border">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a password reset link
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The link will expire in 1 hour.
                  </p>
                </div>
                <Link href="/auth/login">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 mt-4">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-12 pl-10 bg-white/5 dark:bg-gray-900/10 border border-white/15 dark:border-white/10 shadow-sm backdrop-blur-[40px] placeholder:text-muted-foreground/25 transition-all focus:bg-white/50 focus:backdrop-blur-[50px] focus:ring-2 focus:ring-orange-200/60 focus:border-orange-200/60"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                {/* Additional Info */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <p>
                    Remember your password?{" "}
                    <Link 
                      href="/auth/login" 
                      className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
