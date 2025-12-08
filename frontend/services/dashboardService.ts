import axiosInstance from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"
import { getCached, setCached, invalidate } from "@/lib/requestCache"

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
  location: string
  rent: number
  status: string
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
