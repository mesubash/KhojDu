"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MessageSquare,
  Home,
  CheckCircle,
  UserPlus,
  Camera,
  MapPin,
  Shield,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const tenantSteps = [
  {
    step: 1,
    icon: Search,
    title: "Search & Filter",
    description: "Browse thousands of verified properties using smart filters for location, price, and amenities.",
  },
  {
    step: 2,
    icon: MessageSquare,
    title: "Connect Directly",
    description: "Message landlords directly or connect instantly via WhatsApp for quick responses.",
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
    description: "Add property details, upload photos, and set your rental terms in minutes.",
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
    description: "Find properties in your preferred areas with our location-aware search.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "No middlemen — communicate directly with landlords through our secure platform.",
  },
]

export default function HowItWorksPage() {
  const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }
  const stagger = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }
  const cardHover = { whileHover: { y: -6, scale: 1.01, transition: { duration: 0.18 } } }

  return (
    <div className="page-shell">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-orange-950/30 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,149,64,0.12),transparent_35%)]" />
        <motion.div
          className="max-w-4xl mx-auto text-center relative space-y-6"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-3 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-4xl md:text-5xl text-orange-500" style={{ fontFamily: "var(--font-nothing-you-could-do)" }}>
                How KhojDu Works
              </h1>
              <span className="text-sm text-foreground font-bold tracking-wider" style={{ fontFamily: "var(--font-delius)" }}>
                FIND YOUR ROOF
              </span>
            </div>
          </motion.div>
          <motion.p variants={fadeUp} className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Whether you're looking for a room or want to rent out your property,{" "}
            <span className="text-orange-500 font-semibold">KhojDu</span> makes the process simple, secure, and efficient.
          </motion.p>
          <motion.div variants={fadeUp} className="flex justify-center gap-3">
            <Link href="/search">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">Start Searching</Button>
            </Link>
            <Link href="/auth/signup?role=landlord">
              <Button variant="outline" className="rounded-full border-orange-500 text-orange-600 hover:bg-orange-50">
                List a Property
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* For Tenants */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl font-bold text-foreground mb-2">For Tenants</h2>
            <p className="text-lg text-muted-foreground">Find your perfect room in 4 simple steps</p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {tenantSteps.map((step) => {
              const Icon = step.icon
              return (
                <motion.div key={step.step} variants={fadeUp} {...cardHover}>
                  <Card className="p-6 text-center rounded-xl shadow-sm hover:shadow-lg bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40">
                    <div className="relative mb-6 flex items-center justify-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                        <Icon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-9 h-9 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/search">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-3 shadow-md">
                Start Searching
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* For Landlords */}
      <section className="py-16 px-4 bg-muted/60 dark:bg-gray-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl font-bold text-foreground mb-2">For Landlords</h2>
            <p className="text-lg text-muted-foreground">List your property and find quality tenants</p>
          </div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {landlordSteps.map((step) => {
            const Icon = step.icon
            return (
              <motion.div key={step.step} variants={fadeUp} {...cardHover}>
                <Card className="p-6 text-center rounded-xl shadow-sm hover:shadow-lg bg-white/85 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40">
                  <div className="relative mb-6 flex items-center justify-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full">
                      <Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-9 h-9 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/auth/signup?role=landlord">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-3 shadow-md">
                List Your Property
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Why Choose <span className="text-orange-500" style={{ fontFamily: "var(--font-nothing-you-could-do)" }}>KhojDu</span>?
            </h2>
            <p className="text-lg text-muted-foreground">Features that make us the best choice for room rental</p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={index} variants={fadeUp} {...cardHover}>
                  <Card className="p-8 text-center rounded-xl shadow-sm hover:shadow-lg bg-white/85 dark:bg-gray-900/70 backdrop-blur-xl border border-white/30">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-6">
                      <Icon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.25),transparent_30%)]" />
        <div className="max-w-4xl mx-auto text-center relative space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Get Started?</h2>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto">
            Join thousands of satisfied users who have found their perfect rooms or tenants through{" "}
            <span className="text-white font-semibold">KhojDu</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-8 py-4 text-lg font-semibold"
              >
                Find a Room
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-orange-600 rounded-full px-8 py-4 text-lg font-semibold bg-transparent"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
