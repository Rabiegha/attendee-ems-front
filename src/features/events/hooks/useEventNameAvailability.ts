import { useState, useEffect, useRef } from 'react'
import { useLazyCheckEventNameAvailabilityQuery } from '../api/eventsApi'

interface UseEventNameAvailabilityResult {
  isChecking: boolean
  isAvailable: boolean | null
  errorMessage: string | null
}

export function useEventNameAvailability(
  name: string,
  debounceMs: number = 500
): UseEventNameAvailabilityResult {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const [checkName] = useLazyCheckEventNameAvailabilityQuery()
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Reset si le nom est vide ou trop court
    if (!name || name.trim().length < 2) {
      setIsAvailable(null)
      setErrorMessage(null)
      setIsChecking(false)
      return
    }

    // Clear le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Commence à vérifier après le debounce
    setIsChecking(true)
    setErrorMessage(null)

    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await checkName(name.trim()).unwrap()
        setIsAvailable(result.available)
        setIsChecking(false)
        
        if (!result.available) {
          setErrorMessage('Ce nom d\'événement est déjà utilisé')
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du nom:', error)
        setIsAvailable(null)
        setErrorMessage('Impossible de vérifier la disponibilité')
        setIsChecking(false)
      }
    }, debounceMs)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [name, debounceMs, checkName])

  return { isChecking, isAvailable, errorMessage }
}
