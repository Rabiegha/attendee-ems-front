/**
 * Provider WebSocket pour les notifications d'impression en temps réel
 * 
 * Se connecte au backend via Socket.IO, écoute les événements
 * 'print-job:updated' et affiche des toasts de feedback.
 */

import React, { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectToken, selectIsAuthenticated } from '@/features/auth/model/sessionSlice'
import { socketService } from '@/services/socket.service'
import { addToast } from '@/shared/ui/toast-slice'

interface PrintJobUpdate {
  id: string
  status: 'PENDING' | 'PRINTING' | 'COMPLETED' | 'FAILED'
  printer_name?: string
  error?: string
  registration?: {
    id: string
    attendee_first_name?: string
    attendee_last_name?: string
    first_name?: string
    last_name?: string
  }
}

export const PrintJobSocketProvider: React.FC = () => {
  const token = useSelector(selectToken)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const dispatch = useDispatch()

  const handlePrintJobUpdated = useCallback((data: PrintJobUpdate) => {
    console.log('[PrintSocket] Print job updated:', data.id, '→', data.status)

    const reg = data.registration
    const name = reg
      ? `${reg.attendee_first_name || reg.first_name || ''} ${reg.attendee_last_name || reg.last_name || ''}`.trim()
      : ''
    const printerInfo = data.printer_name ? ` (${data.printer_name})` : ''

    switch (data.status) {
      case 'COMPLETED':
        dispatch(addToast({
          type: 'success',
          title: name ? `Badge de ${name} imprimé` : 'Badge imprimé',
          message: `Impression terminée${printerInfo}`,
          duration: 4000,
        }))
        break

      case 'FAILED':
        dispatch(addToast({
          type: 'error',
          title: name ? `Échec pour ${name}` : 'Échec d\'impression',
          message: data.error || `L'impression a échoué${printerInfo}`,
          duration: 8000,
        }))
        break

      case 'PRINTING':
        dispatch(addToast({
          type: 'info',
          title: 'Impression en cours',
          message: name
            ? `${name}${printerInfo}`
            : `Envoi à l'imprimante${printerInfo}`,
          duration: 2000,
        }))
        break
    }
  }, [dispatch])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketService.disconnect()
      return
    }

    socketService.connect(token)
    socketService.on('print-job:updated', handlePrintJobUpdated)

    return () => {
      socketService.off('print-job:updated', handlePrintJobUpdated)
    }
  }, [isAuthenticated, token, handlePrintJobUpdated])

  // Provider invisible — juste pour les effets de bord
  return null
}
