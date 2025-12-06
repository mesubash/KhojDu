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
} from "lucide-react"
import Link from "next/link"
import { GoogleMaps } from "@/components/google-maps"
import { Header } from "@/components/header"

const mockListing = {
  id: 1,
  title: "Cozy Room in Thamel",
  type: "Room",
  rent: 15000,
  deposit: 30000,
  location: "Thamel, Kathmandu",
  description:
    "A beautiful and cozy room located in the heart of Thamel, perfect for students and working professionals. The room comes fully furnished with a comfortable bed, study desk, and wardrobe. Located just 5 minutes walk from major restaurants, cafes, and shopping areas.",
  amenities: [
    { id: "wifi", label: "Wi-Fi", icon: Wifi },
    { id: "water", label: "24/7 Water", icon: Droplets },
    { id: "security", label: "Security", icon: Shield },
    { id: "electricity", label: "Backup Power", icon: Zap },
    { id: "parking", label: "Parking", icon: Car },
    { id: "tv", label: "Cable TV", icon: Tv },
  ],
  images: [
    "/placeholder.svg?height=500&width=800&text=Room+View+1",
    "/placeholder.svg?height=500&width=800&text=Room+View+2",
    "/placeholder.svg?height=500&width=800&text=Room+View+3",
    "/placeholder.svg?height=500&width=800&text=Room+View+4",
    "/placeholder.svg?height=500&width=800&text=Room+View+5",
  ],
  landlord: {
    name: "Ram Sharma",
    phone: "+977 9841234567",
    verified: true,
    responseTime: "2 hours",
    rating: 4.8,
    totalReviews: 24,
    joinedDate: "2023-05-15",
  },
  views: 45,
  posted: "3 days ago",
  rating: {
    average: 4.6,
    total: 18,
    breakdown: {
      5: 12,
      4: 4,
      3: 1,
      2: 1,
      1: 0,
    },
  },
}

const mockReviews = [
  {
    id: 1,
    user: {
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "PS",
    },
    rating: 5,
    date: "2024-02-15",
    stayDuration: "6 months",
    review:
      "Excellent room with all promised amenities. Ram sir is very responsive and helpful. The location is perfect for students and working professionals. Highly recommended!",
    helpful: 8,
    verified: true,
  },
  {
    id: 2,
    user: {
      name: "Amit Thapa",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AT",
    },
    rating: 4,
    date: "2024-01-20",
    stayDuration: "3 months",
    review:
      "Good room in a prime location. Wi-Fi speed could be better, but overall a decent place to stay. The landlord is cooperative and maintains the property well.",
    helpful: 5,
    verified: true,
  },
  {
    id: 3,
    user: {
      name: "Sita Poudel",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SP",
    },
    rating: 5,
    date: "2023-12-10",
    stayDuration: "8 months",
    review:
      "Stayed here for almost a year. Great experience overall. The room is clean, well-maintained, and the location is unbeatable. Would definitely recommend to others.",
    helpful: 12,
    verified: true,
  },
  {
    id: 4,
    user: {
      name: "Krishna Gurung",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "KG",
    },
    rating: 3,
    date: "2023-11-05",
    stayDuration: "2 months",
    review:
      "Average experience. The room is okay but had some issues with water supply during my stay. Location is good though.",
    helpful: 2,
    verified: false,
  },
]

