"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Message sent successfully! We'll get back to you soon.")
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-background dark:from-orange-950/20 dark:to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Get in <span className="text-orange-500">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Have questions about  <span className="text-1xl text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
                KhojDu
              </span> ? Need help finding a room or listing your property? We're here to help you every
            step of the way.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="rounded-xl shadow-sm border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Visit Us</h3>
                    <p className="text-muted-foreground">Thamel, Kathmandu, Nepal</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our office is located in the heart of Thamel, easily accessible by public transport.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Call Us</h3>
                    <p className="text-muted-foreground">+977 9841234567</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Available Monday to Friday, 9 AM to 6 PM NPT</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email Us</h3>
                    <p className="text-muted-foreground">hello@khojdu.com.np</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Business Hours</h3>
                    <p className="text-muted-foreground">Mon - Fri: 9 AM - 6 PM</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Saturday: 10 AM - 4 PM
                  <br />
                  Sunday: Closed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl shadow-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-6 w-6 text-orange-500" />
                  <span className="text-foreground">Send us a Message</span>
                </CardTitle>
                <p className="text-muted-foreground">Fill out the form below and we'll get back to you as soon as possible.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-foreground">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Your full name"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+977 98XXXXXXXX"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">Subject *</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => handleChange("subject", value)}
                        required
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="tenant-support">Tenant Support</SelectItem>
                          <SelectItem value="landlord-support">Landlord Support</SelectItem>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-foreground">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      required
                      className="mt-1 resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg py-3">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-xl shadow-sm border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">How do I list my property?</h3>
                <p className="text-muted-foreground">
                  Simply sign up as a landlord, complete your profile verification, and use our easy listing form to add
                  your property details and photos.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Is KhojDu free to use?</h3>
                <p className="text-muted-foreground">
                  Yes! Browsing and contacting landlords is completely free for tenants. Landlords pay a small fee only
                  when they successfully rent their property.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">How are landlords verified?</h3>
                <p className="text-muted-foreground">
                  We verify landlords through document verification, property ownership proof, and phone number
                  confirmation to ensure authenticity.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">What areas do you cover?</h3>
                <p className="text-muted-foreground">
                  Currently, we cover all major areas in Kathmandu valley including Kathmandu, Lalitpur, and Bhaktapur
                  districts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
