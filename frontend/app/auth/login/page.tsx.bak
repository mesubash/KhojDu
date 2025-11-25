"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Mail, Phone, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [step, setStep] = useState(1)
  const [verificationCode, setVerificationCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = "/explore"
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-orange-500 hover:text-orange-600 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Search className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
                KhojDu
              </span>
              <span className="text-xs text-foreground font-bold tracking-wider" style={{ fontFamily: 'var(--font-delius)' }}>
                FIND YOUR ROOF
              </span>
            </div>
          </div>
          <p className="text-muted-foreground">Welcome back to your account</p>
        </div>

        <Card className="shadow-lg rounded-xl border-border">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">{step === 1 ? "Sign In" : "Verify Your Account"}</CardTitle>
            <CardDescription>
              {step === 1
                ? "Enter your credentials to access your account"
                : "Enter the verification code sent to your device"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as "email" | "phone")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </TabsTrigger>
                    <TabsTrigger value="phone" className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="space-y-4 mt-4">
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
                        className="mt-1 h-12"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+977 98XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="mt-1 h-12"
                      />
                    </div>
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
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="h-12 pr-10"
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

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-orange-600 hover:text-orange-700">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12">
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerification} className="space-y-6">
                <div>
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
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Code sent to {loginMethod === "email" ? formData.email : formData.phone}
                  </p>
                </div>

                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12">
                  Verify & Sign In
                </Button>

                <div className="flex flex-col space-y-2">
                  <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={() => setStep(1)}>
                    Back to Login
                  </Button>
                  <Button type="button" variant="ghost" className="w-full text-orange-600 text-sm">
                    Resend Code
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
