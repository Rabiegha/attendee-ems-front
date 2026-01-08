import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectOrganization } from '@/features/auth/model/sessionSlice'
import { useLazyCheckAttendeeTypeNameQuery } from '../api/attendeeTypesApi'

interface UseAttendeeTypeNameAvailabilityResult {
  isChecking: boolean
  isAvailable: boolean | null
  errorMessage: string | null
}

export function useAttendeeTypeNameAvailability(
  name: string,
  excludeId?: string,
  debounceMs: number = 500
): UseAttendeeTypeNameAvailabilityResult {
  const currentOrg = useSelector(selectOrganization)
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const [checkName] = useLazyCheckAttendeeTypeNameQuery()
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    // Reset si le nom est vide ou trop court
    if (!name || name.trim().length < 1 || !currentOrg?.id) {
      setIsAvailable(null)
      setErrorMessage(null)
      setIsChecking(false)
      return
    }

    // Clear le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Commence à vérifier immédiatement (visuellement)
    setIsChecking(true)
    setErrorMessage(null)
    setIsAvailable(null)

    timeoutRef.current = setTimeout(async () => {
      try {
        const params: { orgId: string; name: string; excludeId?: string } = {
          orgId: currentOrg.id,
          name: name.trim(),
        }
        if (excludeId) {
          params.excludeId = excludeId
        }
        const result = await checkName(params).unwrap()
        
        setIsAvailable(result.available)
        
        if (!result.available) {
          setErrorMessage('Ce nom est déjà utilisé')
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du nom:', error)
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [name, excludeId, currentOrg?.id, debounceMs, checkName])

  return { isChecking, isAvailable, errorMessage }
}
