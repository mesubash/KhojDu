"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
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

const mockStats = [
  { title: "Total Users", value: "15,247", change: "+12%", icon: Users, color: "text-orange-600" },
  { title: "Active Listings", value: "3,456", change: "+8%", icon: Building, color: "text-green-600" },
  { title: "Messages Today", value: "892", change: "+23%", icon: MessageSquare, color: "text-purple-600" },
  { title: "Revenue", value: "Rs 2,45,000", change: "+15%", icon: TrendingUp, color: "text-teal-600" },
]

const mockUsers = [
  {
    id: 1,
    name: "Ram Sharma",
    email: "ram@example.com",
    role: "Landlord",
    status: "Active",
    joined: "2024-01-15",
    listings: 5,
  },
  {
    id: 2,
    name: "Sita Poudel",
    email: "sita@example.com",
    role: "Tenant",
    status: "Active",
    joined: "2024-02-20",
    listings: 0,
  },
  {
    id: 3,
    name: "Krishna Thapa",
    email: "krishna@example.com",
    role: "Landlord",
    status: "Pending",
    joined: "2024-03-10",
    listings: 2,
  },
  {
    id: 4,
    name: "Maya Gurung",
    email: "maya@example.com",
    role: "Tenant",
    status: "Inactive",
    joined: "2024-01-05",
    listings: 0,
  },
]

const mockListings = [
  {
    id: 1,
    title: "Cozy Room in Thamel",
    landlord: "Ram Sharma",
    status: "Active",
    rent: 15000,
    views: 245,
    created: "2024-03-01",
  },
  {
    id: 2,
    title: "Spacious Flat in Baneshwor",
    landlord: "Krishna Thapa",
    status: "Pending",
    rent: 25000,
    views: 89,
    created: "2024-03-05",
  },
  {
    id: 3,
    title: "Modern House in Lalitpur",
    landlord: "Ram Sharma",
    status: "Active",
    rent: 45000,
    views: 156,
    created: "2024-02-28",
  },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || user.status.toLowerCase() === filterStatus
    return matchesSearch && matchesStatus
  })

  const filteredListings = mockListings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.landlord.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || listing.status.toLowerCase() === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={true} userInfo={{
        name: "Admin User",
        email: "admin@khojdu.com", 
        initials: "A"
      }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
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
                className={`text-sm ${activeTab === tab.id ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="rounded-xl shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-sm text-green-600 dark:text-green-400">{stat.change} from last month</p>
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
                    {mockUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge
                          variant={
                            user.status === "Active" ? "default" : user.status === "Pending" ? "secondary" : "outline"
                          }
                          className={`text-xs ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockListings.slice(0, 5).map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{listing.title}</p>
                          <p className="text-sm text-muted-foreground">by {listing.landlord}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Rs {listing.rent.toLocaleString()}</p>
                          <Badge
                            variant={listing.status === "Active" ? "default" : "secondary"}
                            className={`text-xs ${
                              listing.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {listing.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
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
                <CardTitle className="text-xl">Users ({filteredUsers.length})</CardTitle>
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
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50 dark:hover:bg-muted/20">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="sm:hidden mt-1">
                                <Badge
                                  variant={
                                    user.status === "Active"
                                      ? "default"
                                      : user.status === "Pending"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className={`text-xs ${
                                    user.status === "Active"
                                      ? "bg-green-100 text-green-800"
                                      : user.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {user.status}
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
                              variant={
                                user.status === "Active"
                                  ? "default"
                                  : user.status === "Pending"
                                    ? "secondary"
                                    : "outline"
                              }
                              className={`text-xs ${
                                user.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : user.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{user.joined}</td>
                          <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{user.listings}</td>
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
                <CardTitle className="text-xl">Listings ({filteredListings.length})</CardTitle>
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
                      {filteredListings.map((listing) => (
                        <tr key={listing.id} className="border-b hover:bg-muted/50 dark:hover:bg-muted/20">
                          <td className="p-4">
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-sm text-muted-foreground sm:hidden">by {listing.landlord}</p>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{listing.landlord}</td>
                          <td className="p-4 text-sm font-medium hidden md:table-cell">
                            Rs {listing.rent.toLocaleString()}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{listing.views}</td>
                          <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{listing.created}</td>
                          <td className="p-4">
                            <Badge
                              variant={listing.status === "Active" ? "default" : "secondary"}
                              className={`text-xs ${
                                listing.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {listing.status}
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
                  <span>System Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Reports Coming Soon</h3>
                  <p className="text-muted-foreground">Advanced reporting features will be available in the next update.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
