"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { UserRole } from "@/types/auth"
import { getDashboardRouteForRole } from "@/lib/utils"
import { AlertTriangle, Calendar, CheckCircle, Clock, Flag, Home, MapPin, MessageSquare, Search, Star } from "lucide-react"
import Link from "next/link"
import { fetchTenantInquiries, fetchWishlist, InquiryItem, WishlistItem } from "@/services/dashboardService"
import { searchProperties, fetchProperty } from "@/services/propertyService"
import type { PropertyListItem } from "@/types/property"
import { toast } from "sonner"
import { fetchTenantDashboard } from "@/services/tenantService"
import { Spinner } from "@/components/ui/spinner"
import { motion } from "framer-motion"
import { fetchMyComplaints } from "@/services/complaintService"
import type { Complaint } from "@/types/complaint"

export default function TenantDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<"overview" | "saved" | "visits" | "complaints">("overview")
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [inquiries, setInquiries] = useState<InquiryItem[]>([])
  const [recommended, setRecommended] = useState<PropertyListItem[]>([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [inquiryCount, setInquiryCount] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [wishlistLoadingMore, setWishlistLoadingMore] = useState(false)
  const [inquiryLoadingMore, setInquiryLoadingMore] = useState(false)
  const [complaintsLoading, setComplaintsLoading] = useState(false)
  const [complaintsLoadingMore, setComplaintsLoadingMore] = useState(false)
  const [wishlistPage, setWishlistPage] = useState(0)
  const [inquiryPage, setInquiryPage] = useState(0)
  const [complaintsPage, setComplaintsPage] = useState(0)
  const [wishlistHasMore, setWishlistHasMore] = useState(true)
  const [inquiryHasMore, setInquiryHasMore] = useState(true)
  const [complaintsHasMore, setComplaintsHasMore] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [complaintsError, setComplaintsError] = useState<string | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const pageSize = 5
  const listContainer = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }
  const fadeItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  }
  const openWhatsAppMessage = (text: string, phone?: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    const message = text.replace("{origin}", origin)
    const digits = phone ? phone.replace(/\D/g, "") : ""
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  const openWhatsAppForProperty = async (propertyId: string, messageTemplate: string, fallbackTitle?: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    try {
      const detail = await fetchProperty(propertyId)
      const title = detail.title || fallbackTitle || "your property"
      const text = messageTemplate
        .replace("{title}", title)
        .replace("{link}", `${origin}/listing/${propertyId}`)
        .replace("{origin}", origin)
      openWhatsAppMessage(text, detail.landlord?.phone)
    } catch (err) {
      console.error("[TenantDashboard] Failed to fetch property for WhatsApp", err)
      toast.error("Could not open WhatsApp, please try again.")
    }
  }

  const loadWishlist = useCallback(
    async (page = 0, append = false) => {
      setWishlistLoadingMore(true)
      try {
        const resp = await fetchWishlist({ page, size: pageSize })
        setWishlist((prev) => (append ? [...prev, ...(resp?.content || [])] : resp?.content || []))
        setWishlistPage(page)
        const totalPages = resp?.totalPages ?? (resp?.totalElements != null ? Math.ceil(resp.totalElements / pageSize) : undefined)
        const last = totalPages ? page + 1 >= totalPages : (resp?.content?.length || 0) < pageSize
        setWishlistHasMore(!last)
        if (resp?.totalElements !== undefined) {
          setWishlistCount(resp.totalElements)
        }
      } catch (err) {
        console.error("[TenantDashboard] Failed to load wishlist", err)
        toast.error("Could not load saved homes.")
        setWishlistHasMore(false)
      } finally {
        setWishlistLoadingMore(false)
      }
    },
    [pageSize],
  )

  const loadInquiries = useCallback(
    async (page = 0, append = false) => {
      setInquiryLoadingMore(true)
      try {
        const resp = await fetchTenantInquiries({ page, size: pageSize })
        setInquiries((prev) => (append ? [...prev, ...(resp?.content || [])] : resp?.content || []))
        setInquiryPage(page)
        const totalPages = resp?.totalPages ?? (resp?.totalElements != null ? Math.ceil(resp.totalElements / pageSize) : undefined)
        const last = totalPages ? page + 1 >= totalPages : (resp?.content?.length || 0) < pageSize
        setInquiryHasMore(!last)
        if (resp?.totalElements !== undefined) {
          setInquiryCount(resp.totalElements)
        }
      } catch (err) {
        console.error("[TenantDashboard] Failed to load inquiries", err)
        toast.error("Could not load visits/applications.")
        setInquiryHasMore(false)
      } finally {
        setInquiryLoadingMore(false)
      }
    },
    [pageSize],
  )

  const loadComplaints = useCallback(
    async (page = 0, append = false) => {
      if (append) {
        setComplaintsLoadingMore(true)
      } else {
        setComplaintsLoading(true)
      }
      try {
        const resp = await fetchMyComplaints({ page, size: pageSize })
        setComplaints((prev) => (append ? [...prev, ...(resp?.content || [])] : resp?.content || []))
        setComplaintsPage(page)
        const totalPages =
          resp?.totalPages ?? (resp?.totalElements != null ? Math.ceil(resp.totalElements / pageSize) : undefined)
        const last = totalPages ? page + 1 >= totalPages : (resp?.content?.length || 0) < pageSize
        setComplaintsHasMore(!last)
        setComplaintsError(null)
      } catch (err) {
        console.error("[TenantDashboard] Failed to load complaints", err)
        setComplaintsError("Could not load your complaints.")
        setComplaintsHasMore(false)
      } finally {
        setComplaintsLoading(false)
        setComplaintsLoadingMore(false)
      }
    },
    [pageSize],
  )

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

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== UserRole.TENANT) return

    setIsFetching(true)
    Promise.all([
      fetchTenantDashboard(),
      searchProperties({ page: 0, size: 6, sortBy: "createdAt", sortDirection: "DESC" }),
      loadWishlist(0, false),
      loadInquiries(0, false),
    ])
      .then(([dashboardResp, recommendedResp]) => {
        setWishlistCount((prev) => dashboardResp?.wishlistCount ?? prev)
        setInquiryCount((prev) => dashboardResp?.inquiryCount ?? prev)
        if (dashboardResp?.recentWishlist?.length) {
          setRecommended(dashboardResp.recentWishlist as PropertyListItem[])
        } else {
          setRecommended(recommendedResp?.content || [])
        }
        setFetchError(null)
      })
      .catch((err) => {
        console.error("[TenantDashboard] Failed to load data", err)
        setFetchError("Could not load your dashboard data right now.")
        toast.error("Failed to load some dashboard data.")
      })
      .finally(() => setIsFetching(false))
  }, [isAuthenticated, loadInquiries, loadWishlist, user])

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== UserRole.TENANT) return
    if (activeTab === "complaints" && complaints.length === 0 && !complaintsLoading) {
      loadComplaints(0, false)
    }
  }, [activeTab, complaints.length, complaintsLoading, isAuthenticated, loadComplaints, user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size={40} />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.role !== UserRole.TENANT) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      <div className="container-responsive py-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-orange-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm cursor-default"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-orange-500 font-medium">Tenant Space</p>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.fullName}</h1>
              <p className="text-muted-foreground">Keep track of saved homes, visits, and conversations.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50" asChild>
                <Link href="/search">
                  <Search className="h-4 w-4 mr-2" /> Find new listings
                </Link>
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                <Link href="/search">
                  <MessageSquare className="h-4 w-4 mr-2" /> Chat via WhatsApp
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "overview", label: "Overview" },
            { id: "saved", label: "Saved Homes" },
            { id: "visits", label: "Visits & Applications" },
            { id: "complaints", label: "Complaints" },
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
              <motion.div variants={listContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Saved homes", value: wishlistCount || wishlist.length, icon: <Home className="h-8 w-8 text-orange-500" /> },
                  { label: "Upcoming visits", value: inquiryCount || inquiries.length, icon: <Calendar className="h-8 w-8 text-blue-500" /> },
                  { label: "Applications", value: inquiries.length, icon: <CheckCircle className="h-8 w-8 text-green-500" /> },
                  { label: "Average rating", value: "4.6", icon: <Star className="h-8 w-8 text-yellow-500" /> },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    variants={fadeItem}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.18 }}
                    className="cursor-pointer"
                  >
                    <Card className="rounded-xl bg-white/80 dark:bg-gray-900/60 backdrop-blur border border-orange-100/60 dark:border-gray-800/80 shadow-sm">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          <p className="text-2xl font-bold text-foreground">{item.value}</p>
                        </div>
                        {item.icon}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Recommended for you</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fetchError && <div className="text-sm text-red-600">{fetchError}</div>}
                  {isFetching && (
                    <div className="flex items-center justify-center py-6">
                      <Spinner />
                    </div>
                  )}
                  {(!isFetching && recommended.length === 0) && (
                    <p className="text-sm text-muted-foreground">No recommendations yet. Try saving homes to get better picks.</p>
                  )}
                  <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                    {(isFetching ? [] : recommended).map((home) => (
                      <motion.div
                        key={home.id}
                        variants={fadeItem}
                        whileHover={{ y: -3, scale: 1.005 }}
                        className="flex items-start justify-between gap-4 border border-border rounded-lg p-4 bg-white/70 dark:bg-gray-900/40 backdrop-blur cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{home.title}</h3>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {home.status || (home.isAvailable ? "Available" : "Unavailable")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" /> {home.city || home.district || home.address || home.location || "Not specified"}
                          </p>
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="font-semibold text-orange-600">Rs {(Number(home.monthlyRent) || 0).toLocaleString()}</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Type: {home.propertyType || "Property"}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button asChild variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                            <Link href={`/listing/${home.id}`}>View details</Link>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() =>
                              openWhatsAppForProperty(
                                home.id,
                                `Hello! I'd like to book a visit for "{title}". Is it available this week? Link: {link}`,
                                home.title,
                              )
                            }
                          >
                            Schedule visit (WhatsApp)
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming visits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isFetching && (
                    <div className="flex items-center justify-center py-4">
                      <Spinner />
                    </div>
                  )}
                  <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                    {(isFetching ? [] : inquiries).map((visit) => (
                      <motion.div
                        key={visit.id}
                        variants={fadeItem}
                        whileHover={{ y: -2, scale: 1.002 }}
                        className="border border-border rounded-lg p-3 bg-white/70 dark:bg-gray-900/40 backdrop-blur cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-foreground">{visit.propertyTitle}</p>
                          <Badge
                            variant="secondary"
                            className={
                              visit.status === "Confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {visit.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> {visit.updatedAt || "Scheduled"}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" /> Last message: {visit.lastMessage || "—"}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Applications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isFetching && (
                    <div className="flex items-center justify-center py-4">
                      <Spinner />
                    </div>
                  )}
                  <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                    {(isFetching ? [] : inquiries).map((application) => (
                      <motion.div
                        key={application.id}
                        variants={fadeItem}
                        whileHover={{ y: -2, scale: 1.002 }}
                        className="flex items-center justify-between border border-border rounded-lg p-3 bg-white/70 dark:bg-gray-900/40 backdrop-blur cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-foreground">{application.propertyTitle}</p>
                          <p className="text-xs text-muted-foreground">Updated on {application.updatedAt || "N/A"}</p>
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
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      openWhatsAppMessage("Hello! I'd like to book a property visit. Can you share available slots?")
                    }
                  >
                    <Calendar className="h-4 w-4 mr-2" /> Book a new visit (WhatsApp)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      openWhatsAppMessage("Hi! Following up on my earlier inquiry. Could you update me on the status?")
                    }
                  >
                    <Clock className="h-4 w-4 mr-2" /> Send follow-up (WhatsApp)
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
          <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-4">
            {(isFetching ? [] : wishlist).map((home) => (
              <motion.div
                key={home.id}
                variants={fadeItem}
                whileHover={{ y: -3, scale: 1.01 }}
                className="cursor-pointer"
              >
                <Card className="rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-orange-100/60 dark:border-gray-800/70">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{home.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {home.city || home.district || home.address || home.location || "Not specified"}
                      </p>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <span className="font-semibold text-orange-600">Rs {(home.rent || 0).toLocaleString()}</span>
                        <span className="text-muted-foreground">/month</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {home.status || "Saved"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50" asChild>
                        <Link href={`/listing/${home.id}`}>View</Link>
                      </Button>
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() =>
                          openWhatsAppForProperty(
                            home.id,
                            `Hi! I'm interested in "{title}". Can we schedule a visit? Link: {link}`,
                            home.title,
                          )
                        }
                      >
                        Schedule visit (WhatsApp)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {wishlistHasMore && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => loadWishlist(wishlistPage + 1, true)}
                  disabled={wishlistLoadingMore}
                  className="min-w-[140px]"
                >
                  {wishlistLoadingMore ? <Spinner size={16} /> : "Load more"}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "visits" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming visits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isFetching && (
                  <div className="flex items-center justify-center py-4">
                    <Spinner />
                  </div>
                )}
                <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                  {(isFetching ? [] : inquiries).map((visit) => (
                    <motion.div
                      key={visit.id}
                      variants={fadeItem}
                      whileHover={{ y: -2, scale: 1.002 }}
                      className="border border-border rounded-lg p-3 space-y-3 bg-white/70 dark:bg-gray-900/40 backdrop-blur cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{visit.propertyTitle}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> {visit.updatedAt || "Scheduled"}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" /> {visit.lastMessage || "—"}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            visit.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {visit.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50" asChild>
                          <Link href={`/listing/${visit.propertyId}`}>View listing</Link>
                        </Button>
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() =>
                            openWhatsAppForProperty(
                              visit.propertyId,
                              `Hi! I'm following up on my visit/inquiry (${visit.id}) for "{title}". Can you confirm the schedule? Link: {link}`,
                              visit.propertyTitle,
                            )
                          }
                        >
                          Message landlord (WhatsApp)
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isFetching && (
                  <div className="flex items-center justify-center py-4">
                    <Spinner />
                  </div>
                )}
                <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                  {(isFetching ? [] : inquiries).map((application) => (
                    <motion.div
                      key={application.id}
                      variants={fadeItem}
                      whileHover={{ y: -2, scale: 1.002 }}
                      className="flex items-center justify-between border border-border rounded-lg p-3 bg-white/70 dark:bg-gray-900/40 backdrop-blur cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-foreground">{application.propertyTitle}</p>
                        <p className="text-xs text-muted-foreground">Updated on {application.updatedAt || "N/A"}</p>
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
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "visits" && inquiryHasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => loadInquiries(inquiryPage + 1, true)}
              disabled={inquiryLoadingMore}
              className="min-w-[160px]"
            >
              {inquiryLoadingMore ? <Spinner size={16} /> : "Load more"}
            </Button>
          </div>
        )}

        {activeTab === "complaints" && (
          <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Track issues you have reported.</p>
                {complaintsError && <p className="text-sm text-red-600">{complaintsError}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/search">
                    <Search className="h-4 w-4 mr-2" /> Find a listing to report
                  </Link>
                </Button>
                <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/search">Browse listings</Link>
                </Button>
              </div>
            </div>

            <Card className="rounded-xl bg-white/80 dark:bg-gray-900/60 backdrop-blur border border-orange-100/60 dark:border-gray-800/80 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" /> Your complaints
                </CardTitle>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {complaints.length} filed
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {complaintsLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Spinner />
                  </div>
                )}
                {!complaintsLoading && complaints.length === 0 && (
                  <p className="text-sm text-muted-foreground px-2">You have not filed any complaints yet.</p>
                )}
                {(complaintsLoading ? [] : complaints).map((complaint) => {
                  const createdAt = complaint.createdAt
                    ? new Date(complaint.createdAt).toLocaleString()
                    : "Recently"
                  const status = complaint.status || "PENDING"
                  const statusClasses =
                    status === "RESOLVED"
                      ? "bg-green-100 text-green-800"
                      : status === "INVESTIGATING"
                      ? "bg-yellow-100 text-yellow-800"
                      : status === "DISMISSED"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-orange-100 text-orange-800"

                  return (
                    <motion.div
                      key={complaint.id}
                      variants={fadeItem}
                      whileHover={{ y: -2, scale: 1.002 }}
                      className="border border-border rounded-lg p-4 bg-white/70 dark:bg-gray-900/40 backdrop-blur"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{complaint.subject}</p>
                            <Badge variant="secondary" className="text-[11px]">
                              {complaint.complaintType.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {complaint.description}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>Filed: {createdAt}</span>
                            {complaint.propertyId && (
                              <Link
                                href={`/listing/${complaint.propertyId}`}
                                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700"
                              >
                                <Home className="h-3.5 w-3.5" /> View listing
                              </Link>
                            )}
                            {complaint.landlordName && <span>Landlord: {complaint.landlordName}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2 min-w-[140px]">
                          <Badge variant="secondary" className={statusClasses}>
                            {status}
                          </Badge>
                          {complaint.priority && (
                            <Badge variant="outline" className="text-[11px]">
                              Priority: {complaint.priority}
                            </Badge>
                          )}
                          <Button asChild variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                            <Link href="/search">File another</Link>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                {complaintsHasMore && !complaintsLoading && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => loadComplaints(complaintsPage + 1, true)}
                      disabled={complaintsLoadingMore}
                      className="min-w-[150px]"
                    >
                      {complaintsLoadingMore ? <Spinner size={16} /> : "Load more"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
