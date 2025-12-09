"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Award, Heart, Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"

const team = [
  {
    name: "Subash Singh Dhami",
    role: "Founder & Product Lead",
    image: "/placeholder.svg?height=200&width=200",
    bio: "Builder, product thinker, and relentless problem solver crafting delightful rental experiences in Nepal.",
    github: "https://github.com/mesubash",
    linkedin: "https://www.linkedin.com/in/subashsdhami",
    website: "https://subashsdhami.com.np",
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
  const listContainer = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }
  const fadeItem = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as any } },
  }

  return (
    <div className="page-shell">
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
          <motion.div
            className="grid md:grid-cols-2 gap-12"
            variants={listContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeItem} whileHover={{ y: -6, scale: 1.01, boxShadow: "0 16px 36px rgba(0,0,0,0.12)" }}>
              <Card className="p-8 rounded-xl shadow-sm border-border cursor-pointer">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-6">
                  <Target className="h-8 w-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To revolutionize the room rental experience in Nepal by creating a transparent, secure, and efficient platform
                  that connects tenants with quality accommodations and helps landlords find reliable tenants.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={fadeItem} whileHover={{ y: -6, scale: 1.01, boxShadow: "0 16px 36px rgba(0,0,0,0.12)" }}>
              <Card className="p-8 rounded-xl shadow-sm border-border cursor-pointer">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/20 rounded-full mb-6">
                  <Award className="h-8 w-8 text-teal-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To become Nepal's most trusted and comprehensive room rental platform, expanding from Kathmandu to serve
                  the entire country and setting new standards for rental experiences.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">Principles that guide everything we do</p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={listContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  variants={fadeItem}
                  whileHover={{ y: -6, scale: 1.02, boxShadow: "0 16px 36px rgba(0,0,0,0.12)" }}
                  className="cursor-pointer"
                >
                  <Card className="p-6 text-center rounded-xl shadow-sm border-border">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-6">
                      <Icon className="h-8 w-8 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Team</h2>
            <p className="text-xl text-muted-foreground">The passionate people behind KhojDu</p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={listContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeItem}
                whileHover={{ y: -6, scale: 1.02, boxShadow: "0 16px 36px rgba(0,0,0,0.12)" }}
                className="cursor-pointer"
              >
                <Card className="p-6 rounded-xl shadow-sm border-border bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
                  <CardContent className="p-0 space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-teal-500 blur-2xl opacity-50" />
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto object-cover relative z-10"
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
                      <p className="text-orange-500 font-medium">{member.role}</p>
                      <p className="text-muted-foreground leading-relaxed text-sm">{member.bio}</p>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <a href={member.github} target="_blank" rel="noreferrer" className="text-teal-600 hover:text-teal-700 underline underline-offset-4">
                        GitHub
                      </a>
                      <span className="text-muted-foreground">•</span>
                      <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-teal-600 hover:text-teal-700 underline underline-offset-4">
                        LinkedIn
                      </a>
                      <span className="text-muted-foreground">•</span>
                      <a href={member.website} target="_blank" rel="noreferrer" className="text-teal-600 hover:text-teal-700 underline underline-offset-4">
                        Website
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
