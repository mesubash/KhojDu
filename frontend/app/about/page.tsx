"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Award, Heart, Shield, Zap } from "lucide-react"

const team = [
  {
    name: "Rajesh Kumar",
    role: "CEO & Founder",
    image: "/placeholder.svg?height=200&width=200",
    bio: "Tech executive with 10+ years in real estate technology. Passionate about solving housing challenges in Nepal.",
  },
  {
    name: "Priya Sharma",
    role: "CTO",
    image: "/placeholder.svg?height=200&width=200",
    bio: "Full-stack developer and tech enthusiast. Leading our engineering team to build world-class rental solutions.",
  },
  {
    name: "Amit Thapa",
    role: "Head of Operations",
    image: "/placeholder.svg?height=200&width=200",
    bio: "Real estate veteran with deep knowledge of Kathmandu property market. Ensures platform quality and trust.",
  },
]

const values = [
  {
    icon: Shield,
    title: "Trust & Security",
    description: "We verify every landlord and property to ensure a safe rental experience for everyone.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Our users are at the heart of everything we do. We're committed to their success and satisfaction.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "We continuously innovate to make room rental simple, fast, and efficient.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-background dark:from-orange-950/20 dark:to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-4xl text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
                About KhojDu
              </h1>
              <span className="text-sm text-foreground font-bold tracking-wider" style={{ fontFamily: 'var(--font-delius)' }}>
                FIND YOUR ROOF
              </span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Making Room Rental Easy in <span className="text-orange-500">Kathmandu</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Established in 2024,  <span className="text-1xl text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
                KhojDu
              </span> is Nepal's leading room rental platform, connecting thousands of tenants with verified
            landlords across the Kathmandu valley. Our mission is to make finding and renting rooms as simple as possible.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8 rounded-xl shadow-sm border-border">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-6">
                <Target className="h-8 w-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To revolutionize the room rental experience in Nepal by creating a transparent, secure, and efficient platform
                that connects tenants with quality accommodations and helps landlords find reliable tenants.
              </p>
            </Card>

            <Card className="p-8 rounded-xl shadow-sm border-border">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/20 rounded-full mb-6">
                <Award className="h-8 w-8 text-teal-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become Nepal's most trusted and comprehensive room rental platform, expanding from Kathmandu to serve
                the entire country and setting new standards for rental experiences.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">Principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="p-6 text-center rounded-xl shadow-sm border-border">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-6">
                    <Icon className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Team</h2>
            <p className="text-xl text-muted-foreground">The passionate people behind KhojDu</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center rounded-xl shadow-sm border-border">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="text-xl font-semibold text-foreground mb-2">{member.name}</h3>
                <p className="text-orange-500 font-medium mb-4">{member.role}</p>
                <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-xl text-orange-100">Numbers that tell our story</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">15,000+</div>
              <div className="text-orange-100">Properties Listed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-orange-100">Happy Tenants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">5,000+</div>
              <div className="text-orange-100">Verified Landlords</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-orange-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
