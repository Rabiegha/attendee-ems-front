import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectToken } from '@/features/auth/model/sessionSlice'
import { Modal } from '@/shared/ui/Modal'
import { Award, FileText, Image as ImageIcon, Plus, AlertCircle } from 'lucide-react'
import { Select, SelectOption, FormField } from '@/shared/ui'
import { Button } from '@/shared/ui/Button'
import { ROUTES } from '@/app/config/constants'
import { useGetBadgeTemplatesQuery } from '@/services/api/badge-templates.api'
import { useUpdateEventMutation } from '@/features/events/api/eventsApi'
import { useToast } from '@/shared/hooks/useToast'
import type { RegistrationDPO } from '../dpo/registration.dpo'

interface BadgePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  registration: RegistrationDPO
  eventId: string
  currentBadgeTemplateId?: string | null
}

type BadgeFormat = 'pdf' | 'image'

export function BadgePreviewModal({ 
  isOpen, 
  onClose, 
  registration, 
  eventId,
  currentBadgeTemplateId 
}: BadgePreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [badgeImage, setBadgeImage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [errorType, setErrorType] = useState<'chromium' | 'no-template' | 'other'>('other')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(currentBadgeTemplateId || '')

  const token = useSelector(selectToken)
  const navigate = useNavigate()
  const toast = useToast()
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  // Récupérer les templates de badges disponibles
  const { data: badgeTemplatesData } = useGetBadgeTemplatesQuery({ 
    page: 1, 
    limit: 100 
  })
  
  // Mutation pour mettre à jour le template de l'événement
  const [updateEvent] = useUpdateEventMutation()

  // Synchroniser le template sélectionné avec le template courant
  useEffect(() => {
    if (currentBadgeTemplateId) {
      setSelectedTemplateId(currentBadgeTemplateId)
    }
  }, [currentBadgeTemplateId])

  // Fonction pour charger/régénérer le badge
  const loadBadgePreview = async (templateIdOverride?: string) => {
    if (!token) {
      setIsLoading(false)
      return
    }

    // Reset states
    setBadgeImage('')
    setError('')
    setIsLoading(true) // Toujours afficher le loading complet

    const fetchBadgePreview = async () => {
      try {
        // Si un template est spécifié, on force la régénération avec ce template
        const url = templateIdOverride
          ? `${API_URL}/events/${eventId}/registrations/${registration.id}/badge-preview?quality=high&templateId=${templateIdOverride}&force=true`
          : `${API_URL}/events/${eventId}/registrations/${registration.id}/badge-preview?quality=high`
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[Badge Preview] Error:', errorText)
          
          try {
            const errorData = JSON.parse(errorText)
            
            // Détection de l'erreur Chromium
            if (errorData.detail?.includes('Chromium') || errorData.message?.includes('Chromium')) {
              setError('Le serveur n\'a pas encore été configuré pour générer des badges. Veuillez contacter l\'administrateur.')
              setErrorType('chromium')
              setIsLoading(false)
              return
            }
            
            // Détection de l'erreur "pas de template"
            if (errorData.message?.includes('No badge template') || 
                errorData.message?.includes('badge template') ||
                errorData.detail?.includes('No badge template')) {
              setError('Aucun template de badge n\'a été configuré pour générer des badges.')
              setErrorType('no-template')
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
        setIsLoading(false)
      } catch (err) {
        console.error('[Badge Preview] Failed to load:', err)
        setError('Erreur de chargement du badge')
        setErrorType('other')
        setIsLoading(false)
      }
    }

    await fetchBadgePreview()
  }

  // Load badge preview (single quality - optimized)
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false)
      return
    }

    loadBadgePreview()
  }, [isOpen, registration.id, eventId, API_URL, token])

  const handleDownload = async (format: BadgeFormat) => {
    try {
      setIsDownloading(true)
      
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
    } catch (error) {
      console.error(`Error downloading badge ${format}:`, error)
      alert(`Erreur lors du téléchargement du badge ${format}`)
    } finally {
      setIsDownloading(false)
    }
  }

  // Fonction pour changer le template et régénérer le badge
  const handleTemplateChange = async (newTemplateId: string) => {
    if (newTemplateId === selectedTemplateId) return
    
    setSelectedTemplateId(newTemplateId)
    
    try {
      // 1. Mettre à jour le template dans les settings de l'événement
      if (newTemplateId) {
        await updateEvent({
          id: eventId,
          data: {
            badgeTemplateId: newTemplateId,
          },
        }).unwrap()
        
        toast.success('Template mis à jour', 'Le template de badge a été changé pour cet événement')
      }
      
      // 2. Régénérer le badge avec le nouveau template (loadBadgePreview gère isLoading)
      await loadBadgePreview(newTemplateId || undefined)
      
    } catch (error: any) {
      console.error('Error changing template:', error)
      toast.error('Erreur', 'Impossible de changer le template de badge')
      // Revenir à l'ancien template en cas d'erreur
      setSelectedTemplateId(currentBadgeTemplateId || '')
      setIsLoading(false)
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

        {/* Template Selector */}
        {!error && badgeTemplatesData?.data && badgeTemplatesData.data.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <FormField label="Template de badge">
              <Select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              >
                <SelectOption value="">Par défaut</SelectOption>
                {badgeTemplatesData.data
                  .filter(t => t.is_active)
                  .map((template) => (
                    <SelectOption key={template.id} value={template.id}>
                      {template.name} {template.is_default ? '(Par défaut)' : ''}
                    </SelectOption>
                  ))}
              </Select>
            </FormField>
          </div>
        )}

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
            <div className="flex flex-col items-center space-y-4 justify-center min-h-[600px] max-w-lg mx-auto text-center">
              {errorType === 'no-template' ? (
                <>
                  <AlertCircle className="h-16 w-16 text-orange-500 dark:text-orange-400" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{error}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Pour générer des badges, vous devez d'abord créer un template de badge.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        onClose()
                        navigate(ROUTES.BADGES)
                      }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Créer un template de badge
                    </Button>
                    <Button
                      onClick={onClose}
                      variant="outline"
                    >
                      Fermer
                    </Button>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200 text-left w-full">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Comment créer un template de badge ?
                    </p>
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Accédez à la section "Badges" via le menu</li>
                      <li>Cliquez sur "Créer un template"</li>
                      <li>Personnalisez le design de votre badge</li>
                      <li>Revenez ici pour générer les badges</li>
                    </ol>
                  </div>
                </>
              ) : (
                <>
                  <Award className="h-16 w-16 text-red-600 dark:text-red-400 opacity-50" />
                  <div>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">{error}</p>
                    {errorType === 'chromium' && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200 text-left">
                        <p className="font-semibold mb-2">ℹ️ Configuration requise :</p>
                        <p>Le serveur doit avoir Chromium installé pour générer les badges.</p>
                        <p className="mt-2">Voir le fichier <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">CHROMIUM_SETUP.md</code> pour les instructions d'installation.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
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
