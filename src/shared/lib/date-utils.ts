/**
 * Utilitaires pour la gestion des dates
 * Utilisé pour convertir entre strings ISO et objets Date selon le contexte
 */

/**
 * Convertit une date ISO string en objet Date
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString)
}

/**
 * Convertit un objet Date en string ISO
 */
export const formatDateToISO = (date: Date): string => {
  return date.toISOString()
}

/**
 * Formate une date ISO string pour affichage
 */
export const formatDateForDisplay = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = new Date(dateString)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return date.toLocaleDateString('fr-FR', { ...defaultOptions, ...options })
}

/**
 * Formate une date ISO string pour les inputs datetime-local
 */
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString)
  // Format YYYY-MM-DDTHH:mm pour les inputs datetime-local
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Calcule les jours jusqu'à une date
 */
export const getDaysUntil = (dateString: string): number => {
  const targetDate = new Date(dateString)
  const now = new Date()
  return Math.ceil(
    (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
}

/**
 * Calcule la durée entre deux dates en heures
 */
export const getDurationInHours = (
  startDateString: string,
  endDateString: string
): number => {
  const start = new Date(startDateString)
  const end = new Date(endDateString)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60))
}

/**
 * Vérifie si une date est dans le passé
 */
export const isDateInPast = (dateString: string): boolean => {
  const date = new Date(dateString)
  const now = new Date()
  return date < now
}

/**
 * Vérifie si une date est aujourd'hui
 */
export const isDateToday = (dateString: string): boolean => {
  const date = new Date(dateString)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}
