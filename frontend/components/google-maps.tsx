"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Search, Navigation } from "lucide-react"

declare global {
  interface Window {
    L: any
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

// OpenStreetMap + Leaflet implementation, exported with the same name for drop-in replacement.
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

  // Load Leaflet assets from CDN once on the client
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.L) {
      setIsLoaded(true)
      return
    }

    const existingCss = document.getElementById("leaflet-css")
    if (!existingCss) {
      const link = document.createElement("link")
      link.id = "leaflet-css"
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      link.crossOrigin = ""
      document.head.appendChild(link)
    }

    const script = document.createElement("script")
    script.id = "leaflet-js"
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.async = true
    script.onload = () => setIsLoaded(true)
    script.onerror = () => setIsLoaded(false)
    document.head.appendChild(script)

    return () => {
      // Keep assets for subsequent mounts; no cleanup to avoid flicker
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return
    if (!window.L) return

    const leaflet = window.L
    const mapInstance = leaflet.map(mapRef.current).setView([center.lat, center.lng], zoom)

    leaflet
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      })
      .addTo(mapInstance)

    // Disable scroll zoom on mobile-esque experiences but keep pinch/drag
    mapInstance.scrollWheelZoom.enable()
    setMap(mapInstance)

    if (clickToSelect) {
      mapInstance.on("click", async (event: any) => {
        const { lat, lng } = event.latlng
        const address = await reverseGeocode(lat, lng)
        setSelectedLocation({ lat, lng, address })
        onLocationSelect?.({ lat, lng, address })
        addSelectionMarker(mapInstance, lat, lng, "Selected Location")
      })
    }
  }, [isLoaded, center.lat, center.lng, zoom, clickToSelect, onLocationSelect, map])

  // Update markers from props
  useEffect(() => {
    if (!map || !isLoaded || !window.L) return
    const leaflet = window.L

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    markers.forEach((markerData) => {
      const marker = leaflet
        .marker([markerData.position.lat, markerData.position.lng], {
          title: markerData.title,
        })
        .addTo(map)

      if (markerData.info) {
        marker.bindPopup(
          `<div style="padding:6px;max-width:220px"><strong>${markerData.title}</strong><div style="color:#6b7280;font-size:12px;margin-top:4px;">${markerData.info}</div></div>`
        )
      }

      if (markerData.onClick) {
        marker.on("click", markerData.onClick)
      }

      markersRef.current.push(marker)
    })
  }, [map, markers, isLoaded])

  const addSelectionMarker = (mapInstance: any, lat: number, lng: number, title: string) => {
    if (!window.L) return
    const leaflet = window.L

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const marker = leaflet
      .marker([lat, lng], {
        title,
      })
      .addTo(mapInstance)

    markersRef.current.push(marker)
  }

  // Simple search via Nominatim (OSM). Keep it lightweight and fail-safe.
  const handleSearch = async () => {
    if (!map || !searchQuery.trim()) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      )
      const results = await response.json()
      if (Array.isArray(results) && results[0]) {
        const lat = parseFloat(results[0].lat)
        const lng = parseFloat(results[0].lon)
        map.setView([lat, lng], 15)

        if (clickToSelect) {
          const address = results[0].display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          setSelectedLocation({ lat, lng, address })
          onLocationSelect?.({ lat, lng, address })
          addSelectionMarker(map, lat, lng, "Selected Location")
        }
      }
    } catch (error) {
      console.error("[Map] Search failed", error)
    }
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      const data = await response.json()
      return data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
      console.warn("[Map] Reverse geocode failed", error)
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        if (map) {
          map.setView([lat, lng], 15)

          if (clickToSelect) {
            const address = await reverseGeocode(lat, lng)
            setSelectedLocation({ lat, lng, address })
            onLocationSelect?.({ lat, lng, address })
            addSelectionMarker(map, lat, lng, "Current Location")
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
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading map...</p>
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
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
