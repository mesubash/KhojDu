"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, MapPin, Shield, Clock, Users, Star, Bed, Bath, Square } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { searchProperties } from "@/services/propertyService"
import type { PropertyListItem } from "@/types/property"
import { toast } from "sonner"

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<PropertyListItem[]>([])
  const [loading, setLoading] = useState(false)

  const features = [
    {
      icon: Shield,
      title: "Verified Properties",
      description: "All properties are verified by our team for authenticity and quality.",
    },
    {
      icon: Search,
      title: "Easy Search",
      description: "Find properties with our advanced search and filter options.",
    },
    {
      icon: Users,
      title: "Secure Platform",
      description: "Safe and secure transactions with verified landlords.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Get help anytime with our dedicated customer support team.",
    },
  ]

  useEffect(() => {
    const loadFeatured = async () => {
      setLoading(true)
      try {
        const resp = await searchProperties({ page: 0, size: 6, availableOnly: true, sortBy: "createdAt", sortDirection: "DESC" })
        setFeaturedProperties(resp?.content || [])
      } catch (err) {
        console.error("[Home] Failed to load featured properties", err)
        toast.error("Could not load featured properties right now.")
      } finally {
        setLoading(false)
      }
    }
    loadFeatured()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-teal-500/10" />
        <div className="container-responsive relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-teal-600 bg-clip-text text-transparent mb-6">
              Find Your Perfect Rental in Nepal
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover amazing properties, connect with verified landlords, and find your dream home with <span className="text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>KhojDu</span>.
            </p>

            {/* Search Bar */}
            <Card className="p-6 max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input placeholder="Search by location, property type..." className="h-12" />
                </div>
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-12 px-8">
                  <Search className="w-4 h-4 mr-2" />
                  Search Properties
                </Button>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  Explore Properties
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  List Your Property
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Properties</h2>
            <p className="text-xl text-muted-foreground">Discover our handpicked selection of premium rentals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading && featuredProperties.length === 0 && (
              <p className="text-center text-muted-foreground col-span-full">Loading properties...</p>
            )}
            {!loading && featuredProperties.length === 0 && (
              <p className="text-center text-muted-foreground col-span-full">No featured properties right now.</p>
            )}
            {featuredProperties.map((property) => {
              const locationLabel = property.city || property.district || property.address || "Location not specified"
              const price =
                property.monthlyRent !== undefined && property.monthlyRent !== null
                  ? `Rs ${Number(property.monthlyRent).toLocaleString()}/month`
                  : "Not set"
              const area = property.totalArea
                ? `${property.totalArea} sq ft`
                : property.keyAmenities?.find((k) => k.toLowerCase().includes("sq")) || "—"
              return (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={property.primaryImageUrl || "/placeholder.svg"}
                      alt={property.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {property.landlordVerified && (
                        <Badge className="bg-green-500 text-white">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {property.isFeatured && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-teal-500 text-white">Featured</Badge>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-2 py-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{property.averageRating?.toFixed(1) ?? "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                    <div className="flex items-center text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{locationLabel}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{property.bedrooms ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.bathrooms ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="w-4 h-4" />
                          <span>{area}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">{price}</div>
                      <Link href={`/listing/${property.id}`}>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/explore">
              <Button size="lg" variant="outline">
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500/5 to-teal-500/5">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>KhojDu</span>?
            </h2>
            <p className="text-xl text-muted-foreground">Experience the best in rental property search</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-responsive">
          <Card className="text-center">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of satisfied tenants who found their perfect rental through <span className="text-orange-500" style={{ fontFamily: 'var(--font-nothing-you-could-do)' }}>KhojDu</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/explore">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    Start Searching
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline">
                    Create Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
