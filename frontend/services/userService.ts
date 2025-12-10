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
  landlordVerificationStatus?: string
  landlordVerificationNotes?: string | null
  landlordVerificationSubmittedAt?: string | null
  landlordVerificationReviewedAt?: string | null
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

export interface LandlordVerificationPayload {
  citizenshipNumber: string
  citizenshipFrontImage: string
  citizenshipBackImage: string
}

export async function fetchLandlordVerification() {
  const { data } = await axiosInstance.get<ApiResponse<any>>("/users/landlord-verification")
  return data.data
}

export async function submitLandlordVerification(payload: LandlordVerificationPayload) {
  const { data } = await axiosInstance.post<ApiResponse<any>>("/users/landlord-verification", payload)
  return data.data
}

export async function uploadVerificationDocument(file: File, folder = "landlord-verification") {
  const formData = new FormData()
  formData.append("file", file)
  const { data } = await axiosInstance.post<ApiResponse<string>>(`/upload/image?folder=${folder}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  })
  return data.data
}
