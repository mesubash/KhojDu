import axiosInstance from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"
import type { PropertyListItem } from "@/types/property"
import type { InquiryItem } from "@/services/dashboardService"

export interface TenantDashboardSummary {
  wishlistCount: number
  inquiryCount: number
  recentWishlist: PropertyListItem[]
  recentInquiries: InquiryItem[]
}

export async function fetchTenantDashboard() {
  const { data } = await axiosInstance.get<ApiResponse<TenantDashboardSummary>>("/tenant/dashboard")
  return data.data
}
