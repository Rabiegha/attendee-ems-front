import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectToken } from '@/features/auth/model/sessionSlice'
import { Modal } from '@/shared/ui/Modal'
import { Award, FileText, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import type { RegistrationDPO } from '../dpo/registration.dpo'

interface BadgePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  registration: RegistrationDPO
  eventId: string
}

type BadgeFormat = 'pdf' | 'image'

export function BadgePreviewModal({ isOpen, onClose, registration, eventId }: BadgePreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [badgeImage, setBadgeImage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const token = useSelector(selectToken)
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

  // Load badge preview (single quality - optimized)
  useEffect(() => {
    if (!isOpen || !token) {
      setIsLoading(false)
      return
    }

    // Reset states
    setBadgeImage('')
    setIsLoading(true)
    setError('')

    const fetchBadgePreview = async () => {
      try {
        console.log('[Badge Preview] Loading badge preview...')
        const response = await fetch(
          `${API_URL}/events/${eventId}/registrations/${registration.id}/badge-preview?quality=high`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[Badge Preview] Error:', errorText)
          
          try {
            const errorData = JSON.parse(errorText)
            if (errorData.detail?.includes('Chromium') || errorData.message?.includes('Chromium')) {
              setError('Le serveur n\'a pas encore été configuré pour générer des badges. Veuillez contacter l\'administrateur.')
              setIsLoading(false)
              return
            }
          } catch (e) {
            // Ignore parsing errors
          }
          
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        setBadgeImage(data.data.previewUrl)
        console.log('[Badge Preview] ✅ Badge loaded')
        setIsLoading(false)
      } catch (err) {
        console.error('[Badge Preview] Failed to load:', err)
        setError('Erreur de chargement du badge')
        setIsLoading(false)
      }
    }

    fetchBadgePreview()
  }, [isOpen, registration.id, eventId, API_URL, token])

  const handleDownload = async (format: BadgeFormat) => {
    try {
      setIsDownloading(true)
      
      console.log(`[Badge Download] Downloading ${format}:`, `${API_URL}/events/${eventId}/registrations/${registration.id}/badge/download?format=${format}`)
      
      const response = await fetch(
        `${API_URL}/events/${eventId}/registrations/${registration.id}/badge/download?format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const extension = format === 'pdf' ? 'pdf' : 'png'
      const fileName = `badge-${registration.attendee?.firstName}-${registration.attendee?.lastName}.${extension}`
      
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log(`[Badge Download] ${format} downloaded successfully`)
    } catch (error) {
      console.error(`Error downloading badge ${format}:`, error)
      alert(`Erreur lors du téléchargement du badge ${format}`)
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
      title="Aperçu du Badge"
      maxWidth="2xl"
    >
      <div className="flex flex-col space-y-6">
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

        {/* Badge Preview */}
        <div className="flex justify-center items-start bg-gray-50 dark:bg-gray-900 rounded-lg p-6 max-h-[85vh] overflow-auto">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-3 justify-center min-h-[600px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Génération du badge...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center space-y-4 text-red-600 dark:text-red-400 justify-center min-h-[600px] max-w-md mx-auto text-center">
              <Award className="h-16 w-16 opacity-50" />
              <div>
                <p className="text-lg font-semibold mb-2">{error}</p>
                {error.includes('configuré') && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200 text-left">
                    <p className="font-semibold mb-2">ℹ️ Configuration requise :</p>
                    <p>Le serveur doit avoir Chromium installé pour générer les badges.</p>
                    <p className="mt-2">Voir le fichier <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">CHROMIUM_SETUP.md</code> pour les instructions d'installation.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* Badge Image */}
              {badgeImage && (
                <img
                  src={badgeImage}
                  alt={`Badge de ${attendeeName}`}
                  className="max-w-[600px] max-h-[900px] w-auto h-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
                />
              )}
            </div>
          )}
        </div>

        {/* Download Actions */}
        {!isLoading && !error && (
          <div className="flex gap-3 justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => handleDownload('pdf')}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <FileText className="h-4 w-4" />
              {isDownloading ? 'Téléchargement...' : 'Télécharger PDF'}
            </Button>
            <Button
              onClick={() => handleDownload('image')}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ImageIcon className="h-4 w-4" />
              {isDownloading ? 'Téléchargement...' : 'Télécharger Image'}
            </Button>
          </div>
        )}

        {/* Info message */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
          <Award className="h-4 w-4 inline mr-1" />
          Le badge est généré automatiquement avec le template sélectionné pour cet événement
        </div>
      </div>
    </Modal>
  )
}
