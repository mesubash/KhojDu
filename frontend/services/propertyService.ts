import axiosInstance from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"
import type {
  PagedResponse,
  PropertyCreatePayload,
  PropertyListItem,
  PropertyDetail,
  PropertySearchRequest,
} from "@/types/property"
import type { Review, ReviewSummary } from "@/types/review"
import type { Amenity } from "@/types/property"
import { getCached, setCached } from "@/lib/requestCache"
import { invalidate } from "@/lib/requestCache"

// Search properties using backend search endpoint
export async function searchProperties(params: PropertySearchRequest = {}) {
  const payload: PropertySearchRequest = {
    page: params.page ?? 0,
    size: params.size ?? 12,
    sortBy: params.sortBy ?? "createdAt",
    sortDirection: params.sortDirection ?? "DESC",
    availableOnly: params.availableOnly ?? true,
    ...params,
  }

  const cacheKey = `search-${JSON.stringify(payload)}`
  const cached = getCached<PagedResponse<PropertyListItem>>(cacheKey)
  if (cached) return cached
  const { data } = await axiosInstance.post<ApiResponse<PagedResponse<PropertyListItem>>>(
    "/search/properties",
    payload
  )

  setCached(cacheKey, data.data, 30_000)
  return data.data
}

// Fetch list of cities that have properties
export async function fetchCities(): Promise<string[]> {
  const cacheKey = "search-cities"
  const cached = getCached<string[]>(cacheKey)
  if (cached) return cached
  const { data } = await axiosInstance.get<ApiResponse<string[]>>("/search/cities")
  setCached(cacheKey, data.data || [], 300_000) // 5 minutes
  return data.data || []
}

// Public featured properties (no auth required)
export async function fetchFeaturedProperties(limit = 6): Promise<PropertyListItem[]> {
  const cacheKey = `featured-${limit}`
  const cached = getCached<PropertyListItem[]>(cacheKey)
  if (cached) return cached
  const { data } = await axiosInstance.get<ApiResponse<PropertyListItem[]>>(`/search/featured?limit=${limit}`)
  setCached(cacheKey, data.data || [], 60_000)
  return data.data || []
}

// Create a new property listing
export async function createProperty(payload: PropertyCreatePayload) {
  const { data } = await axiosInstance.post<ApiResponse<any>>("/properties", payload)
  return data.data
}

// Get a single property detail (public)
export async function fetchProperty(id: string): Promise<PropertyDetail> {
  const cacheKey = `property-${id}`
  const cached = getCached<PropertyDetail>(cacheKey)
  if (cached) return cached
  const { data } = await axiosInstance.get<ApiResponse<PropertyDetail>>(`/properties/${id}`)
  if (!data.data) {
    throw new Error("Property not found")
  }
  setCached(cacheKey, data.data, 60_000)
  return data.data
}

export async function deleteProperty(id: string) {
  const { data } = await axiosInstance.delete<ApiResponse<any>>(`/properties/${id}`)
  return data.data
}

export async function togglePropertyAvailability(id: string) {
  const { data } = await axiosInstance.put<ApiResponse<any>>(`/properties/${id}/toggle-availability`)
  return data.data
}

export async function updateProperty(id: string, payload: Partial<PropertyCreatePayload>) {
  const { data } = await axiosInstance.put<ApiResponse<any>>(`/properties/${id}`, payload)
  return data.data
}

export async function fetchLandlordProperty(id: string): Promise<PropertyDetail> {
  const { data } = await axiosInstance.get<ApiResponse<PropertyDetail>>(`/properties/landlord/${id}`)
  if (!data.data) {
    throw new Error("Property not found")
  }
  return data.data
}

export async function uploadPropertyImages(id: string, files: File[]) {
  // Upload in smaller batches to avoid large payload timeouts
  const uploaded: string[] = []
  const chunkSize = 1
  for (let i = 0; i < files.length; i += chunkSize) {
    const formData = new FormData()
    files.slice(i, i + chunkSize).forEach((file) => formData.append("images", file))
    const { data } = await axiosInstance.post<ApiResponse<string[]>>(`/properties/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000, // extend for large uploads
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })
    if (data.data) {
      uploaded.push(...data.data)
    }
  }
  return uploaded
}

export async function fetchAmenities(): Promise<Amenity[]> {
  const { data } = await axiosInstance.get<ApiResponse<Amenity[]>>("/amenities")
  return data.data || []
}

export async function fetchPropertyReviews(propertyId: string, page = 0, size = 10) {
  const { data } = await axiosInstance.get<ApiResponse<PagedResponse<Review>>>(
    `/reviews/property/${propertyId}?page=${page}&size=${size}`
  )
  return data.data
}

export async function fetchPropertyReviewSummary(propertyId: string) {
  const { data } = await axiosInstance.get<ApiResponse<ReviewSummary>>(`/reviews/property/${propertyId}/summary`)
  return data.data
}

export async function submitReview(propertyId: string, payload: { rating: number; reviewText?: string; stayDurationMonths?: number }) {
  const { data } = await axiosInstance.post<ApiResponse<any>>(`/reviews`, { propertyId, ...payload })
  invalidate(`property-${propertyId}`) // force refetch detail cache
  invalidate(`reviews-${propertyId}-0-10`)
  return data.data
}

export async function fetchMyReviews(page = 0, size = 10) {
  const cacheKey = `my-reviews-${page}-${size}`
  const cached = getCached<PagedResponse<Review>>(cacheKey)
  if (cached) return cached
  const { data } = await axiosInstance.get<ApiResponse<PagedResponse<Review>>>(`/reviews/me?page=${page}&size=${size}`)
  setCached(cacheKey, data.data, 30_000)
  return data.data
}
