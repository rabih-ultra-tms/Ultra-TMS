'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_API_KEY } from '@/lib/google-maps'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export interface AddressComponents {
  address: string
  city: string
  state: string
  zip: string
  country?: string
  lat?: number
  lng?: number
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onAddressSelect?: (components: AddressComponents) => void
  placeholder?: string
  id?: string
  className?: string
  disabled?: boolean
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = 'Enter address...',
  id,
  className,
  disabled,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  // Track internal value separately to avoid fighting with Google's autocomplete
  const [internalValue, setInternalValue] = useState(value)
  const isSelectingRef = useRef(false)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  // Sync external value changes to internal state (but not during selection)
  useEffect(() => {
    if (!isSelectingRef.current) {
      setInternalValue(value)
    }
  }, [value])

  // Parse address components from Google Places result
  const parseAddressComponents = useCallback((place: google.maps.places.PlaceResult): AddressComponents => {
    const components: AddressComponents = {
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    }

    let streetNumber = ''
    let route = ''

    place.address_components?.forEach((component) => {
      const types = component.types

      if (types.includes('street_number')) {
        streetNumber = component.long_name
      }
      if (types.includes('route')) {
        route = component.long_name
      }
      if (types.includes('locality') || types.includes('sublocality_level_1')) {
        components.city = component.long_name
      }
      if (types.includes('administrative_area_level_1')) {
        components.state = component.short_name // Use short name for state (e.g., "TX" instead of "Texas")
      }
      if (types.includes('postal_code')) {
        components.zip = component.long_name
      }
      if (types.includes('country')) {
        components.country = component.short_name
      }
    })

    // Combine street number and route for full street address
    components.address = [streetNumber, route].filter(Boolean).join(' ')

    // Get coordinates if available
    if (place.geometry?.location) {
      components.lat = place.geometry.location.lat()
      components.lng = place.geometry.location.lng()
    }

    return components
  }, [])

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || isInitialized) return

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: ['us', 'ca', 'mx'] }, // Restrict to North America
      fields: ['address_components', 'geometry', 'formatted_address'],
      types: ['address'], // Only street addresses
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()

      if (place.address_components) {
        isSelectingRef.current = true
        const components = parseAddressComponents(place)

        // Update internal state with the street address
        setInternalValue(components.address)

        // Notify parent of address change
        onChange(components.address)

        // Notify parent of full address components
        onAddressSelect?.(components)

        // Reset selection flag after a tick
        setTimeout(() => {
          isSelectingRef.current = false
        }, 100)
      }
    })

    autocompleteRef.current = autocomplete
    setIsInitialized(true)

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, isInitialized, onChange, onAddressSelect, parseAddressComponents])

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange(newValue)
  }

  if (loadError) {
    return (
      <Input
        id={id}
        value={internalValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
    )
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        value={internalValue}
        onChange={handleInputChange}
        placeholder={isLoaded ? placeholder : 'Loading...'}
        className={className}
        disabled={disabled || !isLoaded}
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
