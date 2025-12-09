"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Home, ArrowLeft, Edit, Star, MapPin, Calendar, Heart, Camera, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { fetchProfile, updateProfile } from "@/services/userService"
import type { User } from "@/types/auth"
import { UserRole } from "@/types/auth"
import type { PropertyType } from "@/types/property"
import { toast } from "sonner"
import { fetchWishlist, type WishlistItem } from "@/services/dashboardService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchMyReviews } from "@/services/propertyService"
import type { Review } from "@/types/review"
import { format } from "date-fns"
import { Spinner } from "@/components/ui/spinner"
import { motion } from "framer-motion"

const defaultUser: User = {
  id: "",
  email: "",
  fullName: "",
  role: UserRole.TENANT,
  isVerified: false,
}

const mockReviews = [
  {
    id: 1,
    propertyTitle: "Cozy Room in Thamel",
    landlord: "Ram Sharma",
    rating: 5,
    date: "2024-02-15",
    review:
      "Excellent room with all promised amenities. The landlord was very responsive and helpful throughout my stay.",
    stayDuration: "6 months",
  },
  {
    id: 2,
    propertyTitle: "Modern Apartment in Lazimpat",
    landlord: "Sita Poudel",
    rating: 4,
    date: "2023-12-10",
    review: "Good location and well-maintained property. Would recommend to other tenants.",
    stayDuration: "4 months",
  },
]

