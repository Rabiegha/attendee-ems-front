import { useCallback } from 'react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

// Hook simple pour les toasts (version basique sans provider pour l'instant)
export const useToast = () => {
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    // Pour l'instant, on utilise un simple console.log en attendant l'implémentation complète
    console.log(
      `[TOAST ${toast.type.toUpperCase()}] ${toast.title}`,
      toast.description
    )

    // TODO: Implémenter le système de toast complet avec provider React
    // En attendant, on peut utiliser les notifications du navigateur ou un alert simple
    if (toast.type === 'success') {
      // alert(`✅ ${toast.title}${toast.description ? `: ${toast.description}` : ''}`)
    } else if (toast.type === 'error') {
      // alert(`❌ ${toast.title}${toast.description ? `: ${toast.description}` : ''}`)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    console.log(`[TOAST] Removing toast ${id}`)
  }, [])

  return {
    toast: addToast,
    success: (title: string, description?: string) =>
      addToast({
        type: 'success',
        title,
        ...(description && { description }),
      }),
    error: (title: string, description?: string) =>
      addToast({
        type: 'error',
        title,
        ...(description && { description }),
      }),
    warning: (title: string, description?: string) =>
      addToast({
        type: 'warning',
        title,
        ...(description && { description }),
      }),
    info: (title: string, description?: string) =>
      addToast({
        type: 'info',
        title,
        ...(description && { description }),
      }),
    removeToast,
  }
}
