"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Home, CheckCircle, UserPlus, Camera, MapPin, Shield } from "lucide-react"
import Link from "next/link"

const tenantSteps = [
  {
    step: 1,
    icon: Search,
    title: "Search & Filter",
    description: "Browse thousands of verified properties using our smart filters for location, price, and amenities.",
  },
  {
    step: 2,
    icon: MessageSquare,
    title: "Connect Directly",
    description: "Message landlords directly through our platform or connect instantly via WhatsApp.",
  },
  {
    step: 3,
    icon: Home,
    title: "Visit & Decide",
    description: "Schedule visits, ask questions, and make informed decisions about your next home.",
  },
  {
    step: 4,
    icon: CheckCircle,
    title: "Move In",
    description: "Complete the rental agreement and move into your new room with confidence.",
  },
]

const landlordSteps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Sign Up & Verify",
    description: "Create your landlord account and complete our quick verification process.",
  },
  {
    step: 2,
    icon: Camera,
    title: "List Your Property",
    description: "Add property details, upload high-quality photos, and set your rental terms.",
  },
  {
    step: 3,
    icon: MessageSquare,
    title: "Connect with Tenants",
    description: "Receive inquiries from interested tenants and communicate directly.",
  },
  {
    step: 4,
    icon: CheckCircle,
    title: "Rent Successfully",
    description: "Find the perfect tenant and complete the rental process securely.",
  },
]

const features = [
  {
    icon: Shield,
    title: "Verified Listings",
    description: "All properties and landlords are verified for authenticity and safety.",
  },
  {
    icon: MapPin,
    title: "Location-Based Search",
    description: "Find properties in your preferred areas with our location-based search.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "No middlemen - communicate directly with landlords through our secure platform.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="page-shell">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-background dark:from-orange-950/20 dark:to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-4xl text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
                How KhojDu Works
              </h1>
              <span className="text-sm text-foreground font-bold tracking-wider" style={{ fontFamily: 'var(--font-delius)' }}>
                FIND YOUR ROOF
              </span>
            </div>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Whether you're looking for a room or want to rent out your property,  <span className="text-1xl text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
                KhojDu
              </span> makes the process simple,
            secure, and efficient. Here's how it works.
          </p>
        </div>
      </section>

      {/* For Tenants */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">For Tenants</h2>
            <p className="text-xl text-muted-foreground">Find your perfect room in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tenantSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card key={index} className="p-6 text-center rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                      <Icon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/search">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-8 py-3">Start Searching</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Landlords */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">For Landlords</h2>
            <p className="text-xl text-muted-foreground">List your property and find quality tenants</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {landlordSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card
                  key={index}
                  className="p-6 text-center rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full">
                      <Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/signup?role=landlord">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-8 py-3">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose  <span className="text-3xl text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
                KhojDu
              </span>?</h2>
            <p className="text-xl text-muted-foreground">Features that make us the best choice for room rental</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-8 text-center rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-6">
                    <Icon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who have found their perfect rooms or tenants through  <span className="text-xl text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
                KhojDu
              </span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 rounded-lg px-8 py-4 text-lg font-semibold"
              >
                Find a Room
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-orange-600 rounded-lg px-8 py-4 text-lg font-semibold bg-transparent"
              >
                List Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
