"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { updateComplaint } from "@/services/complaintService"
import type { PropertyListItem } from "@/types/property"
import type { Complaint, ComplaintPriority, ComplaintStatus } from "@/types/complaint"
import type { LucideIcon } from "lucide-react"
import {
  Search,
  Users,
  Building,
  TrendingUp,
  AlertTriangle,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  Flag,
  FileText,
  CircleDot,
  ArrowRight,
  ExternalLink,
  UserCheck,
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
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [complaintsLoading, setComplaintsLoading] = useState(false)
  const [complaintsLoadingMore, setComplaintsLoadingMore] = useState(false)
  const [complaintsPage, setComplaintsPage] = useState(0)
  const [complaintsHasMore, setComplaintsHasMore] = useState(false)
  const complaintsLoadingRef = useRef(false)
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<ComplaintStatus | "ALL">("PENDING")
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [complaintForm, setComplaintForm] = useState<{
    status: ComplaintStatus
    priority?: ComplaintPriority
    resolutionNotes: string
  }>({
    status: "PENDING",
    priority: "MEDIUM",
    resolutionNotes: "",
  })
  const [complaintActionLoading, setComplaintActionLoading] = useState<string | null>(null)
  const [complaintUpdateLoading, setComplaintUpdateLoading] = useState(false)
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
  const complaintStatusMeta: Record<ComplaintStatus, { label: string; badge: string; icon: LucideIcon }> = {
    PENDING: {
      label: "Pending review",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      icon: Clock3,
    },
    INVESTIGATING: {
      label: "Investigating",
      badge: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CircleDot,
    },
    RESOLVED: {
      label: "Resolved",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: CheckCircle2,
    },
    DISMISSED: {
      label: "Dismissed",
      badge: "bg-slate-100 text-slate-800 border-slate-200",
      icon: XCircle,
    },
  }
  const priorityMeta: Record<ComplaintPriority, string> = {
    URGENT: "bg-rose-100 text-rose-800 border-rose-200",
    HIGH: "bg-amber-100 text-amber-800 border-amber-200",
    MEDIUM: "bg-sky-100 text-sky-800 border-sky-200",
    LOW: "bg-emerald-100 text-emerald-800 border-emerald-200",
  }
  const formatDateTime = (value?: string) => (value ? new Date(value).toLocaleString() : "—")

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
      append ? setComplaintsLoadingMore(true) : setComplaintsLoading(true)
      try {
        const resp = await fetchAdminComplaints({
          page,
          size: pageSize,
          status: complaintStatusFilter === "ALL" ? undefined : complaintStatusFilter,
        })
        setComplaints((prev) => (append ? [...prev, ...(resp?.content || [])] : resp?.content || []))
        setComplaintsPage(page)
        const totalElements = resp?.totalElements ?? resp?.content?.length ?? 0
        const totalPages = resp?.totalPages ?? Math.ceil(totalElements / (resp?.size || pageSize || 1))
        setComplaintsHasMore(page + 1 < (totalPages || 0))
      } catch (err) {
        console.error("[AdminDashboard] Failed to load complaints", err)
        setListError("Could not load complaints right now.")
      } finally {
        append ? setComplaintsLoadingMore(false) : setComplaintsLoading(false)
        complaintsLoadingRef.current = false
      }
    },
    [complaintStatusFilter, pageSize],
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

  const openComplaintDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setComplaintForm({
      status: (complaint.status as ComplaintStatus) || "PENDING",
      priority: complaint.priority || "MEDIUM",
      resolutionNotes: complaint.resolutionNotes || "",
    })
  }

  const handleComplaintSave = async () => {
    if (!selectedComplaint) return
    setComplaintUpdateLoading(true)
    try {
      const updated = await updateComplaint(selectedComplaint.id, {
        status: complaintForm.status,
        priority: complaintForm.priority,
        resolutionNotes: complaintForm.resolutionNotes.trim() || undefined,
      })
      setComplaints((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      setSelectedComplaint(updated)
      toast.success("Complaint updated")
    } catch (err) {
      console.error("[AdminDashboard] Failed to update complaint", err)
      toast.error("Could not update complaint.")
    } finally {
      setComplaintUpdateLoading(false)
    }
  }

  const handleComplaintStatusChange = async (complaint: Complaint, status: ComplaintStatus) => {
    setComplaintActionLoading(complaint.id)
    try {
      const updated = await updateComplaint(complaint.id, {
        status,
        priority: complaint.priority || undefined,
        resolutionNotes: complaint.resolutionNotes,
      })
      setComplaints((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      if (selectedComplaint?.id === complaint.id) {
        setSelectedComplaint(updated)
        setComplaintForm({
          status: updated.status || status,
          priority: updated.priority || complaintForm.priority,
          resolutionNotes: updated.resolutionNotes || complaintForm.resolutionNotes,
        })
      }
      toast.success(`Marked as ${status.toLowerCase()}`)
    } catch (err) {
      console.error("[AdminDashboard] Complaint status update failed", err)
      toast.error("Could not update complaint status.")
    } finally {
      setComplaintActionLoading(null)
    }
  }

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
    { title: "Total Users", value: stats?.totalUsers ?? "--", icon: Users, color: "text-orange-600", target: "users" },
    {
      title: "Active Listings",
      value: stats?.totalProperties ?? "--",
      icon: Building,
      color: "text-green-600",
      target: "listings",
    },
    {
      title: "Pending Listings",
      value: stats?.pendingApproval ?? "--",
      icon: AlertTriangle,
      color: "text-amber-600",
      target: "listings",
    },
    { title: "Featured", value: stats?.featuredProperties ?? "--", icon: TrendingUp, color: "text-teal-600", target: "listings" },
    {
      title: "Pending Verifications",
      value: stats?.pendingVerifications ?? "--",
      icon: ShieldCheck,
      color: "text-indigo-600",
      target: "verifications",
    },
    { title: "Complaints", value: stats?.pendingComplaints ?? "--", icon: AlertTriangle, color: "text-red-600", target: "complaints" },
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
                            className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-border/60 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:border-orange-200/70 hover:bg-white/90 hover:backdrop-blur-2xl dark:hover:bg-gray-900/80"
                            onClick={() => {
                              if (stat.target) setActiveTab(stat.target)
                              else if (isVerifications) setActiveTab("verifications")
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
                <CardHeader className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">Listings ({propertiesData.length})</CardTitle>
                    <p className="text-sm text-muted-foreground">All listings; pending need approval.</p>
                    {listError && <p className="text-sm text-red-600">{listError}</p>}
                  </div>
                  {(stats?.pendingApproval ?? 0) > 0 && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Pending: {stats?.pendingApproval}
                    </Badge>
                  )}
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
                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    listing.status === "PENDING"
                                      ? "border-amber-300 text-amber-700"
                                      : listing.status === "REJECTED"
                                      ? "border-red-300 text-red-700"
                                      : listing.status === "APPROVED"
                                      ? "border-green-300 text-green-700"
                                      : ""
                                  }`}
                                >
                                  {listing.status || "UNKNOWN"}
                                </Badge>
                                {listing.isFeatured && (
                                  <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-800">
                                    Featured
                                  </Badge>
                                )}
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
          <motion.div
            className="space-y-6 max-w-6xl w-full mx-auto"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-3xl border border-orange-100/70 dark:border-orange-500/20 bg-gradient-to-br from-orange-50/70 via-white to-teal-50/70 dark:from-gray-900/80 dark:via-gray-900/90 dark:to-gray-800/80 shadow-xl overflow-hidden">
              <CardContent className="p-4 sm:p-6 space-y-5">
                <motion.div {...cardHover} className="w-full">
                  <div className="rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/40 dark:border-white/10 p-5 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold uppercase tracking-wide">
                          <AlertTriangle className="h-4 w-4" />
                          Complaints console
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">Investigate and resolve reports</h2>
                          <p className="text-sm text-muted-foreground max-w-2xl">
                            Filter by status, drill into details, and update outcomes without leaving the dashboard.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-white/70 dark:bg-gray-900/50">
                            Pending: {stats?.pendingComplaints ?? "--"}
                          </Badge>
                          <Badge variant="outline" className="bg-white/70 dark:bg-gray-900/50">
                            Showing: {complaints.length}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-start">
                        {(["ALL", "PENDING", "INVESTIGATING", "RESOLVED", "DISMISSED"] as (ComplaintStatus | "ALL")[]).map(
                          (status) => {
                            const isActive = complaintStatusFilter === status
                            const label = status === "ALL" ? "All" : complaintStatusMeta[status as ComplaintStatus].label
                            return (
                              <Button
                                key={status}
                                size="sm"
                                variant={isActive ? "default" : "outline"}
                                className={isActive ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                                onClick={() => {
                                  setComplaintStatusFilter(status)
                                  setComplaintsPage(0)
                                }}
                              >
                                {label}
                              </Button>
                            )
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 }}
                  {...cardHover}
                  className="w-full"
                >
                  <Card className="rounded-2xl shadow-sm bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl border border-border/60 overflow-hidden">
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-xl">Complaints & Reports</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          See what users are flagging and move them along the investigation flow.
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Live updates
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {complaintsLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Spinner size={18} /> Loading complaints...
                        </div>
                      )}
                      {!complaintsLoading && complaints.length === 0 && (
                        <p className="text-sm text-muted-foreground">No complaints to review right now.</p>
                      )}
                      <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-4">
                        {!complaintsLoading &&
                          complaints.map((c, idx) => {
                            const filedAt = formatDateTime(c.createdAt)
                            const statusKey = (c.status as ComplaintStatus) || "PENDING"
                            const statusMeta = complaintStatusMeta[statusKey]
                            const priorityKey = (c.priority as ComplaintPriority) || "MEDIUM"
                            const priorityClass = priorityMeta[priorityKey]
                            const reporterName = c.complainantName || "Unknown reporter"
                            const relatedListing = c.propertyTitle

                            return (
                              <motion.div
                                key={c.id}
                                variants={rowVariants}
                                custom={idx}
                                className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-orange-50/70 via-white to-teal-50/50 dark:from-gray-900/70 dark:via-gray-900/75 dark:to-gray-800/70 backdrop-blur-xl border border-orange-100/60 dark:border-orange-500/20 shadow-md hover:shadow-xl transition-all ring-1 ring-white/60 dark:ring-white/5"
                                whileHover={{ y: -3, scale: 1.003 }}
                              >
                                <span className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-orange-200/30 blur-3xl" />
                                <span className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-200/30 blur-3xl" />
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                  <div className="flex flex-wrap gap-2 items-center min-w-0">
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                      {c.complaintType?.replace(/_/g, " ") || "Complaint"}
                                    </Badge>
                                    <Badge variant="outline" className={statusMeta.badge}>
                                      <statusMeta.icon className="h-4 w-4 mr-1" />
                                      {statusKey}
                                    </Badge>
                                    <Badge variant="outline" className={priorityClass}>
                                      <Flag className="h-3.5 w-3.5 mr-1" />
                                      {priorityKey} priority
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-white/80 dark:bg-gray-900/60 border-border/70">
                                      ID: {c.id?.slice(0, 8)}
                                    </Badge>
                                    <Button variant="ghost" size="sm" onClick={() => openComplaintDetails(c)} className="bg-white/70 dark:bg-gray-900/60 border border-transparent hover:border-orange-200">
                                      Review details <ArrowRight className="h-4 w-4 ml-1" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-3 space-y-2">
                                  <p className="text-lg font-semibold text-foreground break-words">
                                    {c.subject || "Complaint"}
                                  </p>
                                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                    {c.description || "No description provided."}
                                  </p>
                                </div>
                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                  <div className="rounded-xl bg-white/80 dark:bg-gray-900/70 border border-border/70 p-3 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.4)] min-w-0">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80 flex items-center gap-1">
                                      <UserCheck className="h-3.5 w-3.5" /> Reporter
                                    </p>
                                    <p className="text-sm font-medium text-foreground">{reporterName}</p>
                                    {c.complainantId && <p className="text-[11px] text-muted-foreground">ID: {c.complainantId}</p>}
                                  </div>
                                  <div className="rounded-xl bg-white/80 dark:bg-gray-900/70 border border-border/70 p-3 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.4)] min-w-0">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80 flex items-center gap-1">
                                      <Building className="h-3.5 w-3.5" /> Listing
                                    </p>
                                    <p className="text-sm font-medium text-foreground break-words">
                                      {relatedListing || "Not linked"}
                                    </p>
                                    {c.propertyId && (
                                      <Link
                                        href={`/listing/${c.propertyId}`}
                                        className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700"
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        View listing <ExternalLink className="h-3 w-3" />
                                      </Link>
                                    )}
                                  </div>
                                  <div className="rounded-xl bg-white/80 dark:bg-gray-900/70 border border-border/70 p-3 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.4)] min-w-0">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80 flex items-center gap-1">
                                      <Clock3 className="h-3.5 w-3.5" /> Timeline
                                    </p>
                                    <p className="text-sm font-medium text-foreground">Filed: {filedAt}</p>
                                    {c.resolvedAt && <p className="text-xs text-muted-foreground">Resolved: {formatDateTime(c.resolvedAt)}</p>}
                                  </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {statusKey !== "INVESTIGATING" && statusKey !== "RESOLVED" && statusKey !== "DISMISSED" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleComplaintStatusChange(c, "INVESTIGATING")}
                                      disabled={complaintActionLoading === c.id}
                                    >
                                      {complaintActionLoading === c.id ? <Spinner size={16} /> : <CircleDot className="h-4 w-4 mr-1" />}
                                      Start investigating
                                    </Button>
                                  )}
                                  {statusKey !== "RESOLVED" && (
                                    <Button
                                      size="sm"
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                      onClick={() => handleComplaintStatusChange(c, "RESOLVED")}
                                      disabled={complaintActionLoading === c.id}
                                    >
                                      {complaintActionLoading === c.id ? <Spinner size={16} /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                                      Mark resolved
                                    </Button>
                                  )}
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
                            disabled={complaintsLoadingMore}
                            className="min-w-[180px]"
                          >
                            {complaintsLoadingMore ? <Spinner size={16} /> : "Load more"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </CardContent>
            </Card>

            {selectedComplaint && (
              <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 backdrop-blur-sm px-4 py-6 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-5xl"
                >
                  <Card className="rounded-2xl shadow-2xl border border-border/70 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl max-h-[88vh] overflow-y-auto">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-orange-500 font-semibold">Complaint detail</p>
                        <h3 className="text-2xl font-bold text-foreground break-words">
                          {selectedComplaint.subject || "Complaint"}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className={complaintStatusMeta[(selectedComplaint.status as ComplaintStatus) || "PENDING"].badge}>
                            <CircleDot className="h-4 w-4 mr-1" />
                            {selectedComplaint.status || "PENDING"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={priorityMeta[(selectedComplaint.priority as ComplaintPriority) || "MEDIUM"]}
                          >
                            <Flag className="h-3.5 w-3.5 mr-1" />
                            {(selectedComplaint.priority as ComplaintPriority) || "MEDIUM"}
                          </Badge>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {selectedComplaint.complaintType?.replace(/_/g, " ") || "Complaint"}
                          </Badge>
                          <Badge variant="outline" className="bg-white/70 dark:bg-gray-900/70 border-border/60">
                            ID: {selectedComplaint.id?.slice(0, 8)}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedComplaint(null)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </CardHeader>
                    <CardContent className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="space-y-3">
                        <div className="rounded-xl border border-border/70 bg-white/70 dark:bg-gray-900/70 p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" /> Summary
                          </div>
                          <p className="text-lg font-semibold text-foreground mt-1">{selectedComplaint.subject || "—"}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                            {selectedComplaint.description || "No description provided."}
                          </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border border-border/70 bg-gray-50 dark:bg-gray-900/70 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">Reporter</p>
                            <p className="font-medium text-foreground">{selectedComplaint.complainantName || "Unknown"}</p>
                            {selectedComplaint.complainantId && (
                              <p className="text-xs text-muted-foreground break-all">
                                ID: {selectedComplaint.complainantId}
                              </p>
                            )}
                          </div>
                          <div className="rounded-lg border border-border/70 bg-gray-50 dark:bg-gray-900/70 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">Property / Landlord</p>
                            <p className="font-medium text-foreground break-words">
                              {selectedComplaint.propertyTitle || "No property attached"}
                            </p>
                            {selectedComplaint.landlordName && (
                              <p className="text-xs text-muted-foreground">Landlord: {selectedComplaint.landlordName}</p>
                            )}
                            {selectedComplaint.propertyId && (
                              <Link
                                href={`/listing/${selectedComplaint.propertyId}`}
                                className="text-xs text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 mt-1"
                                target="_blank"
                                rel="noreferrer"
                              >
                                View listing <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border border-border/70 bg-gray-50 dark:bg-gray-900/70 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">Filed</p>
                            <p className="text-sm text-foreground">{formatDateTime(selectedComplaint.createdAt)}</p>
                          </div>
                          <div className="rounded-lg border border-border/70 bg-gray-50 dark:bg-gray-900/70 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">Resolved</p>
                            <p className="text-sm text-foreground">
                              {selectedComplaint.resolvedAt ? formatDateTime(selectedComplaint.resolvedAt) : "Not yet"}
                            </p>
                          </div>
                        </div>
                        {selectedComplaint.evidenceUrls && selectedComplaint.evidenceUrls.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">Evidence</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedComplaint.evidenceUrls.map((url, idx) => (
                                <a
                                  key={url + idx}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-2 rounded-lg border border-border/60 bg-white/70 dark:bg-gray-900/70 text-xs text-orange-700 hover:text-orange-800 hover:border-orange-200"
                                >
                                  Link {idx + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedComplaint.resolutionNotes && (
                          <div className="rounded-lg border border-border/70 bg-gray-50 dark:bg-gray-900/70 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">Resolution notes</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{selectedComplaint.resolutionNotes}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-xl border border-border/70 bg-gradient-to-b from-orange-50/80 via-white to-white dark:from-gray-900/70 dark:via-gray-900/80 dark:to-gray-900 p-4 shadow-lg space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">Update status</p>
                              <p className="text-xs text-muted-foreground">
                                Move the complaint forward, set urgency, and leave resolution notes.
                              </p>
                            </div>
                            <Badge variant="outline" className="text-[11px]">
                              {selectedComplaint.id?.slice(0, 8)}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <Select
                              value={complaintForm.status}
                              onValueChange={(value) =>
                                setComplaintForm((prev) => ({ ...prev, status: value as ComplaintStatus }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {(["PENDING", "INVESTIGATING", "RESOLVED", "DISMISSED"] as ComplaintStatus[]).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {complaintStatusMeta[status].label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={complaintForm.priority || "MEDIUM"}
                              onValueChange={(value) =>
                                setComplaintForm((prev) => ({ ...prev, priority: value as ComplaintPriority }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                {(["URGENT", "HIGH", "MEDIUM", "LOW"] as ComplaintPriority[]).map((priority) => (
                                  <SelectItem key={priority} value={priority}>
                                    {priority.charAt(0) + priority.slice(1).toLowerCase()} priority
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Textarea
                              rows={5}
                              placeholder="Add investigation or resolution notes"
                              value={complaintForm.resolutionNotes}
                              onChange={(e) =>
                                setComplaintForm((prev) => ({ ...prev, resolutionNotes: e.target.value }))
                              }
                              className="resize-none"
                            />
                          </div>
                          <div className="flex flex-wrap justify-end gap-2 pt-1">
                            <Button
                              variant="outline"
                              onClick={() => setSelectedComplaint(null)}
                              className="border-border/70"
                            >
                              Close
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleComplaintStatusChange(selectedComplaint, "INVESTIGATING")}
                              disabled={complaintActionLoading === selectedComplaint.id}
                              className="border-blue-200 text-blue-700 hover:text-blue-800"
                            >
                              {complaintActionLoading === selectedComplaint.id ? (
                                <Spinner size={16} />
                              ) : (
                                <CircleDot className="h-4 w-4 mr-1" />
                              )}
                              Move to investigating
                            </Button>
                            <Button
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={handleComplaintSave}
                              disabled={complaintUpdateLoading}
                            >
                              {complaintUpdateLoading ? <Spinner size={16} /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                              Save changes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
    </div>
  )
}