export default function ProfilePage() {
  const { isAuthenticated, user: authUser } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<User>(defaultUser)
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const glassInputClasses =
    "bg-white/5 dark:bg-gray-900/10 border border-white/15 dark:border-white/10 shadow-sm backdrop-blur-[40px] placeholder:text-muted-foreground/25 transition-all focus:bg-white/50 focus:backdrop-blur-[50px] focus:ring-2 focus:ring-orange-200/60 focus:border-orange-200/60"
  const glassTextareaClasses = glassInputClasses
  const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } }
  const stagger = { show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } }
  const cardHover = { whileHover: { y: -4, scale: 1.01, transition: { duration: 0.16 } } }
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    occupation: "",
    budgetMin: "",
    budgetMax: "",
    preferredPropertyType: "" as PropertyType | "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login?redirect=/profile")
      return
    }

    const loadProfile = async () => {
      try {
        const data = await fetchProfile()
        setProfile((prev) => ({
          ...prev,
          ...data,
          fullName: data.fullName || authUser?.fullName || "",
          email: data.email || authUser?.email || "",
          avatar: data.profileImageUrl,
          role: (data.role as UserRole) || authUser?.role || prev.role,
        }))
        setFormData({
          name: data.fullName || authUser?.fullName || "",
          email: data.email || authUser?.email || "",
          phone: data.phone || "",
          location: data.preferredLocation || "",
          bio: data.bio || "",
          occupation: data.occupation || "",
          budgetMin: data.budgetMin?.toString() || "",
          budgetMax: data.budgetMax?.toString() || "",
          preferredPropertyType: data.preferredPropertyType || "",
        })
      } catch (err) {
        console.error("[Profile] Failed to load profile", err)
        toast.error("Could not load your profile right now.")
        const status = (err as any)?.response?.status
        if (status === 404 || status === 401) {
          router.replace("/auth/login?redirect=/profile")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [authUser?.email, authUser?.fullName, isAuthenticated, router])

  // Load wishlist when favorites tab is viewed
  useEffect(() => {
    const loadWishlist = async () => {
      if (activeTab !== "favorites") return
      setWishlistLoading(true)
      try {
        const resp = await fetchWishlist({ page: 0, size: 12 })
        setWishlistItems(resp?.content || [])
      } catch (err) {
        console.error("[Profile] Failed to load wishlist", err)
        toast.error("Could not load wishlist.")
      } finally {
        setWishlistLoading(false)
      }
    }
    loadWishlist()
  }, [activeTab])

  // Load reviews when reviews tab is viewed
  useEffect(() => {
    const loadReviews = async () => {
      if (activeTab !== "reviews") return
      setReviewsLoading(true)
      try {
        const resp = await fetchMyReviews(0, 20)
        setMyReviews(resp?.content || [])
      } catch (err) {
        console.error("[Profile] Failed to load reviews", err)
        toast.error("Could not load your reviews.")
      } finally {
        setReviewsLoading(false)
      }
    }
    loadReviews()
  }, [activeTab])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({
        fullName: formData.name,
        phone: formData.phone || undefined,
        occupation: formData.occupation || undefined,
        bio: formData.bio || undefined,
        preferredLocation: formData.location || undefined,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
        preferredPropertyType: formData.preferredPropertyType || undefined,
      })
      toast.success("Profile updated successfully.")
      setIsEditing(false)
    } catch (err: any) {
      console.error("[Profile] Update failed", err)
      toast.error(err?.response?.data?.message || "Could not update profile.")
    } finally {
      setSaving(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-3 w-3 ${star <= rating ? "text-yellow-400 fill-current" : "text-muted-foreground"}`} />
        ))}
      </div>
    )
  }

  const joinedDate = useMemo(() => {
    if (!profile.createdAt) return ""
    const date = new Date(profile.createdAt)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long" })
  }, [profile.createdAt])

  if (isLoading) {
    return (
      <div className="page-shell">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Spinner size={40} />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={fadeUp}>
            <Card className="rounded-xl shadow-sm mb-8 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-white/30">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                      <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.fullName || "User"} />
                      <AvatarFallback className="text-2xl">
                        {(profile.fullName || profile.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{profile.fullName || profile.email}</h1>
                          <Badge variant="outline" className="border-orange-400 text-orange-600">
                            {profile.role || UserRole.TENANT}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{profile.email}</p>
                      </div>
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant="outline"
                        className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 bg-transparent"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditing ? "Cancel" : "Edit Profile"}
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-muted-foreground space-y-2 sm:space-y-0">
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.preferredLocation || "Add your location"}</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{joinedDate ? `Joined ${joinedDate}` : "Joined soon"}</span>
                      </div>
                      {profile.isVerified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                          Verified User
                        </Badge>
                      )}
                    </div>
                    <p className="text-foreground leading-relaxed">{profile.bio || "Tell others about yourself."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <Card className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <p className="text-muted-foreground">Manage your account details and preferences</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={!isEditing}
                      className={`mt-1 ${glassInputClasses}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className={`mt-1 ${glassInputClasses}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing}
                      className={`mt-1 ${glassInputClasses}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="occupation" className="text-sm font-medium">
                      Occupation
                    </Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange("occupation", e.target.value)}
                      disabled={!isEditing}
                      className={`mt-1 ${glassInputClasses}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium">
                      Preferred Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      disabled={!isEditing}
                      className={`mt-1 ${glassInputClasses}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredPropertyType" className="text-sm font-medium">
                      Preferred Property Type
                    </Label>
                    <Select
                      value={formData.preferredPropertyType}
                      onValueChange={(value) => handleInputChange("preferredPropertyType", value as PropertyType)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROOM">Room</SelectItem>
                        <SelectItem value="FLAT">Flat</SelectItem>
                        <SelectItem value="HOUSE">House</SelectItem>
                        <SelectItem value="APARTMENT">Apartment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="budgetMin" className="text-sm font-medium">
                      Minimum Budget (Rs)
                    </Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      value={formData.budgetMin}
                    onChange={(e) => handleInputChange("budgetMin", e.target.value)}
                    disabled={!isEditing}
                    className={`mt-1 ${glassInputClasses}`}
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMax" className="text-sm font-medium">
                    Maximum Budget (Rs)
                    </Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      value={formData.budgetMax}
                    onChange={(e) => handleInputChange("budgetMax", e.target.value)}
                    disabled={!isEditing}
                    className={`mt-1 ${glassInputClasses}`}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className={`mt-1 resize-none ${glassTextareaClasses}`}
                />
              </div>

                <div className="flex items-center justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={!isEditing}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!isEditing || saving}>
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <Card className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Saved Properties</span>
                </CardTitle>
                <p className="text-muted-foreground">Properties you've saved for later</p>
              </CardHeader>
              <CardContent>
                {wishlistLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner size={18} /> Loading wishlist...
                  </div>
                )}
                {!wishlistLoading && wishlistItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">No saved properties yet.</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((property) => (
                    <motion.div key={property.id} variants={fadeUp} {...cardHover}>
                    <Card className="rounded-lg shadow-sm hover:shadow-lg transition-all bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20">
                      <div className="relative">
                        <img
                          src={property.image || "/placeholder.svg"}
                          alt={property.title}
                          className="w-full h-40 object-cover rounded-t-lg"
                        />
                        <button className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/60 rounded-full cursor-default">
                          <Heart className="h-4 w-4 text-red-500 fill-current" />
                        </button>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2">{property.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.city || property.district || property.address || property.location || "Not specified"}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {renderStars(property.averageRating || 0)}
                            <span className="text-sm text-muted-foreground">{property.averageRating || "N/A"}</span>
                          </div>
                          <div className="text-lg font-bold text-orange-600">
                            Rs {(Number(property.rent) || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="mt-3">
                          <Link href={`/listing/${property.id}`}>
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <Card className="rounded-xl shadow-sm bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span>My Reviews</span>
                </CardTitle>
                <p className="text-muted-foreground">Reviews you've written for properties</p>
              </CardHeader>
              <CardContent>
                {reviewsLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner size={18} /> Loading your reviews...
                  </div>
                )}
                {!reviewsLoading && myReviews.length === 0 && (
                  <p className="text-sm text-muted-foreground">You haven't written any reviews yet.</p>
                )}
                <div className="space-y-6">
                  {myReviews.map((review) => (
                    <motion.div key={review.id} variants={fadeUp} {...cardHover} className="border-b border-border pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        {review.propertyPrimaryImage && (
                          <img
                            src={review.propertyPrimaryImage}
                            alt={review.propertyTitle || "Property"}
                            className="w-24 h-24 rounded-lg object-cover border border-border"
                          />
                        )}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{review.propertyTitle || "Property"}</h3>
                              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {review.propertyCity || review.propertyDistrict || review.propertyAddress || "Location N/A"}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {review.createdAt ? format(new Date(review.createdAt), "MMM dd, yyyy") : ""}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {renderStars(review.overallRating || 0)}
                            <span className="text-sm font-medium text-foreground">
                              {(review.overallRating ?? 0).toFixed(1)}/5
                            </span>
                            {review.stayDurationMonths && (
                              <span className="text-sm text-muted-foreground">
                                Stayed for {review.stayDurationMonths} months
                              </span>
                            )}
                          </div>

                          {review.reviewText && <p className="text-foreground leading-relaxed">{review.reviewText}</p>}
                          <div className="flex flex-col gap-1">
                            {review.pros && <p className="text-sm text-green-600">Pros: {review.pros}</p>}
                            {review.cons && <p className="text-sm text-red-600">Cons: {review.cons}</p>}
                          </div>
                          </div>
                        </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
