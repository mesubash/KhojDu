"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Search, Navigation } from "lucide-react"

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface GoogleMapsProps {
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  markers?: Array<{
    position: { lat: number; lng: number }
    title: string
    info?: string
    onClick?: () => void
  }>
  searchEnabled?: boolean
  clickToSelect?: boolean
  className?: string
}

export function GoogleMaps({
  center = { lat: 27.7172, lng: 85.324 }, // Kathmandu center
  zoom = 13,
  height = "400px",
  onLocationSelect,
  markers = [],
  searchEnabled = false,
  clickToSelect = false,
  className = "",
}: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`
    script.async = true
    script.defer = true

    window.initMap = () => {
      setIsLoaded(true)
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return

    const googleMap = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
      },
    })

    setMap(googleMap)

    // Add click listener for location selection
    if (clickToSelect) {
      googleMap.addListener("click", (event: any) => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()

        // Reverse geocoding to get address
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            const address = results[0].formatted_address
            setSelectedLocation({ lat, lng, address })
            onLocationSelect?.({ lat, lng, address })

            // Clear existing markers
            markersRef.current.forEach((marker) => marker.setMap(null))
            markersRef.current = []

            // Add new marker
            const marker = new window.google.maps.Marker({
              position: { lat, lng },
              map: googleMap,
              title: "Selected Location",
              icon: {
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 2C11.6 2 8 5.6 8 10C8 16 16 30 16 30S24 16 24 10C24 5.6 20.4 2 16 2ZM16 13C14.3 13 13 11.7 13 10S14.3 7 16 7S19 8.3 19 10S17.7 13 16 13Z" fill="#2563eb"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(32, 32),
              },
            })

            markersRef.current.push(marker)
          }
        })
      })
    }

    // Create info window
    infoWindowRef.current = new window.google.maps.InfoWindow()
  }, [isLoaded, center, zoom, clickToSelect, onLocationSelect, map])

  // Add markers
  useEffect(() => {
    if (!map || !isLoaded) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add new markers
    markers.forEach((markerData) => {
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C11.6 2 8 5.6 8 10C8 16 16 30 16 30S24 16 24 10C24 5.6 20.4 2 16 2ZM16 13C14.3 13 13 11.7 13 10S14.3 7 16 7S19 8.3 19 10S17.7 13 16 13Z" fill="#dc2626"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      })

      if (markerData.info) {
        marker.addListener("click", () => {
          infoWindowRef.current.setContent(`
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937; font-size: 14px;">${markerData.title}</h3>
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.4;">${markerData.info}</p>
            </div>
          `)
          infoWindowRef.current.open(map, marker)
          markerData.onClick?.()
        })
      }

      markersRef.current.push(marker)
    })
  }, [map, markers, isLoaded])

  // Search functionality
  const handleSearch = () => {
    if (!map || !searchQuery.trim()) return

    const service = new window.google.maps.places.PlacesService(map)
    const request = {
      query: `${searchQuery} Kathmandu Nepal`,
      fields: ["name", "geometry", "formatted_address"],
    }

    service.textSearch(request, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
        const place = results[0]
        const location = place.geometry.location

        map.setCenter(location)
        map.setZoom(15)

        if (clickToSelect) {
          const lat = location.lat()
          const lng = location.lng()
          const address = place.formatted_address

          setSelectedLocation({ lat, lng, address })
          onLocationSelect?.({ lat, lng, address })

          // Clear existing markers
          markersRef.current.forEach((marker) => marker.setMap(null))
          markersRef.current = []

          // Add new marker
          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: place.name,
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2C11.6 2 8 5.6 8 10C8 16 16 30 16 30S24 16 24 10C24 5.6 20.4 2 16 2ZM16 13C14.3 13 13 11.7 13 10S14.3 7 16 7S19 8.3 19 10S17.7 13 16 13Z" fill="#2563eb"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
            },
          })

          markersRef.current.push(marker)
        }
      }
    })
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        if (map) {
          map.setCenter({ lat, lng })
          map.setZoom(15)

          if (clickToSelect) {
            // Reverse geocoding to get address
            const geocoder = new window.google.maps.Geocoder()
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              if (status === "OK" && results[0]) {
                const address = results[0].formatted_address
                setSelectedLocation({ lat, lng, address })
                onLocationSelect?.({ lat, lng, address })

                // Clear existing markers
                markersRef.current.forEach((marker) => marker.setMap(null))
                markersRef.current = []

                // Add new marker
                const marker = new window.google.maps.Marker({
                  position: { lat, lng },
                  map,
                  title: "Current Location",
                  icon: {
                    url:
                      "data:image/svg+xml;charset=UTF-8," +
                      encodeURIComponent(`
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2C11.6 2 8 5.6 8 10C8 16 16 30 16 30S24 16 24 10C24 5.6 20.4 2 16 2ZM16 13C14.3 13 13 11.7 13 10S14.3 7 16 7S19 8.3 19 10S17.7 13 16 13Z" fill="#16a34a"/>
                      </svg>
                    `),
                    scaledSize: new window.google.maps.Size(32, 32),
                  },
                })

                markersRef.current.push(marker)
              }
            })
          }
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to get your current location.")
      },
    )
  }

  if (!isLoaded) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading Google Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {searchEnabled && (
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for a location in Kathmandu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none text-sm">
                Search
              </Button>
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent flex-1 sm:flex-none text-sm"
              >
                <Navigation className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">GPS</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div ref={mapRef} className="w-full rounded-lg border border-gray-200" style={{ height }} />

      {selectedLocation && clickToSelect && (
        <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-blue-900 text-sm sm:text-base">Selected Location</h4>
              <p className="text-xs sm:text-sm text-blue-700 break-words">{selectedLocation.address}</p>
              <p className="text-xs text-blue-600 mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {clickToSelect && (
        <p className="text-xs sm:text-sm text-gray-600 text-center">Click on the map to select a location</p>
      )}
    </div>
  )
}
