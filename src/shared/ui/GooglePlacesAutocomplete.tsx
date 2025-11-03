import React, { useRef, useEffect } from 'react'
import Autocomplete from 'react-google-autocomplete'

interface PlaceDetails {
  formatted_address: string
  street?: string
  city?: string
  postal_code?: string
  country?: string
  latitude: number
  longitude: number
  place_id: string
}

interface GooglePlacesAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelect?: (place: PlaceDetails) => void
  placeholder?: string
  apiKey: string
  id?: string
  name?: string
  disabled?: boolean
  className?: string
}

export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Rechercher une adresse...',
  apiKey,
  id,
  name,
  disabled,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  // Repositionner le dropdown Google Maps sous l'input
  useEffect(() => {
    const repositionDropdown = () => {
      const input = inputRef.current
      const dropdowns = document.querySelectorAll('.pac-container') as NodeListOf<HTMLElement>
      
      if (!input || dropdowns.length === 0) return

      const rect = input.getBoundingClientRect()
      
      // Positionner tous les dropdowns (parfois Google en crée plusieurs)
      dropdowns.forEach((dropdown) => {
        dropdown.style.top = `${rect.bottom + window.scrollY}px`
        dropdown.style.left = `${rect.left + window.scrollX}px`
        dropdown.style.width = `${rect.width}px`
      })
    }

    // Observer pour détecter l'apparition du dropdown
    const observer = new MutationObserver(() => {
      repositionDropdown()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Repositionner au resize
    window.addEventListener('resize', repositionDropdown)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', repositionDropdown)
    }
  }, [])

  return (
    <Autocomplete
      ref={inputRef}
      apiKey={apiKey}
      id={id}
      name={name}
      placeholder={placeholder}
      disabled={disabled}
      defaultValue={value}
      onPlaceSelected={(place: any) => {
        if (!place || !place.geometry) return
        const addressComponents = place.address_components || []
        const details: PlaceDetails = {
          formatted_address: place.formatted_address || '',
          latitude: place.geometry.location?.lat() || 0,
          longitude: place.geometry.location?.lng() || 0,
          place_id: place.place_id || '',
        }
        addressComponents.forEach((component: any) => {
          const types = component.types
          if (types.includes('street_number')) {
            details.street = component.long_name + ' ' + (details.street || '')
          } else if (types.includes('route')) {
            details.street = (details.street || '') + component.long_name
          } else if (types.includes('locality') || types.includes('postal_town')) {
            details.city = component.long_name
          } else if (types.includes('postal_code')) {
            details.postal_code = component.long_name
          } else if (types.includes('country')) {
            details.country = component.long_name
          }
        })
        onChange(details.formatted_address)
        if (onPlaceSelect) onPlaceSelect(details)
      }}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      options={{
        types: ['address'],
        fields: ['formatted_address', 'address_components', 'geometry', 'place_id'],
      }}
      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed transition-colors duration-200"
    />
  )
}

export const GooglePlacesAutocompleteWithProvider = GooglePlacesAutocomplete
