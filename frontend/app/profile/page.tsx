"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Home, ArrowLeft, Edit, Star, MapPin, Calendar, Heart, Camera } from "lucide-react"
import Link from "next/link"

const mockUser = {
  name: "Priya Sharma",
  email: "priya.sharma@email.com",
  phone: "+977 9841234567",
  avatar: "/placeholder.svg?height=100&width=100",
  joinedDate: "January 2024",
  location: "Kathmandu, Nepal",
  bio: "Software engineer looking for comfortable and affordable accommodation in Kathmandu. I prefer quiet neighborhoods with good internet connectivity.",
  verified: true,
  rating: 4.8,
  totalReviews: 12,
}

const mockFavorites = [
  {
    id: 1,
    title: "Cozy Room in Thamel",
    location: "Thamel, Kathmandu",
    rent: 15000,
    image: "/placeholder.svg?height=150&width=200",
    rating: 4.6,
    saved: "2024-03-01",
  },
  {
    id: 2,
    title: "Modern Flat in Baneshwor",
    location: "Baneshwor, Kathmandu",
    rent: 25000,
    image: "/placeholder.svg?height=150&width=200",
    rating: 4.3,
    saved: "2024-02-28",
  },
  {
    id: 3,
    title: "Student Room Near KU",
    location: "Dhulikhel, Kavre",
    rent: 12000,
    image: "/placeholder.svg?height=150&width=200",
    rating: 4.1,
    saved: "2024-02-25",
  },
]

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
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
    location: mockUser.location,
    bio: mockUser.bio,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Handle save logic
    setIsEditing(false)
    alert("Profile updated successfully!")
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

  return (
    <div className="page-shell">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="rounded-xl shadow-sm mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                  <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                  <AvatarFallback className="text-2xl">{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{mockUser.name}</h1>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    className="mt-2 sm:mt-0 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 bg-transparent"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-muted-foreground mb-3">
                  <div className="flex items-center justify-center sm:justify-start space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{mockUser.location}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {mockUser.joinedDate}</span>
                  </div>
                  {mockUser.verified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Verified User</Badge>
                  )}
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
                  {renderStars(mockUser.rating)}
                  <span className="text-sm font-medium text-foreground">{mockUser.rating}</span>
                  <span className="text-sm text-muted-foreground">({mockUser.totalReviews} reviews)</span>
                </div>
                <p className="text-foreground leading-relaxed">{mockUser.bio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="rounded-xl shadow-sm">
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
                      className="mt-1"
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
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
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
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
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
                    className="mt-1 resize-none"
                  />
                </div>

                {isEditing && (
                  <div className="flex space-x-4">
                    <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white">
                      Save Changes
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Saved Properties</span>
                </CardTitle>
                <p className="text-muted-foreground">Properties you've saved for later</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockFavorites.map((property) => (
                    <Card key={property.id} className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={property.image || "/placeholder.svg"}
                          alt={property.title}
                          className="w-full h-40 object-cover rounded-t-lg"
                        />
                        <button className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/60 rounded-full hover:bg-white dark:hover:bg-black/80 transition-colors">
                          <Heart className="h-4 w-4 text-red-500 fill-current" />
                        </button>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2">{property.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {renderStars(property.rating)}
                            <span className="text-sm text-muted-foreground">{property.rating}</span>
                          </div>
                          <div className="text-lg font-bold text-orange-600">Rs {property.rent.toLocaleString()}</div>
                        </div>
                        <div className="mt-3">
                          <Link href={`/listing/${property.id}`}>
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span>My Reviews</span>
                </CardTitle>
                <p className="text-muted-foreground">Reviews you've written for properties</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{review.propertyTitle}</h3>
                          <p className="text-sm text-muted-foreground">Landlord: {review.landlord}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-muted-foreground">Stayed for {review.stayDuration}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{review.date}</div>
                      </div>
                      <p className="text-foreground leading-relaxed mb-3">{review.review}</p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 bg-transparent"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 bg-transparent"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
