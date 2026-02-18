/**
 * Service WebSocket pour le frontend web
 * Se connecte au backend via Socket.IO pour les événements temps réel
 */

import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null

  connect(token: string) {
    if (this.socket?.connected) return

    const apiUrl = import.meta.env.VITE_API_BASE_URL || ''
    const baseUrl = apiUrl.replace(/\/api\/?$/, '')

    console.log('[Socket] Connecting to:', `${baseUrl}/events`)

    this.socket = io(`${baseUrl}/events`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    })

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message)
    })
  }

  disconnect() {
    if (this.socket) {
      console.log('[Socket] Disconnecting...')
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback)
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback)
    } else {
      this.socket?.off(event)
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

export const socketService = new SocketService()
