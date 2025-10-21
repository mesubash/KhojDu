"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MessageSquare, LogOut, Edit, Trash2, Eye, MapPin, Menu, X, Star, TrendingUp } from "lucide-react"
import { Header } from "@/components/header"
import Link from "next/link"

const mockListings = [
  {
    id: 1,
    title: "Cozy Room in Thamel",
    type: "Room",
    rent: 15000,
    deposit: 30000,
    location: "Thamel, Kathmandu",
    status: "Active",
    views: 245,
    messages: 8,
    image: "/placeholder.svg?height=150&width=200",
    rating: 4.6,
    totalReviews: 18,
    occupancyRate: 95,
    lastBooked: "2024-03-01",
  },
  {
    id: 2,
    title: "Spacious Flat in Baneshwor",
    type: "Flat",
    rent: 25000,
    deposit: 50000,
    location: "Baneshwor, Kathmandu",
    status: "Active",
    views: 189,
    messages: 5,
    image: "/placeholder.svg?height=150&width=200",
    rating: 4.3,
    totalReviews: 12,
    occupancyRate: 88,
    lastBooked: "2024-02-15",
  },
]

const mockReviews = [
  {
    id: 1,
    propertyTitle: "Cozy Room in Thamel",
    tenant: {
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "PS",
    },
    rating: 5,
    date: "2024-02-15",
    review: "Excellent room with all promised amenities. Very responsive landlord. Highly recommended!",
    stayDuration: "6 months",
  },
  {
    id: 2,
    propertyTitle: "Spacious Flat in Baneshwor",
    tenant: {
      name: "Amit Thapa",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AT",
    },
    rating: 4,
    date: "2024-01-20",
    review: "Good property in prime location. Landlord is cooperative and maintains the property well.",
    stayDuration: "3 months",
  },
]

const mockStats = [
  { title: "Total Properties", value: "2", change: "+1 this month", icon: Search },
  { title: "Total Views", value: "434", change: "+23% this month", icon: Eye },
  { title: "Messages", value: "13", change: "5 unread", icon: MessageSquare },
  { title: "Average Rating", value: "4.5", change: "Based on 30 reviews", icon: Star },
]

