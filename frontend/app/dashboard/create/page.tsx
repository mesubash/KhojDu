"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Home, ArrowLeft, Upload, MapPin, X, Wifi, Car, Droplets, Zap, Shield, Tv, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { GoogleMaps } from "@/components/google-maps"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { createProperty, fetchLandlordProperty, updateProperty, uploadPropertyImages, fetchAmenities } from "@/services/propertyService"
import type { PropertyType, Amenity } from "@/types/property"
import { toast } from "sonner"

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

const iconForAmenity = (amenity: Amenity) => {
  const key = amenity.name.toLowerCase()
  if (key.includes("wifi") || key.includes("internet")) return Wifi
  if (key.includes("parking")) return Car
  if (key.includes("water")) return Droplets
  if (key.includes("power") || key.includes("electric")) return Zap
  if (key.includes("security")) return Shield
  if (key.includes("tv")) return Tv
  return Home
}

export default function CreateListingPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get("id")

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login?redirect=/dashboard/create")
    }
  }, [isAuthenticated, router])

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingExisting, setIsLoadingExisting] = useState(false)
  const [amenityOptions, setAmenityOptions] = useState<Amenity[]>([])
  const [formData, setFormData] = useState({
    title: "",
    type: "" as PropertyType | "",
    area: "",
    rent: "",
    deposit: "",
    description: "",
  })

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((id) => id !== amenityId) : [...prev, amenityId],
    )
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files)
    const previews = newFiles.map((file) => URL.createObjectURL(file))
    setImageFiles((prev) => [...prev, ...newFiles])
    setUploadedImages((prev) => [...prev, ...previews])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Prefill form when editing
  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) return
      setIsLoadingExisting(true)
      try {
        const data = await fetchLandlordProperty(propertyId)
        setFormData({
          title: data.title || "",
          type: (data.propertyType as PropertyType) || "",
          area: data.city || data.district || "",
          rent: data.monthlyRent?.toString() || "",
          deposit: data.securityDeposit?.toString() || "",
          description: data.description || "",
        })
        if (data.latitude && data.longitude) {
          setSelectedLocation({
            lat: Number(data.latitude),
            lng: Number(data.longitude),
            address: data.address || "",
          })
        }
        if (data.images && data.images.length) {
          setExistingImages(data.images.map((img) => img.imageUrl))
        }
        if (data.amenities && data.amenities.length) {
          setSelectedAmenities(data.amenities.map((a) => a.id))
        }
      } catch (err) {
        console.error("[Create Listing] Failed to load property", err)
        toast.error("Could not load listing for edit.")
      } finally {
        setIsLoadingExisting(false)
      }
    }
    loadProperty()
  }, [propertyId])

  // Load amenities from backend
  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const amenities = await fetchAmenities()
        setAmenityOptions(amenities)
      } catch (err) {
        console.error("[Create Listing] Failed to load amenities", err)
        toast.error("Could not load amenities.")
      }
    }
    loadAmenities()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.type) {
      toast.error("Please select a property type.")
      return
    }

    if (!formData.area) {
      toast.error("Please select or enter a location/area.")
      return
    }

    const trimmedArea = formData.area.trim()
    if (!trimmedArea) {
      toast.error("Please enter a valid area/city.")
      return
    }

    const rentValue = Number(formData.rent)
    if (Number.isNaN(rentValue) || rentValue <= 0) {
      toast.error("Please enter a valid monthly rent.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        propertyType: formData.type as PropertyType,
        address: selectedLocation?.address || trimmedArea || formData.title,
        city: trimmedArea,
        district: trimmedArea,
        latitude: selectedLocation?.lat,
        longitude: selectedLocation?.lng,
        monthlyRent: rentValue,
        securityDeposit: formData.deposit ? Number(formData.deposit) : undefined,
        parkingAvailable: selectedAmenities.some((id) =>
          amenityOptions.find((a) => a.id === id)?.name.toLowerCase().includes("parking")
        ),
        internetIncluded: selectedAmenities.some((id) =>
          amenityOptions.find((a) => a.id === id)?.name.toLowerCase().includes("wifi")
        ),
        utilitiesIncluded: selectedAmenities.some((id) => {
          const name = amenityOptions.find((a) => a.id === id)?.name.toLowerCase() || ""
          return name.includes("water") || name.includes("electric")
        }) || undefined,
        amenityIds: selectedAmenities.length ? selectedAmenities : undefined,
      }

      let targetPropertyId = propertyId

      if (propertyId) {
        await updateProperty(propertyId, payload)
        toast.success("Property updated successfully.")
      } else {
        const created = await createProperty(payload)
        targetPropertyId = created?.id || created
        toast.success("Property created successfully.")
      }

      if (targetPropertyId && imageFiles.length) {
        await uploadPropertyImages(targetPropertyId, imageFiles)
        toast.success("Images uploaded successfully.")
      }

      router.replace("/dashboard/landlord")
    } catch (err: any) {
      console.error("[Create Listing] Failed to create property", err)
      const msg =
        err?.code === "ECONNABORTED"
          ? "Image upload is taking too long. Try fewer/smaller images."
          : err?.response?.data?.message || "Could not save the property. Please try again."
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
      {/* Sidebar placeholder spacing to align with landlord dashboard */}
      <div className="hidden lg:block w-64" />

      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/dashboard/landlord" className="flex items-center space-x-2 text-orange-500 hover:text-orange-600">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {propertyId ? "Edit Listing" : "Create New Listing"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {propertyId ? "Update your property details" : "Add your property details to attract potential tenants"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <Card className="rounded-xl border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-foreground">Basic Information</CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">Provide essential details about your property</p>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  Property Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Cozy Room in Thamel"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  className="mt-1 h-10 sm:h-12"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">Property Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value as PropertyType)} required>
                    <SelectTrigger className="mt-1 h-10 sm:h-12">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROOM">Room</SelectItem>
                      <SelectItem value="FLAT">Flat</SelectItem>
                      <SelectItem value="HOUSE">House</SelectItem>
                      <SelectItem value="APARTMENT">Apartment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">Kathmandu Area *</Label>
                  <Select value={formData.area} onValueChange={(value) => handleInputChange("area", value)} required>
                    <SelectTrigger className="mt-1 h-10 sm:h-12">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {kathmanduAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rent" className="text-sm font-medium text-foreground">
                    Monthly Rent (Rs) *
                  </Label>
                  <Input
                    id="rent"
                    type="number"
                    placeholder="15000"
                    value={formData.rent}
                    onChange={(e) => handleInputChange("rent", e.target.value)}
                    required
                    className="mt-1 h-10 sm:h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="deposit" className="text-sm font-medium text-foreground">
                    Security Deposit (Rs) *
                  </Label>
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="30000"
                    value={formData.deposit}
                    onChange={(e) => handleInputChange("deposit", e.target.value)}
                    required
                    className="mt-1 h-10 sm:h-12"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property, nearby facilities, and what makes it special..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className="mt-1 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="rounded-xl border-border">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-foreground">Amenities</CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">Select available amenities</p>
            </CardHeader>
            <CardContent>
              {amenityOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No amenities available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {amenityOptions.map((amenity) => {
                    const Icon = iconForAmenity(amenity)
                    const isSelected = selectedAmenities.includes(amenity.id)

                    return (
                      <div
                        key={amenity.id}
                        onClick={() => handleAmenityToggle(amenity.id)}
                        className={`flex items-center space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400"
                            : "border-border hover:border-orange-300 hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="font-medium text-sm sm:text-base">{amenity.name}</span>
                        {isSelected && <Check className="h-4 w-4 ml-auto" />}
                      </div>
                    )
                  })}
                </div>
              )}
              {selectedAmenities.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Selected:</span>
                  {selectedAmenities.map((amenityId) => {
                    const amenity = amenityOptions.find((a) => a.id === amenityId)
                    return (
                      <Badge key={amenityId} variant="secondary" className="text-xs">
                        {amenity?.name}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google Maps Location */}
          <Card className="rounded-xl border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-foreground">
                <MapPin className="h-5 w-5" />
                <span>Property Location *</span>
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">Pin your exact location on the map</p>
            </CardHeader>
            <CardContent>
              <GoogleMaps
                searchEnabled
                clickToSelect
                height="400px"
                onLocationSelect={(location) => {
                  setSelectedLocation(location)
                }}
              />
              {selectedLocation && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">Location Selected</p>
                      <p className="text-xs text-green-700 dark:text-green-400">{selectedLocation.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="rounded-xl border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-foreground">
                <Upload className="h-5 w-5" />
                <span>Property Photos *</span>
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">Upload high-quality photos of your property</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
                    dragActive ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" : "border-muted-foreground/25 hover:border-orange-400 hover:bg-muted/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2 font-medium text-sm sm:text-base">Drag and drop images here</p>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 mb-4">or click to browse files</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openFilePicker}
                      className="cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                    >
                      Choose Files
                    </Button>
                  </Label>
                </div>

                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Current Images ({existingImages.length})</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg"
                          />
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs">
                              Cover Photo
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">New Uploads ({uploadedImages.length})</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs">
                              Cover Photo
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg h-12 text-base font-medium"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {propertyId ? "Saving..." : "Creating..."}
                </span>
              ) : (
                propertyId ? "Save Changes" : "Create Listing"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="w-full sm:w-auto border-border h-12 px-8"
            >
              Save as Draft
            </Button>
            <Button type="button" variant="ghost" disabled={isSubmitting} className="w-full sm:w-auto text-muted-foreground h-12 px-8">
              Preview
            </Button>
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}
