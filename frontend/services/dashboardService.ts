import axiosInstance from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"
import { getCached, setCached, invalidate } from "@/lib/requestCache"
import type { PropertyListItem } from "@/types/property"

// Shared pagination structure matching backend ApiResponse<PagedResponse<T>>
interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// Admin dashboard stats map
export async function fetchAdminDashboard() {
  const { data } = await axiosInstance.get<ApiResponse<Record<string, any>>>("/admin/dashboard")
  return data.data
}

export interface AdminUser {
  id: string
  email: string
  fullName: string
  phone?: string
  role: string
  profileImageUrl?: string
  isVerified?: boolean
  isActive?: boolean
  createdAt?: string
}

export async function fetchAdminUsers(params: {
  page?: number
  size?: number
  search?: string
  role?: string
  verified?: boolean
  active?: boolean
}) {
  const { page = 0, size = 20, search, role, verified, active } = params
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  })
  if (search) query.set("search", search)
  if (role) query.set("role", role)
  if (verified !== undefined) query.set("verified", String(verified))
  if (active !== undefined) query.set("active", String(active))

  const { data } = await axiosInstance.get<ApiResponse<PagedResponse<AdminUser>>>(`/admin/users?${query.toString()}`)
  return data.data
}

export async function fetchPendingVerifications(page = 0, size = 10) {
  const cacheKey = `admin-verifications-${page}-${size}`
  const cached = getCached<PagedResponse<any>>(cacheKey)
  if (cached) return cached
  const { data } = await axiosInstance.get<ApiResponse<PagedResponse<any>>>(
    `/admin/verifications/pending?page=${page}&size=${size}`
  )
  setCached(cacheKey, data.data, 30_000)
  return data.data
}

export async function fetchAdminProperties(params: { page?: number; size?: number; search?: string; status?: string } = {}) {
  const { page = 0, size = 20, search, status } = params
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  })
  if (search) query.set("search", search)
  if (status) query.set("status", status)

  const { data } = await axiosInstance.get<ApiResponse<PagedResponse<PropertyListItem>>>(`/admin/properties?${query.toString()}`)
  return data.data
}

export async function updateAdminUserRole(userId: string, role: string) {
  const { data } = await axiosInstance.put<ApiResponse<any>>(`/admin/users/${userId}/role?role=${role}`)
  return data.data
}

export async function setAdminUserActive(userId: string, active: boolean) {
  const path = active ? "activate" : "deactivate"
  const { data } = await axiosInstance.put<ApiResponse<any>>(`/admin/users/${userId}/${path}`)
  return data.data
}

export async function deleteAdminUser(userId: string) {
  const { data } = await axiosInstance.delete<ApiResponse<any>>(`/admin/users/${userId}`)
  return data.data
}

export async function verifyAdminUser(userId: string) {
  const { data } = await axiosInstance.put<ApiResponse<any>>(`/admin/users/${userId}/verify`)
  return data.data
}

// Landlord properties list (summary)
export interface LandlordProperty {
  id: string
  title: string
  location?: string
  address?: string
  city?: string
  district?: string
  status?: string
  monthlyRent?: number
  views?: number
  viewCount?: number
  messages?: number
  inquiryCount?: number
  occupancyRate?: number
  rating?: number
  totalReviews?: number
  isAvailable?: boolean
  primaryImageUrl?: string
  image?: string
}

export async function fetchLandlordProperties(params: { page?: number; size?: number } = {}) {
  const { page = 0, size = 10 } = params
  const cacheKey = `landlord-props-${page}-${size}`
  const cached = getCached<PagedResponse<LandlordProperty>>(cacheKey)
  if (cached) return cached
  const { data } = await axiosInstance.get<ApiResponse<PagedResponse<LandlordProperty>>>(
    `/properties/landlord/my-properties?page=${page}&size=${size}`
  )
  setCached(cacheKey, data.data, 30_000)
  return data.data
}

// Tenant wishlist
export interface WishlistItem {
  id: string
  title: string
  location?: string
  address?: string
  city?: string
  district?: string
  rent: number
  status: string
  image?: string
  primaryImageUrl?: string
  averageRating?: number
}

export async function fetchWishlist(params: { page?: number; size?: number } = {}) {
  const { page = 0, size = 10 } = params
  const cacheKey = `wishlist-${page}-${size}`
  const cached = getCached<PagedResponse<WishlistItem>>(cacheKey)
  if (cached) return cached
  const { data } = await axiosInstance.get<ApiResponse<PagedResponse<WishlistItem>>>(
    `/wishlist?page=${page}&size=${size}`
  )
  setCached(cacheKey, data.data, 30_000)
  return data.data
}

// Tenant inquiries
export interface InquiryItem {
  id: string
  propertyId: string
  propertyTitle: string
  status: string
  lastMessage?: string
  updatedAt?: string
}

export async function fetchTenantInquiries(params: { page?: number; size?: number } = {}) {
  const { page = 0, size = 10 } = params
  const cacheKey = `tenant-inquiries-${page}-${size}`
  const cached = getCached<PagedResponse<InquiryItem>>(cacheKey)
  if (cached) return cached
  const { data } = await axiosInstance.get<ApiResponse<PagedResponse<InquiryItem>>>(
    `/inquiries/tenant?page=${page}&size=${size}`
  )
  setCached(cacheKey, data.data, 30_000)
  return data.data
}
