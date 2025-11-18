import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectToken } from '@/features/auth/model/sessionSlice'
import { Modal } from '@/shared/ui/Modal'
import { QrCodeIcon, DownloadIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { LoadingState } from '@/shared/ui'
import type { RegistrationDPO } from '../dpo/registration.dpo'

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  registration: RegistrationDPO
}

export function QrCodeModal({ isOpen, onClose, registration }: QrCodeModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const token = useSelector(selectToken)
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

  // Fetch QR Code with authentication
  useEffect(() => {
    if (!isOpen || !token) {
      setIsLoading(false)
      return
    }

    const fetchQrCode = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        console.log('[QR Code] Fetching:', `${API_URL}/registrations/${registration.id}/qr-code`)
        
        const response = await fetch(
          `${API_URL}/registrations/${registration.id}/qr-code?format=png`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        console.log('[QR Code] Response status:', response.status)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const blob = await response.blob()
        const dataUrl = URL.createObjectURL(blob)
        console.log('[QR Code] Loaded successfully')
        setQrCodeDataUrl(dataUrl)
      } catch (err) {
        console.error('[QR Code] Failed to load:', err)
        setError('Erreur de chargement du QR Code')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQrCode()

    // Cleanup blob URL on unmount
    return () => {
      if (qrCodeDataUrl) {
        console.log('[QR Code] Cleanup blob URL')
        URL.revokeObjectURL(qrCodeDataUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, registration.id, API_URL, token])

  const handleDownload = async () => {
    if (!qrCodeDataUrl) return

    try {
      setIsDownloading(true)
      
      // Convert blob URL to blob for download
      const response = await fetch(qrCodeDataUrl)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-code-${registration.attendee?.firstName}-${registration.attendee?.lastName}-${registration.id.slice(0, 8)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading QR Code:', error)
      alert('Erreur lors du téléchargement du QR Code')
    } finally {
      setIsDownloading(false)
    }
  }

  const attendeeName = registration.attendee
    ? `${registration.attendee.firstName} ${registration.attendee.lastName}`
    : 'Participant'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Code Check-in"
      maxWidth="md"
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Attendee Info */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {attendeeName}
          </h3>
          {registration.attendee?.email && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {registration.attendee.email}
            </p>
          )}
          {registration.attendee?.company && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {registration.attendee.company}
            </p>
          )}
        </div>

        {/* Check-in Status */}
        <div className="flex items-center gap-2">
          {registration.checkedInAt ? (
            <>
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Checked-in le{' '}
                {new Date(registration.checkedInAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </>
          ) : (
            <>
              <XCircleIcon className="w-5 h-5 text-gray-400 dark:text-gray-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pas encore enregistré
              </span>
            </>
          )}
        </div>

        {/* QR Code Display */}
        <div className="relative">
          <div className="border-4 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white">
            {isLoading ? (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
                </div>
              </div>
            ) : error ? (
              <div className="w-64 h-64 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded">
                <div className="text-center px-4">
                  <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            ) : (
              <img
                src={qrCodeDataUrl}
                alt={`QR Code pour ${attendeeName}`}
                className="w-64 h-64 object-contain"
              />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2">
            <QrCodeIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center max-w-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scannez ce QR Code avec l'application mobile pour enregistrer l'arrivée du participant à
            l'événement.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={handleDownload}
            disabled={isDownloading || isLoading || !!error}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
          >
            <DownloadIcon className="w-4 h-4" />
            {isDownloading ? 'Téléchargement...' : 'Télécharger PNG'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200"
          >
            Fermer
          </button>
        </div>

        {/* Registration ID (for debug) */}
        <div className="text-xs text-gray-400 dark:text-gray-600">
          ID: {registration.id.slice(0, 13)}...
        </div>
      </div>
    </Modal>
  )
}
