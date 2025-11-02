/**
 * GooglePlacesAutocomplete - Composant d'autocomplete pour les adresses avec Google Places API
 * Utilise l'API Google Places Autocomplete pour rechercher et sélectionner des adresses
 */

import React, { useEffect, useRef } from 'react'

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
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Charger le script Google Maps et initialiser l'autocomplete
  useEffect(() => {
    if (!apiKey || !inputRef.current) {
      return
    }

    const initAutocomplete = () => {
      if (!inputRef.current || autocompleteRef.current) {
        return
      }

      try {
        // Créer l'instance Autocomplete
        autocompleteRef.current = new google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            fields: [
              'formatted_address',
              'address_components',
              'geometry',
              'place_id',
            ],
          }
        )

        // Écouter l'événement place_changed
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace()

          if (!place || !place.geometry) {
            return
          }

          // Extraire les détails de l'adresse
          const addressComponents = place.address_components || []
          const details: PlaceDetails = {
            formatted_address: place.formatted_address || '',
            latitude: place.geometry.location?.lat() || 0,
            longitude: place.geometry.location?.lng() || 0,
            place_id: place.place_id || '',
          }

          // Extraire les composants d'adresse
          addressComponents.forEach((component) => {
            const types = component.types

            if (types.includes('street_number')) {
              details.street = component.long_name + ' ' + (details.street || '')
            } else if (types.includes('route')) {
              details.street = (details.street || '') + component.long_name
            } else if (
              types.includes('locality') ||
              types.includes('postal_town')
            ) {
              details.city = component.long_name
            } else if (types.includes('postal_code')) {
              details.postal_code = component.long_name
            } else if (types.includes('country')) {
              details.country = component.long_name
            }
          })

          // Mettre à jour la valeur
          onChange(details.formatted_address)

          // Callback avec les détails complets
          if (onPlaceSelect) {
            onPlaceSelect(details)
          }
        })
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error)
      }
    }

    // Vérifier si le script Google Maps est déjà chargé
    if (window.google?.maps?.places) {
      initAutocomplete()
    } else {
      // Charger le script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
      script.async = true
      script.defer = true
      script.onload = () => initAutocomplete()
      script.onerror = () => console.error('Failed to load Google Maps script')
      
      // Vérifier si le script n'est pas déjà dans le DOM
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
      if (!existingScript) {
        document.head.appendChild(script)
      } else {
        // Le script existe, attendre qu'il se charge
        const checkGoogle = setInterval(() => {
          if (window.google?.maps?.places) {
            clearInterval(checkGoogle)
            initAutocomplete()
          }
        }, 100)
        
        // Timeout après 10 secondes
        setTimeout(() => clearInterval(checkGoogle), 10000)
      }
    }

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [apiKey, onChange, onPlaceSelect])

  return (
    <input
      ref={inputRef}
      id={id}
      name={name}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="off"
      className={`
        w-full px-4 py-2.5 
        bg-white dark:bg-gray-800 
        border border-gray-300 dark:border-gray-600 
        rounded-lg 
        text-gray-900 dark:text-white
        placeholder:text-gray-500 dark:placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
    />
  )
}

export const GooglePlacesAutocompleteWithProvider = GooglePlacesAutocomplete
