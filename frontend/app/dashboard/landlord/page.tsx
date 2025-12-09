"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Plus,
    MessageSquare,
    Edit,
    Trash2,
    Eye,
    MapPin,
    Menu,
    X,
    Star,
    TrendingUp,
    Home,
    BarChart3,
    ClipboardList,
    LogOut,
    User, SignalZero,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { UserRole } from "@/types/auth"
import { getDashboardRouteForRole } from "@/lib/utils"
import { fetchLandlordProperties, LandlordProperty } from "@/services/dashboardService"
import { deleteProperty, togglePropertyAvailability } from "@/services/propertyService"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"
import { Spinner } from "@/components/ui/spinner"
import { motion } from "framer-motion"

export default function LandlordDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [properties, setProperties] = useState<LandlordProperty[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [propertiesPage, setPropertiesPage] = useState(0)
  const [propertiesHasMore, setPropertiesHasMore] = useState(false)
  const [propertiesLoadingMore, setPropertiesLoadingMore] = useState(false)
  const [isMutating, setIsMutating] = useState<string | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } }
  const stagger = { show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }
  const cardHover = { whileHover: { y: -4, scale: 1.01, transition: { duration: 0.16 } } }
  const handleLogout = async () => {
    if (!showLogoutConfirm) {
      setShowLogoutConfirm(true)
      return
    }
    try {
      await logout()
      router.replace("/auth/login")
    } catch (err) {
      console.error("[Dashboard] Logout failed", err)
    }
  }

  // Protect the dashboard - redirect if not authenticated
  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      console.log('[Dashboard] User not authenticated, redirecting to login')
      router.replace('/auth/login?redirect=/dashboard/landlord')
      return
    }

    if (user && user.role !== UserRole.LANDLORD) {
      const target = getDashboardRouteForRole(user.role)
      router.replace(target)
    }
  }, [isAuthenticated, isLoading, router, user])

  useEffect(() => {
    if (!isAuthenticated) return
    loadProperties(0, false)
  }, [isAuthenticated])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size={40} />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated || !user || user.role !== UserRole.LANDLORD) {
    return null
  }

  const derivedStats = [
    { title: "Total Properties", value: properties.length.toString(), change: "", icon: Search },
    {
      title: "Active Listings",
      value: properties.filter((p) => p.status?.toLowerCase() === "approved" || p.status?.toLowerCase() === "active").length.toString(),
      change: "",
      icon: Eye,
    },
    {
      title: "Messages",
      value: properties.reduce((acc, p) => acc + (p.messages ?? 0), 0).toString(),
      change: "",
      icon: MessageSquare,
    },
    {
      title: "Views",
      value: properties.reduce((acc, p) => acc + (p.views ?? 0), 0).toString(),
      change: "",
      icon: Star,
    },
  ]

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-3 w-3 ${star <= rating ? "text-yellow-400 fill-current" : "text-muted"}`} />
        ))}
      </div>
    )
  }

  const handleToggleAvailability = async (propertyId: string) => {
    setIsMutating(propertyId)
    try {
      await togglePropertyAvailability(propertyId)
      toast.success("Availability updated")
      // refresh list first page
      loadProperties(0, false)
    } catch (err) {
      console.error("[LandlordDashboard] Toggle availability failed", err)
      toast.error("Could not update availability.")
    } finally {
      setIsMutating(null)
    }
  }

  const handleDelete = async (propertyId: string) => {
    const confirm = window.confirm("Delete this listing? This cannot be undone.")
    if (!confirm) return
    setIsMutating(propertyId)
    try {
      await deleteProperty(propertyId)
      toast.success("Listing deleted")
      setProperties((prev) => prev.filter((p) => p.id !== propertyId))
    } catch (err) {
      console.error("[LandlordDashboard] Delete failed", err)
      toast.error("Could not delete listing.")
    } finally {
      setIsMutating(null)
    }
  }

  const loadProperties = async (page = 0, append = false) => {
    append ? setPropertiesLoadingMore(true) : setIsFetching(true)
    try {
      const resp = await fetchLandlordProperties({ page, size: 10 })
      setProperties((prev) => (append ? [...prev, ...(resp?.content || [])] : resp?.content || []))
      setPropertiesPage(page)
      const totalElements = resp?.totalElements ?? resp?.content?.length ?? 0
      const totalPages =
        resp?.totalPages ?? (resp?.size ? Math.ceil(totalElements / resp.size) : Math.ceil(totalElements / 10))
      setPropertiesHasMore(page + 1 < (totalPages || 0))
      setFetchError(null)
    } catch (err) {
      console.error("[LandlordDashboard] Failed to load properties", err)
      setFetchError("Could not load your listings right now.")
      setPropertiesHasMore(false)
    } finally {
      append ? setPropertiesLoadingMore(false) : setIsFetching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-gray-900/80 border-r border-orange-100/60 dark:border-gray-800/60 backdrop-blur-xl transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 transition-transform duration-200 ease-in-out shadow-xl`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>
                    KhojDu
                  </span>
                  <span className="text-xs text-foreground font-bold tracking-wider" style={{ fontFamily: 'var(--font-delius)' }}>
                    LANDLORD
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab("overview")
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "overview"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-muted-foreground hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-foreground"
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "listings"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-muted-foreground hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-foreground"
                  }`}
              >
                <ClipboardList className="h-5 w-5" />
                <span>My Listings</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("reviews")
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "reviews"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-muted-foreground hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-foreground"
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "messages"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-muted-foreground hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-foreground"
                  }`}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
                <Badge variant="secondary" className="ml-auto bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs">
                  5
                </Badge>
              </button>

              <button
                onClick={() => {
                  router.push("/profile")
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors text-muted-foreground hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-foreground"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-5 w-5 text-red-600" />
                <span className="text-red-600 font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-border max-w-sm w-full p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <LogOut className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">Log out?</h3>
                  <p className="text-sm text-muted-foreground">
                    You will need to sign in again to access your landlord dashboard.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleLogout}>
                  Log out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Intro banner */}
          <div className="container-responsive py-6 lg:py-8">
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <Card className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-orange-100 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-orange-500 font-medium">Landlord Space</p>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold text-foreground">Manage your listings effortlessly</h1>
                      <Badge variant="outline" className="border-orange-400 text-orange-600">
                        {user?.role || UserRole.LANDLORD}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">Track performance, respond to tenants, and keep your properties updated.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/dashboard/create">
                      <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                        <Plus className="h-4 w-4 mr-2" /> Add listing
                      </Button>
                    </Link>
                    <Link href="/messages">
                      <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                        <MessageSquare className="h-4 w-4 mr-2" /> Messages
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

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
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  {derivedStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <motion.div key={stat.title} variants={fadeUp} {...cardHover}>
                        <Card className="rounded-xl shadow-sm bg-white/85 dark:bg-gray-900/70 backdrop-blur-xl border border-white/30">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                {stat.change && <p className="text-sm text-green-600 dark:text-green-400">{stat.change}</p>}
                              </div>
                              <Icon className="h-8 w-8 text-orange-600" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>

                {/* Quick snapshot */}
                <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" animate="show">
                  <motion.div variants={fadeUp} {...cardHover}>
                    <Card className="rounded-2xl border-orange-100/60 dark:border-gray-800/60 shadow-sm bg-white/85 dark:bg-gray-900/70 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-orange-500" /> Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Views this month</span>
                          <span className="text-lg font-semibold text-foreground">
                            {derivedStats[3]?.value || "0"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Avg. rating</span>
                          <span className="flex items-center gap-1 font-semibold text-foreground">
                            0.0 <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Responses</span>
                          <span className="text-lg font-semibold text-foreground">92%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div variants={fadeUp} {...cardHover}>
                    <Card className="rounded-2xl border-orange-100/60 dark:border-gray-800/60 shadow-sm bg-white/85 dark:bg-gray-900/70 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Home className="h-5 w-5 text-orange-500" /> Active listings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {properties.slice(0, 3).map((listing) => (
                          <div key={listing.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-semibold">
                                {listing.title.slice(0, 1)}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground truncate max-w-[160px]">{listing.title}</p>
                                <p className="text-xs text-muted-foreground">{listing.location}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {listing.status || "Active"}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div variants={fadeUp} {...cardHover}>
                    <Card className="rounded-2xl border-orange-100/60 dark:border-gray-800/60 shadow-sm bg-white/85 dark:bg-gray-900/70 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-orange-500" /> Recent reviews
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">No recent reviews available.</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
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

                {fetchError && (
                  <div className="text-sm text-red-600 mb-4">{fetchError}</div>
                )}

                {isFetching && (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size={32} />
                  </div>
                )}

                {!isFetching && properties.length === 0 && (
                  <div className="text-center text-muted-foreground border border-dashed border-border rounded-xl py-10">
                    No listings yet. Create your first property to see it here.
                  </div>
                )}

                <div className="grid gap-6">
                  {(isFetching ? [] : properties).map((listing) => {
                    const locationLabel =
                      listing.location ||
                      [listing.address, listing.city, listing.district].filter(Boolean).join(", ") ||
                      "Not specified"
                    const displayLocation = locationLabel.split(",").slice(0, 3).map((part) => part.trim()).filter(Boolean).join(", ")
                    const isActive = listing.isAvailable ?? listing.status?.toLowerCase() === "active"

                    return (
                      <motion.div key={listing.id} variants={fadeUp} {...cardHover}>
                      <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all bg-card backdrop-blur-xl border border-white/20">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            <img
                              src={listing.image || listing.primaryImageUrl || "/placeholder.svg"}
                              alt={listing.title}
                              loading="lazy"
                              className="w-full lg:w-48 h-32 object-cover rounded-lg"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-xl font-semibold text-foreground truncate">{listing.title}</h3>
                                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                      <span className="truncate max-w-[240px]" title={locationLabel}>
                                        {displayLocation || "Not specified"}
                                      </span>
                                    </span>
                                    <Badge
                                      variant={isActive ? "default" : "secondary"}
                                      className={`w-fit text-xs ${isActive ? "bg-green-100 text-green-800" : ""}`}
                                    >
                                      {isActive ? "Active" : listing.status || "Inactive"}
                                    </Badge>
                                  </div>
                                  {/* Rating and Reviews */}
                                  <div className="flex items-center space-x-2 mt-2">
                                    {renderStars(listing.rating || 0)}
                                    <span className="text-sm font-medium text-foreground">{listing.rating || "N/A"}</span>
                                    <span className="text-sm text-muted-foreground">({listing.totalReviews || 0} reviews)</span>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    asChild
                                    size="icon"
                                    variant="ghost"
                                    className="text-blue-700 hover:bg-blue-50"
                                    aria-label="Edit listing"
                                    disabled={isMutating === listing.id}
                                  >
                                    <Link href={`/dashboard/create?id=${listing.id}`}>
                                      <Edit className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(listing.id)}
                                    disabled={isMutating === listing.id}
                                    aria-label="Delete listing"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                                <div>
                                  <span className="block text-lg font-bold text-orange-600">
                                    Rs {(listing.monthlyRent || 0).toLocaleString()}
                                  </span>
                                  <span>per month</span>
                                </div>
                                <div>
                                  <span className="flex items-center">
                                    <Eye className="h-4 w-4 mr-1" />
                                    {listing.views ?? listing.viewCount ?? 0}
                                  </span>
                                  <span>views</span>
                                </div>
                                <div>
                                  <span className="flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    {listing.messages ?? listing.inquiryCount ?? 0}
                                  </span>
                                  <span>messages</span>
                                </div>
                                <div>
                                  <span className="text-green-600 font-medium">{listing.occupancyRate ?? 0}%</span>
                                  <span>occupancy</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <Button asChild variant="secondary" size="sm" className="rounded-lg">
                                  <Link href={`/listing/${listing.id}`}>View details</Link>
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="rounded-lg"
                                  variant={isActive ? "outline" : "default"}
                                  onClick={() => handleToggleAvailability(listing.id)}
                                  disabled={isMutating === listing.id}
                                >
                                  {isActive ? "Deactivate" : "Activate"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      </motion.div>
                    )
                  })}
                </div>
                {propertiesHasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => loadProperties(propertiesPage + 1, true)}
                      disabled={propertiesLoadingMore}
                      className="min-w-[160px]"
                    >
                      {propertiesLoadingMore ? <Spinner size={18} /> : "Load more"}
                    </Button>
                  </div>
                )}
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
                    <p className="text-sm text-muted-foreground">No recent reviews available.</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-8">Messages</h1>
                <Card className="rounded-xl shadow-sm border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950/10">
                  <CardHeader>
                    <CardTitle className="text-xl">Messaging unavailable</CardTitle>
                    <p className="text-muted-foreground">Messaging is temporarily disabled across the platform.</p>
                  </CardHeader>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
