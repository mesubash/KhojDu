"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import authService from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Invalid or missing verification token")
        setIsVerifying(false)
        return
      }

      try {
        await authService.verifyEmail(token)
        setSuccess(true)
        setIsVerifying(false)
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } catch (err: any) {
        setError(err.message || "Failed to verify email")
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <Logo type="banner" size="md" showText showTagline />
          </div>
        </div>

        <Card className="shadow-lg rounded-xl border-border">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>
              {isVerifying ? "Verifying your email address..." : ""}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isVerifying ? (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we verify your email address...
                  </p>
                </div>
              </div>
            ) : success ? (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Email Verified!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your email has been successfully verified.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Redirecting to dashboard...
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 mt-4">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Verification Failed</h3>
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
                <div className="space-y-2 pt-4">
                  <Link href="/auth/login">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12">
                      Go to Login
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full h-12">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
