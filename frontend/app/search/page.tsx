"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Heart, MessageSquare, Grid3X3, List } from "lucide-react"
import Link from "next/link"
import { PropertyMap } from "@/components/property-map"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const kathmanduAreas = [
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

const mockListings = [
  {
    id: 1,
    title: "Cozy Room in Thamel",
    type: "Room",
    rent: 15000,
    location: "Thamel, Kathmandu",
    image: "/placeholder.svg?height=250&width=400",
    amenities: ["Wi-Fi", "Water", "Security"],
    featured: true,
  },
  {
    id: 2,
    title: "Spacious Flat in Baneshwor",
    type: "Flat",
    rent: 25000,
    location: "Baneshwor, Kathmandu",
    image: "/placeholder.svg?height=250&width=400",
    amenities: ["Wi-Fi", "Parking", "Water", "Power"],
    featured: false,
  },
  {
    id: 3,
    title: "Modern House in Lazimpat",
    type: "House",
    rent: 45000,
    location: "Lazimpat, Kathmandu",
    image: "/placeholder.svg?height=250&width=400",
    amenities: ["Wi-Fi", "Parking", "Water", "Power", "Security"],
    featured: true,
  },
  {
    id: 4,
    title: "Student Room in Chabahil",
    type: "Room",
    rent: 12000,
    location: "Chabahil, Kathmandu",
    image: "/placeholder.svg?height=250&width=400",
    amenities: ["Wi-Fi", "Water"],
    featured: false,
  },
  {
    id: 5,
    title: "Luxury Flat in Maharajgunj",
    type: "Flat",
    rent: 35000,
    location: "Maharajgunj, Kathmandu",
    image: "/placeholder.svg?height=250&width=400",
    amenities: ["Wi-Fi", "Parking", "Water", "Power", "Security", "Cable TV"],
    featured: true,
  },
  {
    id: 6,
    title: "Affordable Room in Balaju",
    type: "Room",
    rent: 10000,
    location: "Balaju, Kathmandu",
    image: "/placeholder.svg?height=250&width=400",
    amenities: ["Wi-Fi", "Water"],
    featured: false,
  },
]

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([5000, 50000])
  const [propertyType, setPropertyType] = useState("all")
  const [selectedArea, setSelectedArea] = useState("all")

  const filteredListings = mockListings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = propertyType === "all" || listing.type === propertyType
    const matchesArea = selectedArea === "all" || listing.location.includes(selectedArea)
    const matchesPrice = listing.rent >= priceRange[0] && listing.rent <= priceRange[1]

    return matchesSearch && matchesType && matchesArea && matchesPrice
  })

  return (
    <div className="page-shell">
      <Header />
      
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

          <Card className="p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="space-y-4 sm:space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  placeholder="Search by title or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-lg"
                />
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Property Type</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="h-10 sm:h-12 bg-background border-border">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Room">Room</SelectItem>
                      <SelectItem value="Flat">Flat</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Kathmandu Area</label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger className="h-10 sm:h-12 bg-background border-border">
                      <SelectValue placeholder="All Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Areas</SelectItem>
                      {kathmanduAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Budget: Rs {priceRange[0].toLocaleString()} - Rs {priceRange[1].toLocaleString()}
                  </label>
                  <div className="px-3 pt-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={50000}
                      min={5000}
                      step={1000}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              {filteredListings.length} Properties Found
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">Results based on your search criteria</p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("map")}
              className={viewMode === "map" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Map View Toggle */}
        {viewMode === "map" && (
          <div className="mb-6">
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-2 sm:p-4">
                <PropertyMap
                  properties={filteredListings.map((listing) => ({
                    id: listing.id,
                    title: listing.title,
                    type: listing.type,
                    price: listing.rent,
                    location: listing.location,
                    coordinates: {
                      lat: 27.7172 + (Math.random() - 0.5) * 0.1, // Mock coordinates around Kathmandu
                      lng: 85.324 + (Math.random() - 0.5) * 0.1,
                    },
                    image: listing.image,
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Listings Grid */}
        {viewMode !== "map" && (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" : "space-y-4"
            }
          >
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                  viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                }`}
              >
                <div className={viewMode === "list" ? "sm:w-80 sm:flex-shrink-0" : ""}>
                  <div className="relative">
                    <img
                      src={listing.image || "/placeholder.svg"}
                      alt={listing.title}
                      className={`object-cover ${viewMode === "list" ? "w-full h-48 sm:h-full" : "w-full h-48"}`}
                    />
                    {listing.featured && (
                      <Badge className="absolute top-3 left-3 bg-orange-500 hover:bg-orange-600 text-white text-xs">Featured</Badge>
                    )}
                    <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <CardContent className={`p-3 sm:p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-base sm:text-lg truncate">{listing.title}</h3>
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{listing.location}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-600 ml-2 text-xs">
                      {listing.type}
                    </Badge>
                  </div>

                  <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-3">
                    Rs {listing.rent.toLocaleString()}
                    <span className="text-xs sm:text-sm font-normal text-muted-foreground">/month</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {listing.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {listing.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{listing.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Link href={`/listing/${listing.id}`} className="flex-1">
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent sm:w-auto"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No properties found</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
