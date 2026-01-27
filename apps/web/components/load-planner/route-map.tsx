'use client'

import { useCallback, useState, useMemo, useRef } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_API_KEY } from '@/lib/google-maps'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, MapPin, Route, Maximize2, Minimize2, RefreshCw } from 'lucide-react'

const containerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795, // Center of US
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
}

interface RouteLocation {
  address: string
  city: string
  state: string
  zip: string
}

interface RouteCalculatedData {
  polyline: string
  distance_miles: number
  duration_minutes: number
}

interface RouteMapProps {
  pickup?: RouteLocation
  dropoff?: RouteLocation
  className?: string
  onRouteCalculated?: (data: RouteCalculatedData) => void
}

interface RouteInfo {
  distance: string
  duration: string
}

export function RouteMap({ pickup, dropoff, className, onRouteCalculated }: RouteMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // Track what we've already calculated to prevent duplicate API calls
  const lastCalculatedRef = useRef<string>('')
  const isCalculatingRef = useRef(false)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  // Check if we have valid addresses
  const hasValidAddresses = useMemo(() => {
    return (
      pickup?.address.trim() &&
      pickup?.city.trim() &&
      pickup?.state.trim() &&
      dropoff?.address.trim() &&
      dropoff?.city.trim() &&
      dropoff?.state.trim()
    )
  }, [pickup, dropoff])

  // Create full address strings
  const pickupFullAddress = useMemo(() => {
    if (!pickup) return ''
    return `${pickup.address}, ${pickup.city}, ${pickup.state} ${pickup.zip}`.trim()
  }, [pickup])

  const dropoffFullAddress = useMemo(() => {
    if (!dropoff) return ''
    return `${dropoff.address}, ${dropoff.city}, ${dropoff.state} ${dropoff.zip}`.trim()
  }, [dropoff])

  // Create a stable hash of addresses to detect actual changes
  const addressesHash = useMemo(() => {
    return `${pickupFullAddress}|${dropoffFullAddress}`
  }, [pickupFullAddress, dropoffFullAddress])

  // Calculate route - now manually triggered
  const calculateRoute = useCallback(async () => {
    if (!isLoaded || !hasValidAddresses) return

    // Prevent duplicate calculations
    if (isCalculatingRef.current) return
    if (lastCalculatedRef.current === addressesHash && directions) {
      return // Already calculated this exact route
    }

    isCalculatingRef.current = true
    setIsCalculating(true)

    const directionsService = new google.maps.DirectionsService()

    try {
      const result = await directionsService.route({
        origin: pickupFullAddress,
        destination: dropoffFullAddress,
        travelMode: google.maps.TravelMode.DRIVING,
      })

      setDirections(result)

      // Extract route info and polyline
      const route = result.routes[0]
      const leg = route?.legs[0]
      if (leg && route) {
        setRouteInfo({
          distance: leg.distance?.text || 'N/A',
          duration: leg.duration?.text || 'N/A',
        })

        // Extract distance and duration
        const distanceMeters = leg.distance?.value || 0
        const durationSeconds = leg.duration?.value || 0
        const distanceMiles = Math.round(distanceMeters * 0.000621371 * 10) / 10
        const durationMinutes = Math.round(durationSeconds / 60)

        // Pass the polyline back via callback
        const overviewPolyline = route.overview_polyline as unknown
        const polylineString =
          typeof overviewPolyline === 'string'
            ? overviewPolyline
            : (overviewPolyline as { points?: string })?.points
        if (onRouteCalculated && polylineString) {
          onRouteCalculated({
            polyline: polylineString,
            distance_miles: distanceMiles,
            duration_minutes: durationMinutes,
          })
        }
      }

      lastCalculatedRef.current = addressesHash

      // Fit bounds to show the route
      if (map && result.routes[0]) {
        const bounds = new google.maps.LatLngBounds()
        result.routes[0].legs[0]?.steps.forEach((step) => {
          bounds.extend(step.start_location)
          bounds.extend(step.end_location)
        })
        map.fitBounds(bounds, 50)
      }
    } catch (error) {
      console.error('Failed to calculate route:', error)
    } finally {
      isCalculatingRef.current = false
      setIsCalculating(false)
    }
  }, [
    isLoaded,
    hasValidAddresses,
    addressesHash,
    pickupFullAddress,
    dropoffFullAddress,
    map,
    onRouteCalculated,
    directions,
  ])

  // Check if route needs recalculation (addresses changed since last calculation)
  const needsRecalculation =
    addressesHash !== lastCalculatedRef.current && hasValidAddresses

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  if (loadError) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>Failed to load Google Maps</p>
        </CardContent>
      </Card>
    )
  }

  if (!isLoaded) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading map...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Route Map
          </span>
          <div className="flex items-center gap-2">
            {isCalculating && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Calculating...
              </span>
            )}
            {needsRecalculation && !isCalculating && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={calculateRoute}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Calculate
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <div className={isExpanded ? 'h-[600px]' : 'h-[400px]'}>
        {!hasValidAddresses ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/30">
            <MapPin className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Enter pickup and dropoff addresses</p>
            <p className="text-xs">to see routes on the map</p>
          </div>
        ) : !directions && !isCalculating ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/30">
            <Route className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Click &quot;Calculate&quot; to show route</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={calculateRoute}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Calculate Route
            </Button>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={4}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
          >
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeColor: '#6366F1',
                    strokeWeight: 4,
                    strokeOpacity: 0.8,
                  },
                }}
              />
            )}
          </GoogleMap>
        )}
      </div>
      {/* Route info summary */}
      {routeInfo && (
        <div className="p-3 border-t bg-muted/20">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Route Summary</span>
            <div className="text-muted-foreground">
              {routeInfo.distance} • {routeInfo.duration}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
