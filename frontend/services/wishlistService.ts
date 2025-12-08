import axiosInstance from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"

export async function addToWishlist(propertyId: string) {
  const { data } = await axiosInstance.post<ApiResponse<any>>(`/wishlist/${propertyId}`)
  return data.data
}

export async function removeFromWishlist(propertyId: string) {
  const { data } = await axiosInstance.delete<ApiResponse<any>>(`/wishlist/${propertyId}`)
  return data.data
}

export async function checkWishlist(propertyId: string) {
  const { data } = await axiosInstance.get<ApiResponse<boolean>>(`/wishlist/${propertyId}/check`)
  return data.data
}
