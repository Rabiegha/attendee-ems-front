import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectToken } from '@/features/auth/model/sessionSlice'
import { Modal } from '@/shared/ui/Modal'
import { Award, FileText, Image as ImageIcon, Plus, AlertCircle, Settings } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { ROUTES } from '@/app/config/constants'
import { useGetBadgeTemplatesQuery } from '@/services/api/badge-templates.api'
import { useGetEventBadgeRulesQuery } from '@/features/events/api/eventBadgeRulesApi'
import { useToast } from '@/shared/hooks/useToast'
import type { RegistrationDPO } from '../dpo/registration.dpo'
import { generateAndDownloadBadge, type BadgeFormat } from '../utils/badgeDownload'

interface BadgePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  registration: RegistrationDPO
  eventId: string
  currentBadgeTemplateId?: string | null
}

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

  const token = useSelector(selectToken)
  const navigate = useNavigate()
  const toast = useToast()
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  // Récupérer les templates de badges disponibles
  const { data: badgeTemplatesData } = useGetBadgeTemplatesQuery({ 
    page: 1, 
    limit: 100 
  })

  // Récupérer les règles de badge pour cet événement
  const { data: badgeRules = [], isLoading: isLoadingRules } = useGetEventBadgeRulesQuery(eventId)

  // Calculer le template à utiliser en fonction des règles
  // IMPORTANT: Ne calculer que si les règles sont chargées pour éviter les changements de template
  const effectiveBadgeTemplateId = useMemo(() => {
    // Si les règles sont en cours de chargement, retourner null pour attendre
    if (isLoadingRules) {
      console.log('[Badge] Rules are loading, waiting...')
      return null
    }

    // Si le participant a un event attendee type, chercher une règle correspondante
    const eventAttendeeTypeId = registration.eventAttendeeType?.id
    
    if (eventAttendeeTypeId && badgeRules.length > 0) {
      // Copier l'array avant de trier (RTK Query retourne un array en lecture seule)
      const matchingRule = [...badgeRules]
        .sort((a, b) => a.priority - b.priority) // Trier par priorité
        .find(rule => rule.attendeeTypeIds.includes(eventAttendeeTypeId))
      
      if (matchingRule) {
        console.log('[Badge] Using rule template:', matchingRule.badgeTemplateId, 'for event attendee type:', eventAttendeeTypeId)
        return matchingRule.badgeTemplateId
      }
    }
    
    // Sinon, utiliser le badge par défaut de l'événement
    console.log('[Badge] Using default template:', currentBadgeTemplateId)
    return currentBadgeTemplateId || null
  }, [badgeRules, registration.eventAttendeeType, currentBadgeTemplateId, isLoadingRules])

  // Trouver le template utilisé
  const usedTemplate = badgeTemplatesData?.data?.find(t => t.id === effectiveBadgeTemplateId)

  // Fonction pour charger/régénérer le badge
  const loadBadgePreview = async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    // Attendre que les règles soient chargées
    if (isLoadingRules) {
      console.log('[Badge] Rules are loading, waiting...')
      return
    }

    // Si aucun template n'est disponible après le chargement des règles
    if (effectiveBadgeTemplateId === null) {
      console.log('[Badge] No template configured')
      setError('Veuillez sélectionner un template de badge pour cet événement.')
      setErrorType('no-template')
      setIsLoading(false)
      return
    }

    // Reset states
    setBadgeImage('')
    setError('')
    setIsLoading(true)

    const fetchBadgePreview = async () => {
      try {
        // Utiliser le template calculé automatiquement
        const url = effectiveBadgeTemplateId
          ? `${API_URL}/events/${eventId}/registrations/${registration.id}/badge-preview?quality=high&templateId=${effectiveBadgeTemplateId}&force=true`
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

  // Load badge preview
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false)
      return
    }

    loadBadgePreview()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, registration.id, effectiveBadgeTemplateId])

  const handleDownload = async (format: BadgeFormat) => {
    try {
      setIsDownloading(true)
      
      await generateAndDownloadBadge({
        registrationId: registration.id,
        eventId,
        format,
        firstName: registration.attendee?.firstName,
        lastName: registration.attendee?.lastName,
        token: token!,
        apiUrl: API_URL,
      })
      
    } catch (error) {
      console.error(`Error downloading badge ${format}:`, error)
      alert(`Erreur lors du téléchargement du badge ${format}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
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

        {/* Download Actions - En haut, avant le template */}
        {!error && (
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => handleDownload('pdf')}
              disabled={isDownloading || isLoading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              {isDownloading ? 'Téléchargement...' : 'Télécharger PDF'}
            </Button>
            <Button
              onClick={() => handleDownload('image')}
              disabled={isDownloading || isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4" />
              {isDownloading ? 'Téléchargement...' : 'Télécharger Image'}
            </Button>
          </div>
        )}

        {/* Template Info - Affichage du template utilisé */}
        {!error && usedTemplate && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template utilisé
                </p>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {usedTemplate.name}
                  </span>
                  {registration.eventAttendeeType?.attendeeType && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (Règle pour "{registration.eventAttendeeType.attendeeType.name}")
                    </span>
                  )}
                  {!registration.eventAttendeeType && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (Badge par défaut)
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  navigate(`/events/${eventId}?tab=badges`)
                }}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurer
              </Button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Le template est déterminé automatiquement selon les règles de badge configurées
            </p>
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
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Aucun template de badge configuré
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Pour générer des badges, vous devez d'abord associer un template de badge à cet événement.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        onClose()
                        navigate(`/events/${eventId}?tab=badges`)
                      }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Settings className="h-4 w-4" />
                      Configurer les badges
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
                      Comment configurer un badge pour cet événement ?
                    </p>
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Créez d'abord un template dans la section "Badges" (menu principal)</li>
                      <li>Allez dans l'onglet "Badges" de cet événement</li>
                      <li>Sélectionnez le template par défaut</li>
                      <li>Configurez des règles selon les types de participants (optionnel)</li>
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

        {/* Info message */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
          <Award className="h-4 w-4 inline mr-1" />
          Le badge est généré automatiquement selon les règles configurées dans l'onglet Badges
        </div>
      </div>
    </Modal>
  )
}
