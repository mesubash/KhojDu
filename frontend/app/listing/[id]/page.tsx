"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  MapPin,
  Home,
  Heart,
  Share2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Droplets,
  Zap,
  Shield,
  Car,
  Tv,
  Star,
  ThumbsUp,
  Flag,
  Calendar,
  X,
} from "lucide-react"
import Link from "next/link"
import { GoogleMaps } from "@/components/google-maps"
import { Header } from "@/components/header"
import { useParams, useRouter } from "next/navigation"
import { fetchProperty, fetchPropertyReviewSummary, fetchPropertyReviews, submitReview } from "@/services/propertyService"
import type { PropertyDetail } from "@/types/property"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ReviewSummary, Review } from "@/types/review"
import { useAuth } from "@/context/AuthContext"
import { addToWishlist, removeFromWishlist, checkWishlist } from "@/services/wishlistService"

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const propertyId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [message, setMessage] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    review: "",
    stayDuration: "",
  })
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null)

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        setError("Property not found.")
        setIsLoading(false)
        return
      }
      try {
        const data = await fetchProperty(propertyId)
        setProperty(data)
        setError(null)
        setCurrentImageIndex(0)

        // load reviews in parallel
        const [summary, reviewPage] = await Promise.all([
          fetchPropertyReviewSummary(propertyId),
          fetchPropertyReviews(propertyId, 0, 5),
        ])
        setReviewSummary(summary || null)
        setReviews(reviewPage?.content || [])
      } catch (err: any) {
        console.error("[Listing] Failed to load property", err)
        setError("Unable to load this listing right now.")
        toast.error("Could not load listing.")
      } finally {
        setIsLoading(false)
      }
    }
    loadProperty()
  }, [propertyId])

  // Handle responsive behavior without causing re-renders
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()

    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkMobile, 150)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  const images = property?.images?.map((img) => img.imageUrl) ?? ["/placeholder.svg?height=500&width=800"]

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (images.length ? (prev + 1) % images.length : 0))
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (images.length ? (prev - 1 + images.length) % images.length : 0))
  }, [images.length])

  const openWhatsApp = useCallback(
    (text: string) => {
      const phone = property?.landlord?.phone
      if (!phone) {
        toast.error("Landlord phone number not available.")
        return
      }
      const phoneNumber = phone.replace(/\s+/g, "")
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, "_blank")
    },
    [property?.landlord?.phone],
  )

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const msg =
        message.trim() ||
        `Hi, I'm interested in your property "${property?.title}". Could you please share availability and more details?`
      openWhatsApp(msg)
      setShowContactModal(false)
      setMessage("")
    },
    [message, openWhatsApp, property?.title],
  )

  const handleWhatsApp = useCallback(() => {
    const msg = `Hi, I'm interested in your property "${property?.title}". When can I schedule a visit?`
    openWhatsApp(msg)
  }, [openWhatsApp, property?.title])

  const handleBookVisit = useCallback(() => {
    const msg = `Hello! I'd like to book a visit for "${property?.title}". Please share available slots this week.`
    openWhatsApp(msg)
  }, [openWhatsApp, property?.title])

  const handleSubmitReview = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (reviewForm.rating === 0) {
        toast.error("Please select a rating")
        return
      }
      try {
        setSubmittingReview(true)
        await submitReview(propertyId!, {
          rating: reviewForm.rating,
          reviewText: reviewForm.review || undefined,
          stayDurationMonths: reviewForm.stayDuration ? Number(reviewForm.stayDuration) : undefined,
        })
        toast.success("Review submitted successfully!")
        const [summary, reviewPage] = await Promise.all([
          fetchPropertyReviewSummary(propertyId!),
          fetchPropertyReviews(propertyId!, 0, 10),
        ])
        setReviewSummary(summary || null)
        setReviews(reviewPage?.content || [])
        setShowReviewModal(false)
        setReviewForm({ rating: 0, review: "", stayDuration: "" })
      } catch (err) {
        console.error("[Review] Failed to submit review", err)
        toast.error("Failed to submit review. Please try again.")
      } finally {
        setSubmittingReview(false)
      }
    },
    [reviewForm, propertyId],
  )

  const handleHelpfulClick = useCallback((reviewId: number) => {
    setHelpfulReviews((prev) => (prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]))
  }, [])

  const renderStars = (
    rating: number,
    size: "sm" | "md" | "lg" = "md",
    interactive = false,
    onRate?: (rating: number) => void,
  ) => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    }

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? "text-yellow-400 fill-current" : "text-muted-foreground/40"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    )
  }

  const getAmenityIcon = (label: string) => {
    const key = label.toLowerCase()
    if (key.includes("wifi") || key.includes("internet")) return Wifi
    if (key.includes("water")) return Droplets
    if (key.includes("power") || key.includes("electric")) return Zap
    if (key.includes("security")) return Shield
    if (key.includes("park")) return Car
    if (key.includes("tv")) return Tv
    return null
  }

  const locationLabel =
    [property?.address, property?.city, property?.district].filter(Boolean).join(", ") || "Location not specified"
  const rentValue = property?.monthlyRent ? Number(property.monthlyRent) : null
  const depositValue = property?.securityDeposit ? Number(property.securityDeposit) : null
  const avgRating = reviewSummary?.averageRating ?? property?.stats?.averageRating ?? 0
  const totalReviews = reviewSummary?.totalReviews ?? property?.stats?.reviewCount ?? reviews.length
  const views = property?.stats?.viewCount ?? 0
  const postedDate = property?.createdAt ? new Date(property.createdAt).toLocaleDateString() : "Recently"
  const landlord = property?.landlord
  const messagingDisabled = false
  const amenities =
    property?.amenities?.map((a) => ({
      id: a.id || a.name,
      label: a.name,
      icon: getAmenityIcon(a.name),
    })) || []
  const loadWishlistStatus = useCallback(async () => {
    if (!propertyId) return
    try {
      const inList = await checkWishlist(propertyId)
      setIsInWishlist(Boolean(inList))
      setIsLiked(Boolean(inList))
    } catch (err: any) {
      const status = err?.response?.status
      if (status && status !== 401 && status !== 403 && status !== 404) {
        console.warn("[Listing] Failed to check wishlist", err)
      }
      // Treat 404/unauthorized as not in wishlist
      setIsInWishlist(false)
      setIsLiked(false)
    }
  }, [propertyId])

  useEffect(() => {
    loadWishlistStatus()
  }, [loadWishlistStatus])

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to save listings.")
      router.push("/auth/login?redirect=/listing/" + propertyId)
      return
    }
    if (!propertyId) return
    setWishlistLoading(true)
    try {
      if (isInWishlist) {
        await removeFromWishlist(propertyId)
        setIsInWishlist(false)
        setIsLiked(false)
        toast.success("Removed from wishlist")
      } else {
        await addToWishlist(propertyId)
        setIsInWishlist(true)
        setIsLiked(true)
        toast.success("Saved to wishlist")
      }
    } catch (err) {
      console.error("[Listing] Failed to toggle wishlist", err)
      toast.error("Could not update wishlist.")
    } finally {
      setWishlistLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="page-shell">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="page-shell">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-lg font-semibold text-foreground mb-2">{error || "Listing not found"}</p>
          <Button onClick={() => router.push("/search")}>Back to search</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <Header />
      
      {/* Back to Search Navigation */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/search" className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Search</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <Card className="overflow-hidden rounded-xl bg-card">
              <div className="relative">
                <img
                  src={images[currentImageIndex] || "/placeholder.svg"}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-96 object-cover"
                />

                {/* Navigation Buttons */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-3 shadow-lg transition-all"
                >
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-3 shadow-lg transition-all"
                >
                  <ChevronRight className="h-5 w-5 text-foreground" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 shadow-lg transition-all disabled:opacity-60"
                  >
                    <Heart className={`h-5 w-5 ${isLiked || isInWishlist ? "text-red-500 fill-current" : "text-muted-foreground"}`} />
                  </button>
                  <button className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 shadow-lg transition-all">
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="p-4 border-t border-border bg-muted/20">
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex ? "border-orange-600" : "border-transparent hover:border-muted-foreground/40"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Property Details */}
            <Card className="rounded-xl bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{property.title}</h1>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {locationLabel}
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        {property.propertyType || "Property"}
                      </Badge>
                    </div>
                    {/* Rating Display */}
                    <div className="flex items-center space-x-2 mt-3">
                      {renderStars(avgRating)}
                      <span className="text-sm font-medium text-foreground">{avgRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600">
                      {rentValue ? `Rs ${rentValue.toLocaleString()}` : "Rent not set"}
                    </div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3 text-lg">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4 text-lg">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.length === 0 && <p className="text-sm text-muted-foreground">No amenities listed.</p>}
                    {amenities.map((amenity) => {
                      const Icon = amenity.icon
                      return (
                        <div
                          key={amenity.id}
                          className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800"
                        >
                          {Icon ? (
                            <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          )}
                          <span className="text-sm font-medium text-foreground">{amenity.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Rent</div>
                    <div className="text-2xl font-bold text-foreground">
                      {rentValue ? `Rs ${rentValue.toLocaleString()}` : "Not set"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Security Deposit</div>
                    <div className="text-2xl font-bold text-foreground">
                      {depositValue ? `Rs ${depositValue.toLocaleString()}` : "Not set"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="rounded-xl bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span>Reviews & Ratings</span>
                  </CardTitle>
                  <Button onClick={() => setShowReviewModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                    Write Review
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rating Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground mb-2">{avgRating.toFixed(1)}</div>
                    {renderStars(avgRating, "lg")}
                    <p className="text-muted-foreground mt-2">{totalReviews} reviews</p>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviewSummary?.ratingDistribution?.[rating] || 0
                      const percent = totalReviews ? (count / totalReviews) * 100 : 0
                      return (
                        <div key={rating} className="flex items-center space-x-2">
                          <span className="text-sm w-3">{rating}</span>
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <Progress value={percent} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground w-8">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.tenantProfileImage || "/placeholder.svg"} alt={review.tenantName} />
                          <AvatarFallback>{(review.tenantName || "U").charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-foreground">{review.tenantName || "Anonymous"}</h4>
                                {review.isVerified && (
                                  <Badge className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800">
                                    Verified Stay
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {renderStars(review.overallRating || 0, "sm")}
                                {review.stayDurationMonths && (
                                  <span className="text-sm text-muted-foreground">
                                    Stayed for {review.stayDurationMonths} months
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                            </div>
                          </div>
                          <p className="text-foreground leading-relaxed mb-3">{review.reviewText || review.pros || ""}</p>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleHelpfulClick(Number(review.id))}
                              className={`flex items-center space-x-1 text-sm ${
                                helpfulReviews.includes(review.id as any)
                                  ? "text-orange-600"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span>Helpful</span>
                            </button>
                            <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground">
                              <Flag className="h-4 w-4" />
                              <span>Report</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 bg-transparent">
                    Load More Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card className="rounded-xl bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GoogleMaps
                  center={{
                    lat: property.latitude || 27.7172,
                    lng: property.longitude || 85.324,
                  }}
                  markers={[
                    {
                      position: {
                        lat: property.latitude || 27.7172,
                        lng: property.longitude || 85.324,
                      },
                      title: property.title,
                      info: `
                        <div>
                          <h3 style="margin: 0 0 8px 0; font-weight: 600;">${property.title}</h3>
                          <p style="margin: 0 0 4px 0; color: #6b7280;">${locationLabel}</p>
                          <p style="margin: 0; color: #ea580c; font-weight: 600;">${
                            rentValue ? `Rs ${rentValue.toLocaleString()}/month` : ""
                          }</p>
                        </div>
                      `,
                    },
                  ]}
                  height="300px"
                  zoom={15}
                />
                <div className="mt-4 p-3 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    {locationLabel}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="rounded-xl sticky top-24 bg-card">
              <CardHeader>
                <CardTitle>Contact Landlord</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {(landlord?.fullName || landlord?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground flex items-center space-x-2">
                      <span>{landlord?.fullName || landlord?.email || "Landlord"}</span>
                      {landlord?.isVerified && (
                        <Badge className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800">Verified</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Contact: {landlord?.phone || landlord?.email || "Not provided"}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg h-12 bg-transparent"
                    onClick={handleWhatsApp}
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    Chat on WhatsApp
                  </Button>

                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-12"
                    onClick={() => setShowContactModal(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send custom WhatsApp message
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full rounded-lg h-12"
                    onClick={handleBookVisit}
                  >
                    Book a visit (WhatsApp)
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-3 border-t border-border">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {postedDate}</span>
                  </div>
                  <div>
                    Posted {postedDate} • {views} views
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="rounded-xl bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Safety Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Always visit the property in person</li>
                  <li>• Verify landlord identity and documents</li>
                  <li>• Don't pay advance without proper agreement</li>
                  <li>• Check all amenities before finalizing</li>
                  <li>• Read reviews from previous tenants</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Modal - sends via WhatsApp */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md supports-[backdrop-filter]:bg-black/20">
          <Card className="w-full max-w-md rounded-xl bg-card shadow-2xl">
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
              <p className="text-muted-foreground">
                Contact {landlord?.fullName || landlord?.email || "the landlord"} about this property
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <Textarea
                  placeholder="Hi, I'm interested in your property listing. Could you please provide more details?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                  className="resize-none"
                />
                <div className="flex space-x-3">
                  <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                    Send via WhatsApp
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowContactModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 supports-[backdrop-filter]:bg-black/30">
          <Card className="w-full max-w-md rounded-xl bg-card">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Write a Review</CardTitle>
                <p className="text-muted-foreground">Share your experience with this property</p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                aria-label="Close review modal"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Rating *</label>
                  {renderStars(reviewForm.rating, "lg", true, (rating) =>
                    setReviewForm((prev) => ({ ...prev, rating })),
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Stay Duration</label>
                  <select
                    value={reviewForm.stayDuration}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, stayDuration: e.target.value }))}
                    className="w-full p-2 border border-white/15 dark:border-white/10 rounded-lg bg-white/5 dark:bg-gray-900/10 backdrop-blur-[30px] text-foreground focus:ring-2 focus:ring-orange-200/70 focus:border-orange-200/70"
                  >
                    <option value="">Select duration</option>
                    <option value="Less than 1 month">Less than 1 month</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6-12 months">6-12 months</option>
                    <option value="More than 1 year">More than 1 year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Review</label>
                  <Textarea
                    placeholder="Share your experience about the property, landlord, and overall stay..."
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, review: e.target.value }))}
                    rows={4}
                    className="resize-none bg-white/5 dark:bg-gray-900/10 border border-white/15 dark:border-white/10 shadow-sm backdrop-blur-[40px] placeholder:text-muted-foreground/25 transition-all focus:bg-white/50 focus:backdrop-blur-[50px] focus:ring-2 focus:ring-orange-200/60 focus:border-orange-200/60"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={submittingReview}
                  >
                    {submittingReview ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                      </span>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)} disabled={submittingReview}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
