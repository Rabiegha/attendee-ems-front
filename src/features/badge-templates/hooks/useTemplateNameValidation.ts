import { useState, useEffect } from 'react'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useGetBadgeTemplatesQuery, type BadgeTemplate } from '../api/badgeTemplatesApi'

interface UseTemplateNameValidationProps {
  name: string
  currentTemplateId?: string // Pour exclure le template actuel lors de l'édition
}

export function useTemplateNameValidation({ 
  name, 
  currentTemplateId 
}: UseTemplateNameValidationProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  
  const debouncedName = useDebounce(name.trim(), 500)
  
  // Utiliser le hook RTK Query pour récupérer les templates
  const { data: templates, isLoading, error } = useGetBadgeTemplatesQuery({})

  useEffect(() => {
    if (!debouncedName || debouncedName.length < 2) {
      setIsAvailable(null)
      return
    }

    if (templates && !isLoading) {
      // Vérifier si le nom existe déjà (en excluant le template actuel si on est en édition)
      const nameExists = templates.some((template: BadgeTemplate) => 
        template.name.toLowerCase() === debouncedName.toLowerCase() && 
        template.id !== currentTemplateId
      )
      
      setIsAvailable(!nameExists)
    }
  }, [debouncedName, templates, isLoading, currentTemplateId])

  return {
    isChecking: isLoading,
    isAvailable,
    error: error ? 'Erreur lors de la vérification du nom' : null,
    shouldShowValidation: debouncedName.length >= 2
  }
}