export default function LandlordDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-3 w-3 ${star <= rating ? "text-yellow-400 fill-current" : "text-muted"}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Header - for profile, theme, and logout */}
      <Header 
        isAuthenticated={true} 
        userInfo={{
          name: "Landlord User",
          email: "landlord@example.com",
          avatar: "/placeholder.svg",
          initials: "LU"
        }}
        hideNavigation={true}
      />
      
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 transition-transform duration-200 ease-in-out`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
                    KhojDu
                  </span>
                  <span className="text-xs text-foreground font-bold tracking-wider" style={{ fontFamily: 'var(--font-delius)' }}>
                    DASHBOARD
                  </span>
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab("overview")
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "overview"
                    ? "bg-orange-500 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("listings")
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "listings"
                    ? "bg-orange-500 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Search className="h-5 w-5" />
                <span>My Listings</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("reviews")
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "reviews"
                    ? "bg-orange-500 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Star className="h-5 w-5" />
                <span>Reviews</span>
              </button>

              <Link href="/dashboard/create">
                <button
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Plus className="h-5 w-5" />
                  <span>Add New</span>
                </button>
              </Link>

              <button
                onClick={() => {
                  setActiveTab("messages")
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "messages"
                    ? "bg-orange-500 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
                <Badge variant="secondary" className="ml-auto bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs">
                  5
                </Badge>
              </button>

              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-card border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
              <div className="w-10" />
            </div>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                  <p className="text-muted-foreground">Track your property performance and tenant feedback</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mockStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (                        <Card key={index} className="rounded-xl shadow-sm">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                <p className="text-sm text-green-600 dark:text-green-400">{stat.change}</p>
                              </div>
                            <Icon className="h-8 w-8 text-orange-600" />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="rounded-xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl">Recent Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockReviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="flex items-start space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={review.tenant.avatar || "/placeholder.svg"} alt={review.tenant.name} />
                              <AvatarFallback className="text-xs">{review.tenant.initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                {renderStars(review.rating)}
                                <span className="text-sm font-medium text-foreground">{review.tenant.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">{review.propertyTitle}</p>
                              <p className="text-sm text-foreground line-clamp-2">{review.review}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl">Property Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockListings.map((listing) => (
                          <div key={listing.id} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{listing.title}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {renderStars(listing.rating)}
                                <span className="text-xs text-muted-foreground">
                                  {listing.rating} ({listing.totalReviews} reviews)
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-green-600">{listing.occupancyRate}% occupied</p>
                              <p className="text-xs text-muted-foreground">{listing.views} views</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Listings Tab */}
            {activeTab === "listings" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
                    <p className="text-muted-foreground">Manage your property listings and performance</p>
                  </div>
                  <Link href="/dashboard/create">
                    <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Listing
                    </Button>
                  </Link>
                </div>

                <div className="grid gap-6">
                  {mockListings.map((listing) => (
                    <Card key={listing.id} className="rounded-xl shadow-sm hover:shadow-md transition-shadow bg-card">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <img
                            src={listing.image || "/placeholder.svg"}
                            alt={listing.title}
                            className="w-full lg:w-48 h-32 object-cover rounded-lg"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-xl font-semibold text-foreground truncate">{listing.title}</h3>
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <span className="truncate">{listing.location}</span>
                                  </span>
                                  <Badge
                                    variant={listing.status === "Active" ? "default" : "secondary"}
                                    className={`w-fit text-xs ${listing.status === "Active" ? "bg-green-100 text-green-800" : ""}`}
                                  >
                                    {listing.status}
                                  </Badge>
                                </div>
                                {/* Rating and Reviews */}
                                <div className="flex items-center space-x-2 mt-2">
                                  {renderStars(listing.rating)}
                                  <span className="text-sm font-medium text-foreground">{listing.rating}</span>
                                  <span className="text-sm text-muted-foreground">({listing.totalReviews} reviews)</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                              <div>
                                <span className="block text-lg font-bold text-orange-600">
                                  Rs {listing.rent.toLocaleString()}
                                </span>
                                <span>per month</span>
                              </div>
                              <div>
                                <span className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  {listing.views}
                                </span>
                                <span>views</span>
                              </div>
                              <div>
                                <span className="flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  {listing.messages}
                                </span>
                                <span>messages</span>
                              </div>
                              <div>
                                <span className="text-green-600 font-medium">{listing.occupancyRate}%</span>
                                <span>occupancy</span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                              <Link href={`/listing/${listing.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full sm:w-auto border-border bg-transparent"
                                >
                                  View Details
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                              >
                                Promote
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Reviews & Ratings</h1>
                  <p className="text-muted-foreground">Feedback from your tenants</p>
                </div>

                {/* Rating Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-foreground mb-2">4.5</div>
                      {renderStars(4.5)}
                      <p className="text-muted-foreground mt-2">Overall Rating</p>
                      <p className="text-sm text-muted-foreground/70">Based on 30 reviews</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">93%</div>
                      <p className="text-muted-foreground">Positive Reviews</p>
                      <p className="text-sm text-muted-foreground/70">4+ star ratings</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">30</div>
                      <p className="text-muted-foreground">Total Reviews</p>
                      <p className="text-sm text-muted-foreground/70">Across all properties</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Reviews List */}
                <Card className="rounded-xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {mockReviews.map((review) => (
                        <div key={review.id} className="border-b border-border pb-6 last:border-b-0 dark:border-gray-800">
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={review.tenant.avatar || "/placeholder.svg"} alt={review.tenant.name} />
                              <AvatarFallback>{review.tenant.initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-foreground">{review.tenant.name}</h4>
                                  <p className="text-sm text-orange-600">{review.propertyTitle}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {renderStars(review.rating)}
                                    <span className="text-sm text-muted-foreground">Stayed for {review.stayDuration}</span>
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">{review.date}</div>
                              </div>
                              <p className="text-foreground leading-relaxed">{review.review}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-8">Messages</h1>
                <Card className="rounded-xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Recent Conversations</CardTitle>
                    <p className="text-muted-foreground">Messages from potential and current tenants</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer dark:hover:bg-muted/20"
                        >
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            U{i}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-foreground">User {i}</h4>
                              <span className="text-sm text-muted-foreground">2h ago</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              Interested in your {i === 1 ? "Thamel" : i === 2 ? "Baneshwor" : "Dhulikhel"} property...
                            </p>
                          </div>
                          <Badge className="bg-red-100 text-red-800 text-xs">New</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
