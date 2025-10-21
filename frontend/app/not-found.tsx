"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, Search, ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Hero Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <h1 className="text-5xl text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
                  Page Not Found
                </h1>
                <span className="text-sm text-foreground font-bold tracking-wider" style={{ fontFamily: 'var(--font-delius)' }}>
                  LOST YOUR WAY?
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-orange-50 to-background dark:from-orange-950/20 dark:to-background border-orange-200 dark:border-orange-800">
            <div className="space-y-4">
              <div className="text-8xl font-bold text-orange-500 mb-4">404</div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Oops! This page doesn't exist
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                It looks like the page you're looking for has moved, been deleted, or never existed. 
                But don't worry - we'll help you find your way back to finding the perfect room!
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-8 py-4 text-lg font-semibold flex items-center gap-2">
                <Home className="h-5 w-5" />
                Go to Home
              </Button>
            </Link>
            <Link href="/search">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg px-8 py-4 text-lg font-semibold flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                Search Properties
              </Button>
            </Link>
          </div>

          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground flex items-center gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Popular Pages</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/about" className="text-orange-500 hover:text-orange-600 transition-colors">
                About KhojDu
              </Link>
              <Link href="/how-it-works" className="text-orange-500 hover:text-orange-600 transition-colors">
                How It Works
              </Link>
              <Link href="/contact" className="text-orange-500 hover:text-orange-600 transition-colors">
                Contact Us
              </Link>
              <Link href="/auth/signup" className="text-orange-500 hover:text-orange-600 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
