export interface ReviewSummary {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
  cleanlinessAverage?: number
  locationAverage?: number
  valueAverage?: number
  landlordAverage?: number
}

export interface Review {
  id: string
  propertyId: string
  propertyTitle?: string
  tenantId?: string
  tenantName?: string
  tenantProfileImage?: string
  overallRating: number
  cleanlinessRating?: number
  locationRating?: number
  valueRating?: number
  landlordRating?: number
  reviewText?: string
  pros?: string
  cons?: string
  isVerified?: boolean
  stayDurationMonths?: number
  createdAt?: string
  updatedAt?: string
}
