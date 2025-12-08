import axiosInstance from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"
import type { PropertyListItem } from "@/types/property"
import type { InquiryItem } from "@/services/dashboardService"
import { getCached, setCached } from "@/lib/requestCache"

export interface TenantDashboardSummary {
  wishlistCount: number
  inquiryCount: number
  recentWishlist: PropertyListItem[]
  recentInquiries: InquiryItem[]
}

export async function fetchTenantDashboard() {
  const cacheKey = "tenant-dashboard"
  const cached = getCached<TenantDashboardSummary>(cacheKey)
  if (cached) return cached
  const { data } = await axiosInstance.get<ApiResponse<TenantDashboardSummary>>("/tenant/dashboard")
  setCached(cacheKey, data.data, 60_000) // 1 minute TTL
  return data.data
}
