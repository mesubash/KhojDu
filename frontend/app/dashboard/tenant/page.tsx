"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { UserRole } from "@/types/auth"
import { getDashboardRouteForRole } from "@/lib/utils"
import { Calendar, CheckCircle, Clock, Home, MapPin, MessageSquare, Search, Star } from "lucide-react"
import Link from "next/link"

const savedHomes = [
  {
    id: 1,
    title: "Sunny Studio in Jhamsikhel",
    location: "Lalitpur",
    rent: 18000,
    moveIn: "Ready now",
    rating: 4.7,
    landlord: "Mina Shrestha",
  },
  {
    id: 2,
    title: "2BHK near Patan Durbar",
    location: "Patan",
    rent: 26000,
    moveIn: "Jan 10",
    rating: 4.5,
    landlord: "Krishna Koirala",
  },
]

const upcomingVisits = [
  {
    id: 1,
    title: "Modern Flat in Baneshwor",
    date: "Dec 12, 3:00 PM",
    contact: "Suman Gurung",
    status: "Confirmed",
  },
  {
    id: 2,
    title: "Room near TU, Kirtipur",
    date: "Dec 14, 11:00 AM",
    contact: "Bishal Tamang",
    status: "Pending",
  },
]

const applications = [
  { id: 1, title: "Cozy Room in Thamel", status: "Under Review", submitted: "Dec 3" },
  { id: 2, title: "Shared Flat in Kalanki", status: "Approved", submitted: "Dec 1" },
]

export default function TenantDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<"overview" | "saved" | "visits">("overview")

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace("/auth/login?redirect=/dashboard/tenant")
      return
    }

    if (user && user.role !== UserRole.TENANT) {
      router.replace(getDashboardRouteForRole(user.role))
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.role !== UserRole.TENANT) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header hideNavigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back, {user.fullName}</p>
            <h1 className="text-3xl font-bold text-foreground">Tenant Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50" asChild>
              <Link href="/search">
                <Search className="h-4 w-4 mr-2" /> Find new listings
              </Link>
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
              <Link href="/messages">
                <MessageSquare className="h-4 w-4 mr-2" /> Messages
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "overview", label: "Overview" },
            { id: "saved", label: "Saved Homes" },
            { id: "visits", label: "Visits & Applications" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={activeTab === tab.id ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="rounded-xl">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Saved homes</p>
                      <p className="text-2xl font-bold text-foreground">{savedHomes.length}</p>
                    </div>
                    <Home className="h-8 w-8 text-orange-500" />
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Upcoming visits</p>
                      <p className="text-2xl font-bold text-foreground">{upcomingVisits.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Applications</p>
                      <p className="text-2xl font-bold text-foreground">{applications.length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average rating</p>
                      <p className="text-2xl font-bold text-foreground">4.6</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Recommended for you</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {savedHomes.map((home) => (
                    <div key={home.id} className="flex items-start justify-between gap-4 border border-border rounded-lg p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{home.title}</h3>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {home.moveIn}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" /> {home.location}
                        </p>
                        <div className="flex items-center gap-2 text-sm mt-2">
                          <span className="font-semibold text-orange-600">Rs {home.rent.toLocaleString()}</span>
                          <span className="text-muted-foreground">/month</span>
                          <span className="flex items-center text-yellow-600 text-sm">
                            <Star className="h-4 w-4 mr-1 fill-yellow-400" /> {home.rating}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Listed by {home.landlord}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                          View details
                        </Button>
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                          Schedule visit
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming visits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingVisits.map((visit) => (
                    <div key={visit.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground">{visit.title}</p>
                        <Badge
                          variant="secondary"
                          className={visit.status === "Confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {visit.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {visit.date}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" /> Contact: {visit.contact}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Applications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                      <div>
                        <p className="font-medium text-foreground">{application.title}</p>
                        <p className="text-xs text-muted-foreground">Submitted on {application.submitted}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          application.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" /> Book a new visit
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" /> See recent messages
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" /> Rate a recent stay
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            {savedHomes.map((home) => (
              <Card key={home.id} className="rounded-xl">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{home.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {home.location}
                    </p>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="font-semibold text-orange-600">Rs {home.rent.toLocaleString()}</span>
                      <span className="text-muted-foreground">/month</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {home.moveIn}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                      View
                    </Button>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                      Schedule visit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "visits" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming visits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingVisits.map((visit) => (
                  <div key={visit.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{visit.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> {visit.date}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" /> {visit.contact}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={visit.status === "Confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {visit.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {applications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                    <div>
                      <p className="font-medium text-foreground">{application.title}</p>
                      <p className="text-xs text-muted-foreground">Submitted on {application.submitted}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        application.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {application.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
