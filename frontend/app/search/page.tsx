"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MapPin, Heart, MessageSquare, Grid3X3, List, Loader2 } from "lucide-react"
import Link from "next/link"
import { PropertyMap } from "@/components/property-map"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { fetchCities, searchProperties } from "@/services/propertyService"
import type { PropertyListItem, PropertyType } from "@/types/property"
import { fetchWishlist } from "@/services/dashboardService"
import { addToWishlist, removeFromWishlist } from "@/services/wishlistService"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"

const defaultAreas = [
  "Thamel",
  "Baneshwor",
  "New Baneshwor",
  "Koteshwor",
  "Chabahil",
  "Maharajgunj",
  "Lazimpat",
  "Durbarmarg",
  "Putalisadak",
  "Kalanki",
  "Balaju",
  "Gongabu",
  "Samakhusi",
  "Tokha",
  "Budhanilkantha",
]

const formatPropertyType = (type?: PropertyType) => {
  if (!type) return "Unknown"
  return type.charAt(0) + type.slice(1).toLowerCase()
}

const formatLocation = (property: PropertyListItem) => {
  const parts = [property.city, property.district].filter(Boolean)
  if (parts.length) return parts.join(", ")
  if (property.address) return property.address
  return "Location not specified"
}

const formatRent = (rent?: number | string | null) => {
  if (rent === null || rent === undefined) return "N/A"
  const value = typeof rent === "string" ? Number(rent) : rent
  if (Number.isNaN(value)) return "N/A"
  return `Rs ${value.toLocaleString()}`
}

