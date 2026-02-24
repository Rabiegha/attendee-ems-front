/**
 * Provider WebSocket pour les événements d'impression en temps réel
 * 
 * Se connecte au backend via Socket.IO et écoute les événements
 * 'print-job:updated' pour invalider les caches RTK Query.
 * Aucun toast n'est affiché — les mises à jour sont visibles dans le tableau.
 */

import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectToken, selectIsAuthenticated } from '@/features/auth/model/sessionSlice'
import { socketService } from '@/services/socket.service'

export const PrintJobSocketProvider: React.FC = () => {
  const token = useSelector(selectToken)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketService.disconnect()
      return
    }

    socketService.connect(token)

    return () => {
      // cleanup handled by socketService
    }
  }, [isAuthenticated, token])

  // Provider invisible — maintient la connexion WebSocket
  return null
}
