import React, { useEffect, useRef, useState } from 'react'
import { Input } from './Input'

interface AddressAutocompleteProps {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  onPlaceSelect?: (place: {
    formatted_address: string
    street?: string
    city?: string
    postal_code?: string
    country?: string
    latitude?: number
    longitude?: number
  }) => void
  placeholder?: string
  apiKey: string
  disabled?: boolean
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  id,
  name,
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Rechercher une adresse...',
  apiKey,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  
  // Refs pour les callbacks afin d'éviter la réinitialisation de l'effet
  const onChangeRef = useRef(onChange)
  const onPlaceSelectRef = useRef(onPlaceSelect)

  useEffect(() => {
    onChangeRef.current = onChange
    onPlaceSelectRef.current = onPlaceSelect
  }, [onChange, onPlaceSelect])

  // Repositionner le dropdown quand l'input change de position
  useEffect(() => {
    let observer: MutationObserver | null = null

    const updatePosition = () => {
      const pacContainers = document.querySelectorAll('.pac-container')
      if (!inputRef.current || pacContainers.length === 0) return

      const rect = inputRef.current.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft
      
      const top = `${rect.bottom + scrollTop}px`
      const left = `${rect.left + scrollLeft}px`
      const width = `${rect.width}px`

      pacContainers.forEach((container) => {
        const pacContainer = container as HTMLElement
        
        // Vérifier si les styles sont déjà corrects pour éviter les boucles infinies avec MutationObserver
        if (
            pacContainer.style.top !== top || 
            pacContainer.style.left !== left || 
            pacContainer.style.width !== width
        ) {
             pacContainer.style.top = top
             pacContainer.style.left = left
             pacContainer.style.width = width
        }
      })
    }

    // Observer pour détecter quand Google Maps réinitialise les styles
    observer = new MutationObserver((mutations) => {
        let shouldUpdate = false
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                shouldUpdate = true
                break
            }
        }
        if (shouldUpdate) {
            updatePosition()
        }
    })

    // Fonction pour attacher l'observer aux nouveaux containers
    const checkAndAttach = () => {
        updatePosition()
        const pacContainers = document.querySelectorAll('.pac-container')
        pacContainers.forEach(container => {
            if (observer) {
                observer.observe(container, { attributes: true, attributeFilter: ['style'] })
            }
        })
    }

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    
    // Vérifier régulièrement pour les nouveaux containers (créés par Google Maps)
    const interval = setInterval(checkAndAttach, 200)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
      clearInterval(interval)
      if (observer) observer.disconnect()
    }
  }, [])

  // Charger le script Google Maps
  useEffect(() => {
    if (!apiKey) {
      console.warn('Google Maps API key is missing')
      return
    }

    // Fonction pour vérifier si l'API est chargée
    const isApiLoaded = () => !!(window.google?.maps?.places)

    // Si déjà chargé, on met à jour l'état
    if (isApiLoaded()) {
      setIsScriptLoaded(true)
      return
    }

    // Vérifier si le script est déjà présent dans le DOM (chargé par un autre composant)
    const scriptId = 'google-maps-script'
    const existingScript = document.getElementById(scriptId)

    if (existingScript) {
      // Si le script existe mais n'est pas encore prêt, on attend
      const checkInterval = setInterval(() => {
        if (isApiLoaded()) {
          setIsScriptLoaded(true)
          clearInterval(checkInterval)
        }
      }, 100)

      return () => clearInterval(checkInterval)
    }

    // Charger le script si non présent
    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`
    script.async = true
    script.defer = true
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = () => console.error('Failed to load Google Maps script')
    document.head.appendChild(script)

    return () => {
      // Ne pas supprimer le script car il peut être utilisé ailleurs
    }
  }, [apiKey])

  // Initialiser l'autocomplete une fois le script chargé
  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current || autocompleteRef.current) {
      return
    }

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'address_components', 'geometry', 'name'],
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        const address = place.formatted_address || place.name

        if (!address) {
          return
        }

        // Extraire les composants d'adresse
        let street = ''
        let city = ''
        let postal_code = ''
        let country = ''

        if (place.address_components) {
          place.address_components.forEach((component) => {
            const types = component.types

            if (types.includes('street_number')) {
              street = component.long_name + ' ' + street
            }
            if (types.includes('route')) {
              street += component.long_name
            }
            if (types.includes('locality')) {
              city = component.long_name
            }
            if (types.includes('postal_code')) {
              postal_code = component.long_name
            }
            if (types.includes('country')) {
              country = component.long_name
            }
          })
        }

        const placeData = {
          formatted_address: address,
          street: street.trim() || undefined,
          city: city || undefined,
          postal_code: postal_code || undefined,
          country: country || undefined,
          latitude: place.geometry?.location?.lat() || undefined,
          longitude: place.geometry?.location?.lng() || undefined,
        }

        onChangeRef.current(address)
        onPlaceSelectRef.current?.(placeData)
      })

      autocompleteRef.current = autocomplete
    } catch (error) {
      console.error('Failed to initialize Google Maps Autocomplete:', error)
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
    }
  }, [isScriptLoaded]) // Dépendances réduites pour éviter la réinitialisation

  return (
    <Input
      ref={inputRef}
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="off"
    />
  )
}