const getMockCoordinates = (index: number) => {
  const baseLat = 27.7172
  const baseLng = 85.324
  const offset = (index % 5) * 0.01
  return {
    lat: baseLat + offset * (index % 2 === 0 ? 1 : -1),
    lng: baseLng + offset * (index % 3 === 0 ? 1 : -1),
  }
}

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([5000, 50000])
  const [propertyType, setPropertyType] = useState<PropertyType | "all">("all")
  const [selectedArea, setSelectedArea] = useState("all")
  const [areas, setAreas] = useState<string[]>(defaultAreas)
  const [properties, setProperties] = useState<PropertyListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 0, size: 0, totalElements: 0, totalPages: 0 })
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const { isAuthenticated } = useAuth()

  const totalResults = pagination.totalElements || properties.length

  const loadCities = useCallback(async () => {
    try {
      const cities = await fetchCities()
      if (cities.length) {
        setAreas(cities)
      }
    } catch (err) {
      console.warn("[Search] Failed to load cities, using defaults", err)
      setAreas(defaultAreas)
    }
  }, [])

  const fetchListings = useCallback(
    async (page = 0) => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await searchProperties({
          page,
          size: 9,
          propertyType: propertyType !== "all" ? propertyType : undefined,
          city: selectedArea !== "all" ? selectedArea : searchQuery.trim() || undefined,
          minRent: priceRange[0],
          maxRent: priceRange[1],
          availableOnly: true,
        })

        setProperties(data?.content || [])
        setPagination({
          page: data?.page ?? 0,
          size: data?.size ?? 0,
          totalElements: data?.totalElements ?? data?.content?.length ?? 0,
          totalPages: data?.totalPages ?? 0,
        })
      } catch (err) {
        console.error("[Search] Failed to fetch properties", err)
        setError("Could not load properties right now. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [priceRange, propertyType, searchQuery, selectedArea]
  )

  useEffect(() => {
    loadCities()
    fetchListings(0)
  }, [fetchListings, loadCities])

  // Load wishlist when authentication state changes
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set())
      return
    }
    fetchWishlist({ page: 0, size: 50 })
      .then((resp) => setWishlistIds(new Set((resp?.content || []).map((w) => w.id))))
      .catch(() => {})
  }, [isAuthenticated])

  const toggleWishlist = async (propertyId: string) => {
    if (!propertyId) return
    if (!isAuthenticated) {
      // revert immediately and prompt login
      setWishlistIds((prev) => {
        const next = new Set(prev)
        next.delete(propertyId)
        return next
      })
      return
    }
    const isSaved = wishlistIds.has(propertyId)
    setWishlistIds((prev) => {
      const next = new Set(prev)
      if (isSaved) next.delete(propertyId)
      else next.add(propertyId)
      return next
    })
    try {
      if (isSaved) await removeFromWishlist(propertyId)
      else await addToWishlist(propertyId)
    } catch (err) {
      // revert on error
      setWishlistIds((prev) => {
        const next = new Set(prev)
        if (isSaved) next.add(propertyId)
        else next.delete(propertyId)
        return next
      })
    }
  }

  return (
      <div className="page-shell">
          <Header/>

              <div className="container-responsive py-6 sm:py-8">
                  {/* Search and Filters */}
                  <div className="mb-6 sm:mb-8">
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">
                          Find Your Perfect Room
                      </h1>
                      <p className="text-sm text-muted-foreground mb-4">
                          Looking for other renting options?
                          <a
                              href="https://rentle.subashsdhami.com.np"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 ml-1"
                          >
                              rentle.subashsdhami.com.np
                          </a>
                      </p>

                      <motion.div
                          whileHover={{y: -6, boxShadow: "0 15px 40px rgba(0,0,0,0.12)"}}
                          transition={{type: "spring", stiffness: 260, damping: 20}}
                          className="rounded-xl"
                      >
                          <Card className="p-4 sm:p-6 rounded-xl shadow-sm">
                              <div className="space-y-4 sm:space-y-6">
                                  {/* Search Bar */}
                                  <div className="relative">
                                      <Search
                                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5"/>
                                      <Input
                                          placeholder="Search by title or location..."
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-lg bg-white/10 dark:bg-gray-900/20 border border-white/15 dark:border-white/10 shadow-sm backdrop-blur-xl placeholder:text-muted-foreground/30 placeholder:font-light transition-all focus:bg-white/80 dark:focus:bg-gray-900/70 focus:backdrop-blur-2xl focus:ring-2 focus:ring-orange-300/70 focus:border-orange-300/70"/>
                                  </div>

                                  {/* Filters Row */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                      <div>
                                          <label className="block text-sm font-medium text-foreground mb-2">Property
                                              Type</label>
                                          <Select value={propertyType}
                                                  onValueChange={(value) => setPropertyType(value as PropertyType | "all")}>
                                              <SelectTrigger
                                                  className="h-10 sm:h-12 bg-white/10 dark:bg-gray-900/20 border border-white/15 dark:border-white/10 shadow-sm backdrop-blur-xl transition-all focus:ring-2 focus:ring-orange-300/70 focus:border-orange-300/70">
                                                  <SelectValue placeholder="All Types"/>
                                              </SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="all">All Types</SelectItem>
                                                  <SelectItem value="ROOM">Room</SelectItem>
                                                  <SelectItem value="FLAT">Flat</SelectItem>
                                                  <SelectItem value="HOUSE">House</SelectItem>
                                                  <SelectItem value="APARTMENT">Apartment</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </div>

                                      <div>
                                          <label className="block text-sm font-medium text-foreground mb-2">Kathmandu
                                              Area</label>
                                          <Select value={selectedArea} onValueChange={setSelectedArea}>
                                              <SelectTrigger
                                                  className="h-10 sm:h-12 bg-white/10 dark:bg-gray-900/20 border border-white/15 dark:border-white/10 shadow-sm backdrop-blur-xl transition-all focus:ring-2 focus:ring-orange-300/70 focus:border-orange-300/70">
                                                  <SelectValue placeholder="All Areas"/>
                                              </SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="all">All Areas</SelectItem>
                                                  {areas.map((area) => (
                                                      <SelectItem key={area} value={area}>
                                                          {area}
                                                      </SelectItem>
                                                  ))}
                                              </SelectContent>
                                          </Select>
                                      </div>

                                      <div className="sm:col-span-2 lg:col-span-1">
                                          <label className="block text-sm font-medium text-foreground mb-2">
                                              Budget: Rs {priceRange[0].toLocaleString()} -
                                              Rs {priceRange[1].toLocaleString()}
                                          </label>
                                          <div
                                              className="px-3 pt-3 pb-4 bg-white/10 dark:bg-gray-900/20 border border-white/15 dark:border-white/10 rounded-lg shadow-sm backdrop-blur-xl">
                                              <Slider
                                                  value={priceRange}
                                                  onValueChange={setPriceRange}
                                                  max={50000}
                                                  min={1}
                                                  step={500}
                                                  className="w-full data-[orientation=horizontal]:h-3 [&>[role=slider]]:h-5 [&>[role=slider]]:w-5 [&>[role=slider]]:border-2 [&>[role=slider]]:border-orange-500 [&>[role=slider]]:bg-white [&>[role=slider]]:shadow-lg [&_[data-orientation=horizontal]]:bg-orange-200/60 [&_[data-orientation=horizontal]]:dark:bg-orange-900/40"/>
                                              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                                  <span>Rs {priceRange[0].toLocaleString()}</span>
                                                  <span>Rs {priceRange[1].toLocaleString()}</span>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="flex justify-end">
                                          <Button
                                              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                                              onClick={() => fetchListings(0)}
                                              disabled={isLoading}
                                          >
                                              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> :
                                                  <Search className="h-4 w-4 mr-2"/>}
                                              Search Properties
                                          </Button>
                                      </div>
                                  </div>
                              </div>
                          </Card>
                      </motion.div>
              </div>

              {error && (
                  <Alert variant="destructive" className="mb-4 sm:mb-6">
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}

              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                  <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                          {isLoading ? "Loading properties..." : `${totalResults} Properties Found`}
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground">Results based on your search
                          criteria</p>
                  </div>

                  <div className="flex items-center space-x-2">
                      <Button
                          variant={viewMode === "grid" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className={viewMode === "grid" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                      >
                          <Grid3X3 className="h-4 w-4"/>
                      </Button>
                      <Button
                          variant={viewMode === "list" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className={viewMode === "list" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                      >
                          <List className="h-4 w-4"/>
                      </Button>
                      <Button
                          variant={viewMode === "map" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode("map")}
                          className={viewMode === "map" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                      >
                          <MapPin className="h-4 w-4"/>
                      </Button>
                  </div>
              </div>

              {/* Map View Toggle */}
              {viewMode === "map" && (
                  <div className="mb-6">
                      <Card className="rounded-xl shadow-sm">
                          <CardContent className="p-2 sm:p-4">
                              <PropertyMap
                                  properties={properties.map((listing, index) => ({
                                      id: listing.id,
                                      title: listing.title,
                                      price: typeof listing.monthlyRent === "string" ? Number(listing.monthlyRent) : listing.monthlyRent,
                                      location: formatLocation(listing),
                                      coordinates: getMockCoordinates(index),
                                  }))}/>
                          </CardContent>
                      </Card>
                  </div>
              )}

              {/* Listings Grid */}
              {viewMode !== "map" && (
                  <div
                      className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" : "space-y-4"}
                  >
                      {isLoading && properties.length === 0 ? (
                          <div className="col-span-full text-center text-muted-foreground py-8">
                              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2"/>
                              <p>Loading properties...</p>
                          </div>
                      ) : (
                          properties.map((listing, index) => {
                              const amenities = listing.keyAmenities || []
                              const rentLabel = formatRent(listing.monthlyRent)
                              const locationLabel = formatLocation(listing)

                              return (
                                  <Card
                                      key={listing.id || index}
                                      className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${viewMode === "list" ? "flex flex-col sm:flex-row" : ""}`}
                                  >
                                      <div className={viewMode === "list" ? "sm:w-80 sm:flex-shrink-0" : ""}>
                                          <div className="relative">
                                              <img
                                                  src={listing.primaryImageUrl || "/placeholder.svg"}
                                                  alt={listing.title}
                                                  className={`object-cover ${viewMode === "list" ? "w-full h-48 sm:h-full" : "w-full h-48"}`}/>
                                              {listing.isFeatured && (
                                                  <Badge
                                                      className="absolute top-3 left-3 bg-orange-500 hover:bg-orange-600 text-white text-xs">
                                                      Featured
                                                  </Badge>
                                              )}
                                              <button
                                                  className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${wishlistIds.has(listing.id) ? "bg-red-50 text-red-500" : "bg-white/80 text-muted-foreground"}`}
                                                  onClick={() => toggleWishlist(listing.id)}
                                                  aria-label={wishlistIds.has(listing.id) ? "Remove from wishlist" : "Add to wishlist"}
                                              >
                                                  <Heart
                                                      className={`h-4 w-4 ${wishlistIds.has(listing.id) ? "fill-current" : ""}`}/>
                                              </button>
                                          </div>
                                      </div>

                                      <CardContent className={`p-3 sm:p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                                          <div className="flex items-start justify-between mb-2">
                                              <div className="min-w-0 flex-1">
                                                  <h3 className="font-semibold text-foreground text-base sm:text-lg truncate">
                                                      {listing.title}
                                                  </h3>
                                                  <div
                                                      className="flex items-center text-xs sm:text-sm text-muted-foreground mt-1">
                                                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0"/>
                                                      <span className="truncate">{locationLabel}</span>
                                                  </div>
                                              </div>
                                              <Badge variant="outline"
                                                     className="text-orange-600 border-orange-600 ml-2 text-xs">
                                                  {formatPropertyType(listing.propertyType)}
                                              </Badge>
                                          </div>

                                          <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-3">
                                              {rentLabel}
                                              <span
                                                  className="text-xs sm:text-sm font-normal text-muted-foreground">/month</span>
                                          </div>

                                          <div className="flex flex-wrap gap-1 mb-4">
                                              {amenities.slice(0, 3).map((amenity) => (
                                                  <Badge key={amenity} variant="secondary" className="text-xs">
                                                      {amenity}
                                                  </Badge>
                                              ))}
                                              {amenities.length > 3 && (
                                                  <Badge variant="secondary" className="text-xs">
                                                      +{amenities.length - 3} more
                                                  </Badge>
                                              )}
                                          </div>

                                          <div
                                              className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                              <Link href={`/listing/${listing.id}`} className="flex-1">
                                                  <Button
                                                      className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm">
                                                      View Details
                                                  </Button>
                                              </Link>
                                              <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent sm:w-auto"
                                              >
                                                  <MessageSquare className="h-4 w-4"/>
                                              </Button>
                                          </div>
                                      </CardContent>
                                  </Card>
                              )
                          })
                      )}
                  </div>
              )}

              {!isLoading && !error && properties.length === 0 && (
                  <div className="text-center py-12">
                      <Search className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4"/>
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No properties found</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">Try adjusting your search criteria</p>
                  </div>
              )}
          </div>
          <Footer/>
    </div>
  )
}
