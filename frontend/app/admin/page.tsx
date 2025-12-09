"use client"

import { useEffect, useState } from "react"
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
  AdminUser,
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
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [stats, setStats] = useState<Record<string, any> | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [usersData, setUsersData] = useState<AdminUser[]>([])
  const [propertiesData, setPropertiesData] = useState<PropertyListItem[]>([])
  const [verifications, setVerifications] = useState<any[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace("/auth/login?redirect=/admin")
      return
    }

    if (user && user.role !== UserRole.ADMIN) {
      router.replace(getDashboardRouteForRole(user.role))
    }
  }, [isAuthenticated, isLoading, router, user])

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
    const load = async () => {
      try {
        setListLoading(true)
        setListError(null)
        if (activeTab === "users") {
          const params: any = { page: 0, size: 10, search: searchQuery || undefined }
          if (filterStatus === "active") params.active = true
          if (filterStatus === "inactive") params.active = false
          if (filterStatus === "pending") params.verified = false
          const response = await fetchAdminUsers(params)
          setUsersData(response?.content || [])
        } else if (activeTab === "listings") {
          const params: any = { page: 0, size: 10, search: searchQuery || undefined }
          if (filterStatus === "active") params.status = "APPROVED"
          if (filterStatus === "pending") params.status = "PENDING"
          if (filterStatus === "inactive") params.status = "REJECTED"
          const response = await fetchAdminProperties(params)
          setPropertiesData(response?.content || [])
        } else if (activeTab === "reports") {
          const response = await fetchPendingVerifications(0, 10)
          setVerifications(response?.content || [])
        }
      } catch (err) {
        console.error("[AdminDashboard] Failed to load list data", err)
        setListError("Could not load data for this tab.")
      } finally {
        setListLoading(false)
      }
    }
    load()
  }, [activeTab, filterStatus, searchQuery, isAuthenticated])

  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.role !== UserRole.ADMIN) {
    return null
  }

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers ?? "--", icon: Users, color: "text-orange-600" },
    { title: "Active Listings", value: stats?.totalProperties ?? "--", icon: Building, color: "text-green-600" },
    { title: "Featured", value: stats?.featuredProperties ?? "--", icon: TrendingUp, color: "text-teal-600" },
    { title: "Complaints", value: stats?.pendingComplaints ?? "--", icon: AlertTriangle, color: "text-red-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      <div className="container-responsive py-10 space-y-8">
        {/* Page Intro */}
        <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-orange-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-orange-500 font-medium">Admin Control</p>
              <h1 className="text-3xl font-bold text-foreground">Platform Dashboard</h1>
              <p className="text-muted-foreground">Monitor users, listings, and reports in one place.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { id: "overview", label: "Overview" },
                { id: "users", label: "Users" },
                { id: "listings", label: "Listings" },
                { id: "reports", label: "Reports" },
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statCards.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={index} className="rounded-xl shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">{stat.title}</p>
                              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            </div>
                            <Icon className={`h-8 w-8 ${stat.color}`} />
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
                  <CardTitle className="text-xl">Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {listLoading && <p className="text-sm text-muted-foreground">Loading users...</p>}
                    {!listLoading && usersData.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
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
                      </div>
                    ))}
                    {!listLoading && usersData.length === 0 && (
                      <p className="text-sm text-muted-foreground">No users found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {listLoading && <p className="text-sm text-muted-foreground">Loading listings...</p>}
                    {!listLoading && propertiesData.slice(0, 5).map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between">
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
                      </div>
                    ))}
                    {!listLoading && propertiesData.length === 0 && (
                      <p className="text-sm text-muted-foreground">No listings found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48">
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
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Users ({usersData.length})</CardTitle>
              {listError && <p className="text-sm text-red-600">{listError}</p>}
            </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b">
                      <tr>
                        <th className="text-left p-4 font-medium text-foreground text-sm">User</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm hidden sm:table-cell">Role</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm hidden md:table-cell">Status</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm hidden lg:table-cell">Joined</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm hidden lg:table-cell">
                          Listings
                        </th>
                        <th className="text-left p-4 font-medium text-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50 dark:hover:bg-muted/20">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="sm:hidden mt-1">
                                <Badge
                                  variant={user.isActive ? "default" : "secondary"}
                                  className={`text-xs ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <Badge
                              variant={user.isActive ? "default" : "secondary"}
                              className={`text-xs ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                            {user.isVerified ? "Verified" : "Unverified"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!listLoading && usersData.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-4 text-sm text-muted-foreground">
                            No users found for the current filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search listings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48">
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
              </CardContent>
            </Card>

            {/* Listings Table */}
            <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Listings ({propertiesData.length})</CardTitle>
              {listError && <p className="text-sm text-red-600">{listError}</p>}
            </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b">
                      <tr>
                        <th className="text-left p-4 font-medium text-foreground text-sm">Property</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm hidden sm:table-cell">
                          Landlord
                        </th>
                        <th className="text-left p-4 font-medium text-foreground text-sm hidden md:table-cell">Rent</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm hidden lg:table-cell">Views</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm hidden lg:table-cell">
                          Created
                        </th>
                        <th className="text-left p-4 font-medium text-foreground text-sm">Status</th>
                        <th className="text-left p-4 font-medium text-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertiesData.map((listing) => (
                        <tr key={listing.id} className="border-b hover:bg-muted/50 dark:hover:bg-muted/20">
                          <td className="p-4">
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-sm text-muted-foreground sm:hidden">by {listing.landlordName || "Unknown"}</p>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">
                            {listing.landlordName || "—"}
                          </td>
                          <td className="p-4 text-sm font-medium hidden md:table-cell">
                            Rs {(Number(listing.monthlyRent) || 0).toLocaleString()}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                            {listing.viewCount ?? "—"}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                            {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-4">
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
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!listLoading && propertiesData.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-4 text-sm text-muted-foreground">
                            No listings found for the current filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>Pending Verifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {listLoading && <p className="text-sm text-muted-foreground">Loading verifications...</p>}
                {!listLoading && verifications.length === 0 && (
                  <p className="text-sm text-muted-foreground">No pending verifications right now.</p>
                )}
                <div className="space-y-3">
                  {verifications.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border border-border rounded-lg p-4">
                      <div>
                        <p className="font-medium text-foreground">{item.user?.fullName || "Unknown user"}</p>
                        <p className="text-sm text-muted-foreground">{item.user?.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">Submitted: {item.submittedAt || "—"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">PENDING</Badge>
                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