export default function ListingDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [message, setMessage] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    review: "",
    stayDuration: "",
  })
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([])

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

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === mockListing.images.length - 1 ? 0 : prev + 1))
  }, [])

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? mockListing.images.length - 1 : prev - 1))
  }, [])

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    alert("Message sent successfully!")
    setShowContactModal(false)
    setMessage("")
  }, [])

  const handleWhatsApp = useCallback(() => {
    const phoneNumber = mockListing.landlord.phone.replace(/\s+/g, "")
    const messageText = `Hi, I'm interested in your property: ${mockListing.title}`
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageText)}`, "_blank")
  }, [])

  const handleSubmitReview = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (reviewForm.rating === 0) {
        alert("Please select a rating")
        return
      }
      alert("Review submitted successfully!")
      setShowReviewModal(false)
      setReviewForm({ rating: 0, review: "", stayDuration: "" })
    },
    [reviewForm],
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
                  src={mockListing.images[currentImageIndex] || "/placeholder.svg"}
                  alt={`${mockListing.title} - Image ${currentImageIndex + 1}`}
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
                  {currentImageIndex + 1} / {mockListing.images.length}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 shadow-lg transition-all"
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? "text-red-500 fill-current" : "text-muted-foreground"}`} />
                  </button>
                  <button className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 shadow-lg transition-all">
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="p-4 border-t border-border bg-muted/20">
                <div className="flex space-x-2 overflow-x-auto">
                  {mockListing.images.map((image, index) => (
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
                    <h1 className="text-3xl font-bold text-foreground">{mockListing.title}</h1>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {mockListing.location}
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        {mockListing.type}
                      </Badge>
                    </div>
                    {/* Rating Display */}
                    <div className="flex items-center space-x-2 mt-3">
                      {renderStars(mockListing.rating.average)}
                      <span className="text-sm font-medium text-foreground">{mockListing.rating.average}</span>
                      <span className="text-sm text-muted-foreground">({mockListing.rating.total} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600">Rs {mockListing.rent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3 text-lg">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{mockListing.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4 text-lg">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {mockListing.amenities.map((amenity) => {
                      const Icon = amenity.icon
                      return (
                        <div
                          key={amenity.id}
                          className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800"
                        >
                          <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          <span className="text-sm font-medium text-foreground">{amenity.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Rent</div>
                    <div className="text-2xl font-bold text-foreground">Rs {mockListing.rent.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Security Deposit</div>
                    <div className="text-2xl font-bold text-foreground">Rs {mockListing.deposit.toLocaleString()}</div>
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
                    <div className="text-4xl font-bold text-foreground mb-2">{mockListing.rating.average}</div>
                    {renderStars(mockListing.rating.average, "lg")}
                    <p className="text-muted-foreground mt-2">{mockListing.rating.total} reviews</p>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <span className="text-sm w-3">{rating}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <Progress
                          value={
                            (mockListing.rating.breakdown[rating as keyof typeof mockListing.rating.breakdown] /
                              mockListing.rating.total) *
                            100
                          }
                          className="flex-1 h-2"
                        />
                        <span className="text-sm text-muted-foreground w-8">
                          {mockListing.rating.breakdown[rating as keyof typeof mockListing.rating.breakdown]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                          <AvatarFallback>{review.user.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-foreground">{review.user.name}</h4>
                                {review.verified && (
                                  <Badge className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800">
                                    Verified Stay
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {renderStars(review.rating, "sm")}
                                <span className="text-sm text-muted-foreground">Stayed for {review.stayDuration}</span>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">{review.date}</div>
                          </div>
                          <p className="text-foreground leading-relaxed mb-3">{review.review}</p>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleHelpfulClick(review.id)}
                              className={`flex items-center space-x-1 text-sm ${
                                helpfulReviews.includes(review.id)
                                  ? "text-orange-600"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span>Helpful ({review.helpful + (helpfulReviews.includes(review.id) ? 1 : 0)})</span>
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
                  center={{ lat: 27.7172, lng: 85.324 }}
                  markers={[
                    {
                      position: { lat: 27.7172, lng: 85.324 },
                      title: mockListing.title,
                      info: `
                        <div>
                          <h3 style="margin: 0 0 8px 0; font-weight: 600;">${mockListing.title}</h3>
                          <p style="margin: 0 0 4px 0; color: #6b7280;">${mockListing.location}</p>
                          <p style="margin: 0; color: #ea580c; font-weight: 600;">Rs ${mockListing.rent.toLocaleString()}/month</p>
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
                    {mockListing.location}
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
                    {mockListing.landlord.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground flex items-center space-x-2">
                      <span>{mockListing.landlord.name}</span>
                      {mockListing.landlord.verified && (
                        <Badge className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {renderStars(mockListing.landlord.rating, "sm")}
                      <span>{mockListing.landlord.rating}</span>
                      <span>({mockListing.landlord.totalReviews} reviews)</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Responds in {mockListing.landlord.responseTime}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-12"
                    onClick={() => setShowContactModal(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg h-12 bg-transparent"
                    onClick={handleWhatsApp}
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    WhatsApp
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-3 border-t border-border">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {mockListing.landlord.joinedDate}</span>
                  </div>
                  <div>
                    Posted {mockListing.posted} • {mockListing.views} views
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

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md rounded-xl bg-card">
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
              <p className="text-muted-foreground">Contact {mockListing.landlord.name} about this property</p>
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
                    Send Message
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md rounded-xl bg-card">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
              <p className="text-muted-foreground">Share your experience with this property</p>
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
                    className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-background text-foreground"
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
                    className="resize-none"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                    Submit Review
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)}>
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
