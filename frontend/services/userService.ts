import axiosInstance from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"
import type { PropertyType } from "@/types/property"

export interface UserProfile {
  id: string
  email: string
  fullName: string
  phone?: string
  role: string
  profileImageUrl?: string
  isVerified?: boolean
  dateOfBirth?: string
  occupation?: string
  createdAt?: string
  bio?: string
  preferredLocation?: string
  budgetMin?: number
  budgetMax?: number
  preferredPropertyType?: PropertyType
  familySize?: number
  hasPets?: boolean
  smokingAllowed?: boolean
  drinkingAllowed?: boolean
}

export interface UserProfileUpdatePayload {
  fullName?: string
  phone?: string
  dateOfBirth?: string
  occupation?: string
  bio?: string
  preferredLocation?: string
  budgetMin?: number
  budgetMax?: number
  preferredPropertyType?: PropertyType
  familySize?: number
  hasPets?: boolean
  smokingAllowed?: boolean
  drinkingAllowed?: boolean
}

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await axiosInstance.get<ApiResponse<UserProfile>>("/users/profile")
  if (!data.data) {
    throw new Error("Profile not found")
  }
  return data.data
}

export async function updateProfile(payload: UserProfileUpdatePayload): Promise<UserProfile> {
  const { data } = await axiosInstance.put<ApiResponse<UserProfile>>("/users/profile", payload)
  if (!data.data) {
    throw new Error("Profile not found")
  }
  return data.data
}
