export interface SearchPreference {
  id: string
  name: string
  propertyType?: string | null
  city?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  minBedrooms?: number | null
  maxBedrooms?: number | null
  notifyNewMatches?: boolean
  notifyPriceDrops?: boolean
}

export interface SearchPreferencePayload {
  name: string
  propertyType?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  notifyNewMatches?: boolean
  notifyPriceDrops?: boolean
}
