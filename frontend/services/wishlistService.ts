import axiosInstance from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"
import { getCached, setCached, invalidate } from "@/lib/requestCache"

export async function addToWishlist(propertyId: string) {
  const { data } = await axiosInstance.post<ApiResponse<any>>(`/wishlist/${propertyId}`)
  invalidate(`wishlist-check-${propertyId}`)
  return data.data
}

export async function removeFromWishlist(propertyId: string) {
  const { data } = await axiosInstance.delete<ApiResponse<any>>(`/wishlist/${propertyId}`)
  invalidate(`wishlist-check-${propertyId}`)
  return data.data
}

export async function checkWishlist(propertyId: string) {
  const cacheKey = `wishlist-check-${propertyId}`
  const cached = getCached<boolean>(cacheKey)
  if (cached !== null) return cached
  try {
    const { data } = await axiosInstance.get<ApiResponse<boolean>>(`/wishlist/${propertyId}/check`)
    setCached(cacheKey, data.data, 60_000) // 1 minute TTL
    return data.data
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 401 || status === 403 || status === 404) {
      setCached(cacheKey, false, 30_000)
      return false
    }
    throw err
  }
}
