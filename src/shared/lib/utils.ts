import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to locale string
 */
export function formatDate(
  date: Date | string | null | undefined,
  locale = 'fr-FR'
): string {
  if (!date) return '-'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale)
}

/**
 * Format date and time to locale string
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  locale = 'fr-FR'
): string {
  if (!date) return '-'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString(locale)
}

/**
 * Format number with locale
 */
export function formatNumber(num: number, locale = 'fr-FR'): string {
  return num.toLocaleString(locale)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Format attendees count display
 * Shows current/max if there's a limit, otherwise just current count
 */
export function formatAttendeesCount(current: number, max?: number): string {
  const currentCount = current || 0
  
  // Si maxAttendees existe et est une vraie limite (< 999999)
  if (max && max > 0 && max < 999999) {
    return `${currentCount}/${max} participants`
  }
  
  // Sinon, juste le nombre actuel
  return `${currentCount} participant${currentCount !== 1 ? 's' : ''}`
}
