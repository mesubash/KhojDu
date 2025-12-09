"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Lock, Info, Loader2 } from "lucide-react"
import { toast } from "sonner"

import authService from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"

export default function ReactivatePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const glassInput =
    "!bg-white/10 dark:!bg-gray-900/25 border border-white/15 dark:border-white/10 shadow-sm backdrop-blur-xl text-foreground placeholder:text-muted-foreground/35 placeholder:font-light transition-all focus:!bg-white/85 dark:focus:!bg-gray-900/70 focus:backdrop-blur-2xl focus:ring-2 focus:ring-orange-300/70 focus:border-orange-300/70"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error("Please enter your email and last password.")
      return
    }
    setIsSubmitting(true)
    try {
      await authService.initiateReactivation({
        email: formData.email,
        password: formData.password,
      })
      toast.success("Reactivation link sent! Check your email to confirm.")
      setSent(true)
    } catch (err: any) {
      toast.error(err?.message || "Could not start reactivation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 left-8 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-8 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        <Link
          href="/auth/login"
          className="inline-flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-all hover:translate-x-1 glass-subtle px-4 py-2 rounded-full cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to login</span>
        </Link>

        <Card className="glass-card hover-lift smooth-shadow border-0 relative z-20">
          <CardHeader className="text-center pb-4 space-y-2">
            <div className="flex justify-center">
              <Logo type="banner" size="md" />
            </div>
            <CardTitle className="text-2xl">Reactivate Account</CardTitle>
            <CardDescription>
              Enter your email and last password. We&apos;ll send a reactivation link to confirm.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="rounded-xl border border-green-200/60 bg-green-50/80 p-4 text-sm text-green-900 backdrop-blur">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-semibold">Check your email</p>
                    <p>We sent a reactivation link to {formData.email || "your email"}. Follow the link to complete reactivation.</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`pl-9 ${glassInput}`}
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Last password</Label>
                    <Link href="/auth/forgot-password" className="text-sm text-orange-500 hover:text-orange-600">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-9 ${glassInput}`}
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reactivation link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
