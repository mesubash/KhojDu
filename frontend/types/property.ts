// Property and search related types aligned with backend DTOs

export type PropertyType = "ROOM" | "FLAT" | "HOUSE" | "APARTMENT"

export interface PropertyListItem {
  id: string
  title: string
  propertyType?: PropertyType
  status?: string
  location?: string
  address?: string
  city?: string
  district?: string
  monthlyRent?: number | string
  bedrooms?: number
  bathrooms?: number
  totalArea?: number
  isFurnished?: boolean
  parkingAvailable?: boolean
  isAvailable?: boolean
  isFeatured?: boolean
  createdAt?: string
  primaryImageUrl?: string
  landlordName?: string
  landlordVerified?: boolean
  viewCount?: number
  averageRating?: number
  reviewCount?: number
  keyAmenities?: string[]
  distanceKm?: number
  latitude?: number
  longitude?: number
}

export interface PropertySearchRequest {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: "ASC" | "DESC"
  propertyType?: PropertyType
  city?: string
  minRent?: number
  maxRent?: number
  minBedrooms?: number
  maxBedrooms?: number
  isFurnished?: boolean
  parkingAvailable?: boolean
  petsAllowed?: boolean
  availableOnly?: boolean
  latitude?: number
  longitude?: number
  radiusKm?: number
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PropertyCreatePayload {
  title: string
  description?: string
  propertyType: PropertyType
  address?: string
  city?: string
  district?: string
  wardNumber?: number
  latitude?: number
  longitude?: number
  monthlyRent: number
  securityDeposit?: number
  bedrooms?: number
  bathrooms?: number
  totalArea?: number
  floorNumber?: number
  totalFloors?: number
  isFurnished?: boolean
  parkingAvailable?: boolean
  internetIncluded?: boolean
  utilitiesIncluded?: boolean
  petsAllowed?: boolean
  smokingAllowed?: boolean
  availableFrom?: string
  amenityIds?: string[]
}

export interface PropertyImage {
  id: string
  imageUrl: string
  altText?: string
  isPrimary?: boolean
}

export interface PropertyDetail extends PropertyListItem {
  description?: string
  district?: string
  wardNumber?: number
  securityDeposit?: number
  internetIncluded?: boolean
  utilitiesIncluded?: boolean
  petsAllowed?: boolean
  smokingAllowed?: boolean
  availableFrom?: string
  landlord?: {
    id: string
    fullName: string
    email: string
    phone?: string
    isVerified?: boolean
    profileImageUrl?: string
  }
  images?: PropertyImage[]
  amenities?: Amenity[]
  stats?: {
    viewCount?: number
    inquiryCount?: number
    reviewCount?: number
    averageRating?: number
  }
}

export interface Amenity {
  id: string
  name: string
  icon?: string
  category?: string
}
