"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { useAuth } from "@/context/AuthContext"
import { UserRole } from "@/types/auth"
import { getDashboardRouteForRole } from "@/lib/utils"
import {
  fetchAdminDashboard,
  fetchAdminProperties,
  fetchAdminUsers,
  fetchPendingVerifications,
  fetchAdminComplaints,
  approveVerification,
  rejectVerification,
  AdminUser,
  updateAdminUserRole,
  setAdminUserActive,
  deleteAdminUser,
  verifyAdminUser,
  deleteAdminProperty,
  approveAdminProperty,
  rejectAdminProperty,
  featureAdminProperty,
} from "@/services/dashboardService"
import type { PropertyListItem } from "@/types/property"
import {
  Search,
  Users,
  Building,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export default function AdminDashboard() {
  const router = useRouter()
  const { user: currentUser, isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [stats, setStats] = useState<Record<string, any> | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [usersData, setUsersData] = useState<AdminUser[]>([])
  const [propertiesData, setPropertiesData] = useState<PropertyListItem[]>([])
  const [verifications, setVerifications] = useState<any[]>([])
  const [verificationsLoading, setVerificationsLoading] = useState(false)
  const [verificationsPage, setVerificationsPage] = useState(0)
  const [verificationsHasMore, setVerificationsHasMore] = useState(false)
  const verificationsLoadingRef = useRef(false)
  const [complaints, setComplaints] = useState<any[]>([])
  const [complaintsLoading, setComplaintsLoading] = useState(false)
  const [complaintsPage, setComplaintsPage] = useState(0)
  const [complaintsHasMore, setComplaintsHasMore] = useState(false)
  const complaintsLoadingRef = useRef(false)
  const [verificationScope, setVerificationScope] = useState<"landlords" | "properties">("landlords")
  const [pendingProps, setPendingProps] = useState<PropertyListItem[]>([])
  const [pendingPropsLoading, setPendingPropsLoading] = useState(false)
  const [pendingPropsPage, setPendingPropsPage] = useState(0)
  const [pendingPropsHasMore, setPendingPropsHasMore] = useState(false)
  const pendingPropsLoadingRef = useRef(false)
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [usersPage, setUsersPage] = useState(0)
  const [usersHasMore, setUsersHasMore] = useState(false)
  const [usersLoadingMore, setUsersLoadingMore] = useState(false)
  const [listingsPage, setListingsPage] = useState(0)
  const [listingsHasMore, setListingsHasMore] = useState(false)
  const [listingsLoadingMore, setListingsLoadingMore] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [listingActionLoading, setListingActionLoading] = useState<string | null>(null)
  const [openUserActions, setOpenUserActions] = useState<string | null>(null)
  const [openListingActions, setOpenListingActions] = useState<string | null>(null)
  const [selectedVerification, setSelectedVerification] = useState<any | null>(null)
  const [verificationActionLoading, setVerificationActionLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)
  const glassInput =
    "!bg-white/10 dark:!bg-gray-900/25 border border-white/15 dark:border-white/10 shadow-sm backdrop-blur-xl text-foreground placeholder:text-muted-foreground/35 placeholder:font-light transition-all focus:!bg-white/85 dark:focus:!bg-gray-900/70 focus:backdrop-blur-2xl focus:ring-2 focus:ring-orange-300/70 focus:border-orange-300/70"
  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.18, delay: i * 0.03 } }),
  }
  const listContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  }
  const cardHover = { whileHover: { y: -6, scale: 1.01, transition: { duration: 0.18 } } }
  const pageSize = 10

  const loadUsers = useCallback(
    async (page = 0, append = false) => {
      try {
        append ? setUsersLoadingMore(true) : setListLoading(true)
        setListError(null)
        const params: any = { page, size: pageSize, search: searchQuery || undefined }
        if (filterStatus === "active") params.active = true
        if (filterStatus === "inactive") params.active = false
        if (filterStatus === "pending") params.verified = false
        const response = await fetchAdminUsers(params)
        setUsersData((prev) => (append ? [...prev, ...(response?.content || [])] : response?.content || []))
        setUsersPage(page)
        const totalElements = response?.totalElements ?? response?.content?.length ?? 0
        const totalPages =
          response?.totalPages ?? Math.ceil(totalElements / (response?.size || pageSize || 1))
        setUsersHasMore(page + 1 < (totalPages || 0))
        if (!append) setSelectedUsers(new Set())
      } catch (err) {
        console.error("[AdminDashboard] Failed to load users", err)
        setListError("Could not load data for this tab.")
        setUsersHasMore(false)
      } finally {
        append ? setUsersLoadingMore(false) : setListLoading(false)
      }
    },
    [filterStatus, searchQuery]
  )

  const askConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ title, message, onConfirm })
  }

  const loadListings = useCallback(
    async (page = 0, append = false) => {
      try {
        append ? setListingsLoadingMore(true) : setListLoading(true)
        setListError(null)
        const params: any = { page, size: pageSize, search: searchQuery || undefined }
        if (filterStatus === "active") params.status = "APPROVED"
        if (filterStatus === "pending") params.status = "PENDING"
        if (filterStatus === "inactive") params.status = "REJECTED"
        const response = await fetchAdminProperties(params)
        setPropertiesData((prev) => (append ? [...prev, ...(response?.content || [])] : response?.content || []))
        setListingsPage(page)
        const totalElements = response?.totalElements ?? response?.content?.length ?? 0
        const totalPages =
          response?.totalPages ?? Math.ceil(totalElements / (response?.size || pageSize || 1))
        setListingsHasMore(page + 1 < (totalPages || 0))
        if (!append) setSelectedListings(new Set())
      } catch (err) {
        console.error("[AdminDashboard] Failed to load listings", err)
        setListError("Could not load data for this tab.")
        setListingsHasMore(false)
      } finally {
        append ? setListingsLoadingMore(false) : setListLoading(false)
      }
    },
    [filterStatus, searchQuery]
  )

  const handleUserStatus = async (userId: string, active: boolean) => {
    try {
      setActionLoading(userId)
      await setAdminUserActive(userId, active)
      toast.success(`User ${active ? "activated" : "deactivated"}`)
      await loadUsers(0, false)
    } catch (err) {
      console.error("[Admin] Failed to update user status", err)
      toast.error("Could not update user status.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleUserRoleChange = async (userId: string, role: string) => {
    try {
      setActionLoading(userId)
      await updateAdminUserRole(userId, role)
      toast.success("User role updated")
      await loadUsers(0, false)
    } catch (err) {
      console.error("[Admin] Failed to update user role", err)
      toast.error("Could not update user role.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleUserDelete = async (userId: string) => {
    try {
      setActionLoading(userId)
      await deleteAdminUser(userId)
      toast.success("User deleted")
      await loadUsers(0, false)
    } catch (err) {
      console.error("[Admin] Failed to delete user", err)
      toast.error("Could not delete user.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleListingDelete = async (listingId: string) => {
    try {
      setListingActionLoading(listingId)
      await deleteAdminProperty(listingId)
      setPropertiesData((prev) => prev.filter((l) => l.id !== listingId))
      setSelectedListings((prev) => {
        const next = new Set(prev)
        next.delete(listingId)
        return next
      })
      toast.success("Listing deleted")
    } catch (err) {
      console.error("[Admin] Failed to delete listing", err)
      toast.error("Could not delete listing.")
    } finally {
      setListingActionLoading(null)
      setOpenListingActions(null)
    }
  }

  const handleListingStatus = async (listingId: string, action: "approve" | "reject") => {
    try {
      setListingActionLoading(listingId)
      if (action === "approve") {
        await approveAdminProperty(listingId)
      } else {
        await rejectAdminProperty(listingId)
      }
      // Refresh current page
      await loadListings(0, false)
      toast.success(`Listing ${action === "approve" ? "approved" : "rejected"}`)
    } catch (err) {
      console.error("[Admin] Listing status update failed", err)
      toast.error("Could not update listing status.")
    } finally {
      setListingActionLoading(null)
      setOpenListingActions(null)
    }
  }

  const handleListingFeature = async (listingId: string, featured: boolean) => {
    try {
      setListingActionLoading(listingId)
      await featureAdminProperty(listingId, featured)
      setPropertiesData((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, isFeatured: featured } : l))
      )
      toast.success(featured ? "Listing featured" : "Listing unfeatured")
    } catch (err) {
      console.error("[Admin] Listing feature toggle failed", err)
      toast.error("Could not update featured status.")
    } finally {
      setListingActionLoading(null)
      setOpenListingActions(null)
    }
  }

  const handleUserVerify = async (userId: string) => {
    try {
      setActionLoading(userId)
      await verifyAdminUser(userId)
      toast.success("User verified")
      await loadUsers(0, false)
    } catch (err) {
      console.error("[Admin] Failed to verify user", err)
      toast.error("Could not verify user.")
    } finally {
      setActionLoading(null)
    }
  }

  const loadVerifications = useCallback(
    async (page = 0, append = false) => {
      if (verificationsLoadingRef.current) return
      verificationsLoadingRef.current = true
      setVerificationsLoading(true)
      try {
        const resp = await fetchPendingVerifications(page, pageSize)
        setVerifications((prev) => (append ? [...prev, ...(resp?.content || [])] : resp?.content || []))
        setVerificationsPage(page)
        const totalElements = resp?.totalElements ?? resp?.content?.length ?? 0
        const totalPages = resp?.totalPages ?? Math.ceil(totalElements / (resp?.size || pageSize || 1))
        setVerificationsHasMore(page + 1 < (totalPages || 0))
      } catch (err) {
        console.error("[AdminDashboard] Failed to load list data", err)
        setListError("Could not load data for this tab.")
      } finally {
        setVerificationsLoading(false)
        verificationsLoadingRef.current = false
      }
    },
    [pageSize],
  )

  const loadComplaints = useCallback(
    async (page = 0, append = false) => {
      if (complaintsLoadingRef.current) return
      complaintsLoadingRef.current = true
      setComplaintsLoading(true)
      try {
        const resp = await fetchAdminComplaints({ page, size: pageSize, status: "PENDING" })
        setComplaints((prev) => (append ? [...prev, ...(resp?.content || [])] : resp?.content || []))
        setComplaintsPage(page)
        const totalElements = resp?.totalElements ?? resp?.content?.length ?? 0
        const totalPages = resp?.totalPages ?? Math.ceil(totalElements / (resp?.size || pageSize || 1))
        setComplaintsHasMore(page + 1 < (totalPages || 0))
      } catch (err) {
        console.error("[AdminDashboard] Failed to load complaints", err)
        setListError("Could not load complaints right now.")
      } finally {
        setComplaintsLoading(false)
        complaintsLoadingRef.current = false
      }
    },
    [pageSize],
  )

  const loadPendingProps = useCallback(
    async (page = 0, append = false) => {
      if (pendingPropsLoadingRef.current) return
      pendingPropsLoadingRef.current = true
      setPendingPropsLoading(true)
      try {
        const resp = await fetchAdminProperties({ page, size: pageSize, status: "PENDING" })
        setPendingProps((prev) => (append ? [...prev, ...(resp?.content || [])] : resp?.content || []))
        setPendingPropsPage(page)
        const totalElements = resp?.totalElements ?? resp?.content?.length ?? 0
        const totalPages = resp?.totalPages ?? Math.ceil(totalElements / (resp?.size || pageSize || 1))
        setPendingPropsHasMore(page + 1 < (totalPages || 0))
      } catch (err) {
        console.error("[AdminDashboard] Failed to load pending properties", err)
      } finally {
        setPendingPropsLoading(false)
        pendingPropsLoadingRef.current = false
      }
    },
    [pageSize],
  )

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace("/auth/login?redirect=/admin")
      return
    }

    if (currentUser && currentUser.role !== UserRole.ADMIN) {
      router.replace(getDashboardRouteForRole(currentUser.role))
    }
  }, [isAuthenticated, isLoading, router, currentUser])

  useEffect(() => {
    if (!isAuthenticated) return
    setIsFetching(true)
    fetchAdminDashboard()
      .then((data) => {
        setStats(data || null)
        setFetchError(null)
      })
      .catch((err) => {
        console.error("[AdminDashboard] Failed to load stats", err)
        setFetchError("Could not load admin stats right now.")
      })
      .finally(() => setIsFetching(false))
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    const loadUsersMemo = loadUsers
    const loadListingsMemo = loadListings
    const loadVerificationsMemo = loadVerifications
    const loadComplaintsMemo = loadComplaints
    const loadPendingPropsMemo = loadPendingProps

    if (activeTab === "users" || activeTab === "overview") {
      loadUsersMemo(0, false)
    }
    if (activeTab === "listings" || activeTab === "overview") {
      loadListingsMemo(0, false)
    }
    if (activeTab === "verifications") {
      if (verificationScope === "landlords") {
        loadVerificationsMemo(0, false)
      } else {
        loadPendingPropsMemo(0, false)
      }
    }
    if (activeTab === "complaints") {
      loadComplaintsMemo(0, false)
    }
  }, [activeTab, isAuthenticated, verificationScope, loadUsers, loadListings, loadVerifications, loadComplaints, loadPendingProps])

  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size={40} />
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !currentUser || currentUser.role !== UserRole.ADMIN) {
    return null
  }

  const renderStatSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card
          key={`stat-skel-${idx}`}
          className="rounded-xl shadow-sm bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-border/60"
        >
          <CardContent className="p-6 space-y-3">
            <div className="h-3 w-20 rounded-full bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 animate-pulse" />
            <div className="h-6 w-24 rounded-full bg-gradient-to-r from-muted/60 via-muted/40 to-muted/60 animate-pulse" />
            <div className="h-4 w-16 rounded-full bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const handleBulkDelete = (entity: "users" | "listings") => {
    const ids = entity === "users" ? Array.from(selectedUsers) : Array.from(selectedListings)
    const currentId = currentUser?.id
    const filteredIds = entity === "users" && currentId ? ids.filter((id) => id !== currentId) : ids
    if (filteredIds.length === 0) {
      toast.info(`Select ${entity === "users" ? "users" : "listings"} first.`)
      return
    }
    setConfirmDialog({
      title: `Delete ${filteredIds.length} ${entity === "users" ? "user(s)" : "listing(s)"}?`,
      message: "This action cannot be undone.",
      onConfirm: async () => {
        try {
          setActionLoading("bulk")
          if (entity === "users") {
            await Promise.all(filteredIds.map((id) => deleteAdminUser(id)))
            setSelectedUsers(new Set())
            await loadUsers(0, false)
          } else {
            await Promise.all(filteredIds.map((id) => deleteAdminProperty(id)))
            setSelectedListings(new Set())
            setPropertiesData((prev) => prev.filter((p) => !filteredIds.includes(p.id)))
          }
          toast.success("Bulk delete completed")
        } catch (err) {
          console.error("[Admin] Bulk delete failed", err)
          toast.error("Bulk delete failed.")
        } finally {
          setActionLoading(null)
        }
      },
    })
  }

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers ?? "--", icon: Users, color: "text-orange-600" },
    { title: "Active Listings", value: stats?.totalProperties ?? "--", icon: Building, color: "text-green-600" },
    { title: "Featured", value: stats?.featuredProperties ?? "--", icon: TrendingUp, color: "text-teal-600" },
    { title: "Pending Verifications", value: stats?.pendingVerifications ?? "--", icon: ShieldCheck, color: "text-indigo-600" },
    { title: "Complaints", value: stats?.pendingComplaints ?? "--", icon: AlertTriangle, color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      <motion.div
        className="container-responsive py-10 space-y-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* Page Intro */}
        <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-orange-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-orange-500 font-medium">Admin Control</p>
              <h1 className="text-3xl font-bold text-foreground">Platform Dashboard</h1>
              <p className="text-muted-foreground">Monitor users, listings, verifications, and complaints in one place.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { id: "overview", label: "Overview" },
                { id: "users", label: "Users" },
                { id: "listings", label: "Listings" },
                { id: "verifications", label: "Verifications" },
                { id: "complaints", label: "Complaints" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className={activeTab === tab.id ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {fetchError && (
                  <div className="text-sm text-red-600">{fetchError}</div>
                )}

                {/* Stats Grid */}
                {isFetching ? (
                  renderStatSkeleton()
                ) : (
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={listContainer}
                    initial="hidden"
                    animate="show"
                  >
                    {statCards.map((stat, index) => {
                      const Icon = stat.icon
                      const isVerifications = stat.title === "Pending Verifications"
                      return (
                        <motion.div key={index} {...cardHover} variants={rowVariants} custom={index}>
                          <Card
                            className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-border/60 cursor-pointer"
                            onClick={() => {
                              if (isVerifications) setActiveTab("verifications")
                            }}
                          >
                            <CardContent className="p-6 space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                </div>
                                <Icon className={`h-8 w-8 ${stat.color}`} />
                              </div>
                              {isVerifications && (stats?.pendingVerifications ?? 0) > 0 && (
                                <Button
                                  variant="link"
                                  className="px-0 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveTab("verifications")
                                  }}
                                >
                                  View requests
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              {...cardHover}
            >
                <Card className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-border/60">
                  <CardHeader>
                    <CardTitle className="text-xl">Recent Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {listLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Spinner size={18} /> Loading users...
                        </div>
                      )}
                      <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                        {!listLoading &&
                          usersData.slice(0, 5).map((user, idx) => (
                            <motion.div
                              key={user.id}
                              whileHover={{ y: -2 }}
                              variants={rowVariants}
                              custom={idx}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium">{user.fullName}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                              <Badge
                                variant={user.isActive ? "default" : "secondary"}
                                className={`text-xs ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </motion.div>
                          ))}
                      </motion.div>
                      {!listLoading && usersData.length === 0 && (
                        <p className="text-sm text-muted-foreground">No users found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.08 }}
                {...cardHover}
              >
                <Card className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-border/60">
                  <CardHeader>
                    <CardTitle className="text-xl">Recent Listings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {listLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Spinner size={18} /> Loading listings...
                        </div>
                      )}
                      <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                        {!listLoading &&
                          propertiesData.slice(0, 5).map((listing, idx) => (
                            <motion.div
                              key={listing.id}
                              whileHover={{ y: -2 }}
                              variants={rowVariants}
                              custom={idx}
                              className="flex items-center justify-between rounded-lg border border-white/30 dark:border-white/10 bg-white/60 dark:bg-gray-900/40 px-4 py-3 shadow-sm"
                            >
                              <div>
                                <p className="font-medium">{listing.title}</p>
                                <p className="text-sm text-muted-foreground">by {listing.landlordName || "Unknown"}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">Rs {(Number(listing.monthlyRent) || 0).toLocaleString()}</p>
                                <Badge
                                  variant={listing.status === "APPROVED" ? "default" : "secondary"}
                                  className={`text-xs ${
                                    listing.status === "APPROVED"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {listing.status || "UNKNOWN"}
                                </Badge>
                              </div>
                            </motion.div>
                          ))}
                      </motion.div>
                      {!listLoading && propertiesData.length === 0 && (
                        <p className="text-sm text-muted-foreground">No listings found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              {...cardHover}
            >
              <Card className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-border/60">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`pl-10 ${glassInput}`}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className={`w-full sm:w-48 ${glassInput}`}>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" onClick={() => setSelectedUsers(new Set())}>
                      Clear selection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const ids = usersData
                          .map((u) => u.id)
                          .filter((id) => id && id !== currentUser?.id)
                        setSelectedUsers(new Set(ids))
                      }}
                    >
                      Select all
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkDelete("users")}
                      disabled={selectedUsers.size === 0}
                      className="bg-red-600 hover:bg-red-700 text-white border border-red-200 shadow-sm"
                    >
                      Delete selected
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Users Table */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.04 }}
              {...cardHover}
            >
              <Card className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/65 backdrop-blur-2xl border border-white/20 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl">Users ({usersData.length})</CardTitle>
                  {listError && <p className="text-sm text-red-600">{listError}</p>}
                </CardHeader>
                <CardContent className="space-y-3">
                  {listLoading && (
                    <div className="flex justify-center py-6">
                      <Spinner size={36} />
                    </div>
                  )}
                  {!listLoading && usersData.length === 0 && (
                    <p className="text-sm text-muted-foreground px-2">No users found for the current filter.</p>
                  )}
                  <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                    {!listLoading &&
                      usersData.map((user, idx) => (
                        <motion.div
                          key={user.id}
                          variants={rowVariants}
                          custom={idx}
                          whileHover={{ y: -3, scale: 1.002 }}
                          className="p-4 rounded-xl bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl border border-white/25 dark:border-white/10 hover:border-orange-300/70 hover:shadow-lg transition"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                            <div className="flex items-start gap-3 col-span-2">
                              <input
                                type="checkbox"
                                checked={selectedUsers.has(user.id)}
                                disabled={user.id === currentUser?.id}
                                onChange={(e) => {
                                  if (user.id === currentUser?.id) return
                                  setSelectedUsers((prev) => {
                                    const next = new Set(prev)
                                    if (e.target.checked) next.add(user.id)
                                    else next.delete(user.id)
                                    return next
                                  })
                                }}
                                className="mt-1 disabled:cursor-not-allowed"
                              />
                              <div className="space-y-1">
                                <p className="font-semibold text-foreground">{user.fullName}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <p className="text-xs text-muted-foreground">{user.phone || "No phone"}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                              <Badge variant="outline" className="w-fit">
                                {user.role}
                              </Badge>
                              <Badge
                                variant={user.isActive ? "default" : "secondary"}
                                className={`text-xs w-fit ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {user.isVerified ? (
                                <Badge variant="outline" className="text-xs">
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                                  Unverified
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                              <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
                              <span className="text-xs">
                                Status:{" "}
                                <Badge variant="outline" className="text-xs">
                                  {user.isVerified ? "Verified" : "Unverified"}
                                </Badge>
                              </span>
                            </div>
                            <div className="flex items-center justify-start md:justify-end gap-2">
                              {openUserActions === user.id ? (
                                <>
                                  <Select
                                    value={user.role}
                                onValueChange={(value) =>
                                  askConfirm("Change role?", "This will update the user's role immediately.", () =>
                                    handleUserRoleChange(user.id, value),
                                  )
                                }
                                disabled={actionLoading === user.id}
                              >
                                    <SelectTrigger className="w-24 h-9 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="TENANT">TENANT</SelectItem>
                                      <SelectItem value="LANDLORD">LANDLORD</SelectItem>
                                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant={user.isActive ? "outline" : "default"}
                                    size="sm"
                                    className={user.isActive ? "border-red-200 text-red-600" : "bg-green-600 text-white"}
                                    onClick={() =>
                                  askConfirm(
                                    user.isActive ? "Deactivate user?" : "Activate user?",
                                    user.isActive
                                      ? "The user will not be able to log in until reactivated."
                                      : "The user will be able to access their account.",
                                    () => handleUserStatus(user.id, !user.isActive),
                                  )
                                      }
                                      disabled={actionLoading === user.id}
                                    >
                                      {user.isActive ? (
                                        <>
                                            <X className="h-4 w-4 mr-1" /> Deactivate
                                        </>
                                      ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" /> Activate
                                        </>
                                      )}
                                    </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 disabled:text-muted-foreground disabled:cursor-not-allowed"
                                    onClick={() =>
                                      askConfirm(
                                        "Delete user?",
                                        "This action cannot be undone.",
                                        () => handleUserDelete(user.id),
                                      )
                                    }
                                    disabled={actionLoading === user.id || user.id === currentUser?.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  {!user.isVerified && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700"
                                      onClick={() =>
                                        askConfirm("Verify user?", "Mark this user as verified?", () => handleUserVerify(user.id))
                                      }
                                      disabled={actionLoading === user.id}
                                    >
                                    <ShieldCheck className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="sm" onClick={() => setOpenUserActions(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => setOpenUserActions(user.id)}>
                                  Manage
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </motion.div>
                  {usersHasMore && !listLoading && usersData.length > 0 && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => loadUsers(usersPage + 1, true)}
                        disabled={usersLoadingMore}
                        className="min-w-[160px]"
                      >
                        {usersLoadingMore ? <Spinner size={18} /> : "Load more"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              {...cardHover}
            >
              <Card className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-border/60">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search listings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`pl-10 ${glassInput}`}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className={`w-full sm:w-48 ${glassInput}`}>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 pt-3 border-t border-border/50">
                    <Button variant="outline" size="sm" onClick={() => setSelectedListings(new Set())}>
                      Clear selection
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedListings(new Set(propertiesData.map((p) => p.id)))}>
                      Select all
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkDelete("listings")}
                      disabled={selectedListings.size === 0}
                      className="bg-red-600 hover:bg-red-700 text-white border border-red-200 shadow-sm"
                    >
                      Delete selected
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Listings Table */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.04 }}
              {...cardHover}
            >
              <Card className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/65 backdrop-blur-2xl border border-white/20 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl">Listings ({propertiesData.length})</CardTitle>
                  {listError && <p className="text-sm text-red-600">{listError}</p>}
                </CardHeader>
                <CardContent className="space-y-3">
                  {listLoading && (
                    <div className="flex justify-center py-6">
                      <Spinner size={36} />
                    </div>
                  )}
                  {!listLoading && propertiesData.length === 0 && (
                    <p className="text-sm text-muted-foreground px-2">No listings found for the current filter.</p>
                  )}
                  <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                    {!listLoading &&
                      propertiesData.map((listing, idx) => (
                        <motion.div
                          key={listing.id}
                          variants={rowVariants}
                          custom={idx}
                          whileHover={{ y: -3, scale: 1.002 }}
                          className="flex flex-col md:grid md:grid-cols-5 md:auto-cols-fr md:items-center gap-3 p-4 rounded-xl bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:border-orange-300/70 hover:shadow-lg transition"
                        >
                          <div className="flex items-start gap-3 md:col-span-2">
                            <input
                              type="checkbox"
                              checked={selectedListings.has(listing.id)}
                              onChange={(e) => {
                                setSelectedListings((prev) => {
                                  const next = new Set(prev)
                                  if (e.target.checked) next.add(listing.id)
                                  else next.delete(listing.id)
                                  return next
                                })
                              }}
                              className="mt-1"
                            />
                            <div className="space-y-1">
                              <p className="font-semibold text-foreground">{listing.title}</p>
                              <p className="text-sm text-muted-foreground">by {listing.landlordName || "Unknown"}</p>
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span>City: {listing.city || listing.district || "—"}</span>
                                <span>Type: {listing.propertyType || "—"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground">Rent</span>
                            <p className="font-medium text-foreground">Rs {(Number(listing.monthlyRent) || 0).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              Deposits: {listing.securityDeposit ? `Rs ${(Number(listing.securityDeposit) || 0).toLocaleString()}` : "—"}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            <span>Views: {listing.viewCount ?? "—"}</span>
                            <span>Rating: {listing.averageRating ?? "—"}</span>
                            <span>{listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : "—"}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={listing.status === "APPROVED" ? "default" : "secondary"}
                              className={`text-xs ${
                                listing.status === "APPROVED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {listing.status || "UNKNOWN"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {listing.isFeatured ? "Featured" : "Standard"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 md:justify-end md:col-span-1 flex-nowrap w-full">
                            {openListingActions === listing.id ? (
                              <>
                                {listing.status === "PENDING" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={listingActionLoading === listing.id}
                                      onClick={() =>
                                        askConfirm(
                                          "Approve listing?",
                                          "Mark this listing as approved.",
                                          () => handleListingStatus(listing.id, "approve"),
                                        )
                                      }
                                    >
                                      {listingActionLoading === listing.id ? (
                                        <Spinner size={16} />
                                      ) : (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={listingActionLoading === listing.id}
                                      onClick={() =>
                                        askConfirm(
                                          "Reject listing?",
                                          "This will set the listing to rejected.",
                                          () => handleListingStatus(listing.id, "reject"),
                                        )
                                      }
                                    >
                                      {listingActionLoading === listing.id ? (
                                        <Spinner size={16} />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                      )}
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={listingActionLoading === listing.id}
                                  onClick={() => handleListingFeature(listing.id, !listing.isFeatured)}
                                >
                                  {listingActionLoading === listing.id ? (
                                    <Spinner size={16} />
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      {listing.isFeatured ? "Unfeature" : "Feature"}
                                    </Badge>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  disabled={listingActionLoading === listing.id}
                                  onClick={() =>
                                    askConfirm(
                                      "Delete listing?",
                                      "This action cannot be undone.",
                                      () => handleListingDelete(listing.id),
                                    )
                                  }
                                >
                                  {listingActionLoading === listing.id ? (
                                    <Spinner size={16} />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setOpenListingActions(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => setOpenListingActions(listing.id)}>
                                More
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </motion.div>
                  {listingsHasMore && !listLoading && propertiesData.length > 0 && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => loadListings(listingsPage + 1, true)}
                        disabled={listingsLoadingMore}
                        className="min-w-[160px]"
                      >
                        {listingsLoadingMore ? <Spinner size={18} /> : "Load more"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === "verifications" && (
          <motion.div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h2 className="text-xl font-semibold text-foreground">Pending Verifications</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={verificationScope === "landlords" ? "default" : "outline"}
                  className={verificationScope === "landlords" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                  onClick={() => setVerificationScope("landlords")}
                >
                  Landlords
                </Button>
                <Button
                  size="sm"
                  variant={verificationScope === "properties" ? "default" : "outline"}
                  className={verificationScope === "properties" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                  onClick={() => setVerificationScope("properties")}
                >
                  Properties
                </Button>
              </div>
            </div>

            {/* Landlord verifications */}
            {verificationScope === "landlords" && (
              <Card className="rounded-xl shadow-sm">
                <CardContent className="pt-6 space-y-3">
                  {verificationsLoading && <p className="text-sm text-muted-foreground">Loading verifications...</p>}
                  {!verificationsLoading && verifications.length === 0 && (
                    <p className="text-sm text-muted-foreground">No pending verifications right now.</p>
                  )}
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                    className="space-y-3"
                  >
                    {verifications.map((item: any, idx) => (
                      <motion.div
                        key={item.id}
                        custom={idx}
                        initial={{ opacity: 0, y: 10, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, delay: idx * 0.02 }}
                        className="flex items-center justify-between border border-border rounded-lg p-4 bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg cursor-pointer shadow-sm"
                        whileHover={{ y: -3, scale: 1.01, boxShadow: "0 14px 35px rgba(0,0,0,0.12)" }}
                      >
                        <div>
                          <p className="font-medium text-foreground">{item.userFullName || "Unknown user"}</p>
                          <p className="text-sm text-muted-foreground">{item.userEmail}</p>
                          <p className="text-xs text-muted-foreground mt-1">Submitted: {item.submittedAt || "—"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">PENDING</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            disabled={verificationsLoading}
                            onClick={() =>
                              askConfirm("Approve verification?", "Approve this landlord verification?", () =>
                                approveVerification(item.id)
                                  .then(() => {
                                    toast.success("Verification approved")
                                    loadVerifications(0, false)
                                  })
                                  .catch(() => toast.error("Failed to approve verification")),
                              )
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            disabled={verificationsLoading}
                            onClick={() =>
                              askConfirm("Reject verification?", "Reject this landlord verification?", () =>
                                rejectVerification(item.id)
                                  .then(() => {
                                    toast.success("Verification rejected")
                                    loadVerifications(0, false)
                                  })
                                  .catch(() => toast.error("Failed to reject verification")),
                              )
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedVerification(item)}
                          >
                            View
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                  {verificationsHasMore && !verificationsLoading && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => loadVerifications(verificationsPage + 1, true)}
                        disabled={verificationsLoading}
                      >
                        {verificationsLoading ? <Spinner size={16} /> : "Load more"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Property verifications (pending properties) */}
            {verificationScope === "properties" && (
              <Card className="rounded-xl shadow-sm">
                <CardContent className="pt-6 space-y-3">
                  {pendingPropsLoading && <p className="text-sm text-muted-foreground">Loading pending properties...</p>}
                  {!pendingPropsLoading && pendingProps.length === 0 && (
                    <p className="text-sm text-muted-foreground">No pending property verifications right now.</p>
                  )}
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                    className="space-y-3"
                  >
                    {pendingProps.map((prop, idx) => (
                      <motion.div
                        key={prop.id}
                        custom={idx}
                        initial={{ opacity: 0, y: 10, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, delay: idx * 0.02 }}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-border rounded-lg p-4 bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg shadow-sm"
                        whileHover={{ y: -3, scale: 1.01, boxShadow: "0 14px 35px rgba(0,0,0,0.12)" }}
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{prop.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by {prop.landlordName || "Unknown landlord"} • {prop.city || prop.district || "Location N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Type: {prop.propertyType || "Property"} • Rent: Rs {(Number(prop.monthlyRent) || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <Badge variant="outline" className="text-xs">PENDING</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            disabled={pendingPropsLoading}
                            onClick={() =>
                              askConfirm("Approve property?", "Approve this property listing?", () =>
                                handleListingStatus(prop.id, "approve"),
                              )
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            disabled={pendingPropsLoading}
                            onClick={() =>
                              askConfirm("Reject property?", "Reject this property listing?", () =>
                                handleListingStatus(prop.id, "reject"),
                              )
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link href={`/listing/${prop.id}`} target="_blank" rel="noreferrer">
                              View listing
                            </Link>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                  {pendingPropsHasMore && !pendingPropsLoading && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => loadPendingProps(pendingPropsPage + 1, true)}
                        disabled={pendingPropsLoading}
                      >
                        {pendingPropsLoading ? <Spinner size={16} /> : "Load more"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Confirmation modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-border max-w-sm w-full p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">{confirmDialog.title}</h3>
              <p className="text-sm text-muted-foreground">{confirmDialog.message}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="border-muted text-foreground hover:bg-muted/40" onClick={() => setConfirmDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-400"
                onClick={() => {
                  confirmDialog.onConfirm()
                  setConfirmDialog(null)
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedVerification && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-border max-w-3xl w-full p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Verification details</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedVerification.userFullName} ({selectedVerification.userEmail})
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedVerification(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Citizenship number</p>
                <p className="text-sm text-muted-foreground break-all">
                  {selectedVerification.citizenshipNumber || "—"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Submitted</p>
                <p className="text-sm text-muted-foreground">
                  {selectedVerification.submittedAt
                    ? new Date(selectedVerification.submittedAt).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Status</p>
                <Badge variant="outline" className="text-xs">
                  {selectedVerification.verificationStatus}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["citizenshipFrontImage", "citizenshipBackImage"].map((key) => {
                const label = key === "citizenshipFrontImage" ? "Citizenship front" : "Citizenship back"
                const url = selectedVerification[key]
                return (
                  <div key={key} className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer" className="block group">
                        <img
                          src={url}
                          alt={label}
                          className="w-full rounded-lg border border-border/60 object-cover max-h-72 group-hover:shadow-lg transition"
                        />
                        <p className="text-xs text-muted-foreground mt-1 break-all">{url}</p>
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not provided</p>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setSelectedVerification(null)}>
                Close
              </Button>
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                disabled={verificationActionLoading}
                onClick={async () => {
                  try {
                    setVerificationActionLoading(true)
                    await rejectVerification(selectedVerification.id)
                    toast.success("Verification rejected")
                    setSelectedVerification(null)
                    loadVerifications(0, false)
                  } catch (err) {
                    console.error("[Admin] Reject verification failed", err)
                    toast.error("Failed to reject verification")
                  } finally {
                    setVerificationActionLoading(false)
                  }
                }}
              >
                {verificationActionLoading ? <Spinner size={16} /> : <XCircle className="h-4 w-4 mr-1" />} Reject
              </Button>
              <Button
                disabled={verificationActionLoading}
                onClick={async () => {
                  try {
                    setVerificationActionLoading(true)
                    await approveVerification(selectedVerification.id)
                    toast.success("Verification approved")
                    setSelectedVerification(null)
                    loadVerifications(0, false)
                  } catch (err) {
                    console.error("[Admin] Approve verification failed", err)
                    toast.error("Failed to approve verification")
                  } finally {
                    setVerificationActionLoading(false)
                  }
                }}
              >
                {verificationActionLoading ? <Spinner size={16} /> : <CheckCircle className="h-4 w-4 mr-1" />} Approve
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

        {/* Complaints Tab */}
        {activeTab === "complaints" && (
          <motion.div className="space-y-6">
            <Card className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-border/60">
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>Complaints & Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {complaintsLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner size={18} /> Loading complaints...
                  </div>
                )}
                {!complaintsLoading && complaints.length === 0 && (
                  <p className="text-sm text-muted-foreground">No complaints to review right now.</p>
                )}
                <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                  {!complaintsLoading &&
                    complaints.map((c, idx) => {
                      const filedAt = c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"
                      const status = c.status || "PENDING"
                      const reporterName = c.reporterName || c.userFullName || c.userName
                      const reporterEmail = c.reporterEmail || c.userEmail
                      const relatedListing = c.listingTitle || c.propertyTitle || c.propertyName

                      return (
                        <motion.div
                          key={c.id}
                          variants={rowVariants}
                          custom={idx}
                          className="p-4 rounded-xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg border border-border/60"
                          whileHover={{ y: -2, scale: 1.005 }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_230px] gap-4 items-start">
                            <div className="space-y-2 min-w-0">
                              <div className="flex flex-wrap items-start gap-2">
                                <p className="font-semibold text-foreground break-words">
                                  {c.subject || "Complaint"}
                                </p>
                                {c.category && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[11px] bg-orange-50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-50"
                                  >
                                    {c.category}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed break-words">
                                {c.description || "No description provided."}
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span>Filed: {filedAt}</span>
                                {relatedListing && (
                                  <span className="truncate md:whitespace-normal md:break-words">
                                    Listing: {relatedListing}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap md:flex-col md:items-end gap-2 text-sm text-muted-foreground">
                              {(reporterName || reporterEmail) && (
                                <div className="flex flex-col items-start md:items-end text-left md:text-right">
                                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground/70">
                                    Reporter
                                  </span>
                                  <span className="font-medium text-foreground break-words">
                                    {reporterName || "Unknown"}
                                  </span>
                                  {reporterEmail && <span className="text-xs break-all">{reporterEmail}</span>}
                                </div>
                              )}
                              <Badge variant="outline" className="text-[11px] self-start md:self-end">
                                {status}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                </motion.div>
                {complaintsHasMore && !complaintsLoading && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => loadComplaints(complaintsPage + 1, true)}
                      disabled={complaintsLoading}
                    >
                      {complaintsLoading ? <Spinner size={16} /> : "Load more"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
    </div>
  )
}
