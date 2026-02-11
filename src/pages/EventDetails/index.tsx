import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import {
  useGetEventByIdQuery,
  useUpdateRegistrationFieldsMutation,
  useUpdateEventMutation,
  useGetEventAttendeeTypesQuery,
} from '@/features/events/api/eventsApi'
import {
  useGetRegistrationsQuery,
  useBulkExportRegistrationsMutation,
  useCheckFieldDataMutation,
  useCleanFieldDataMutation,
} from '@/features/registrations/api/registrationsApi'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Can } from '@/shared/acl/guards/Can'
import { useCan } from '@/shared/acl/hooks/useCan'
import { Button } from '@/shared/ui/Button'
import { PageContainer } from '@/shared/ui/PageContainer'
import { LoadingSpinner, EventDetailsSkeleton, Modal } from '@/shared/ui'
import { Tabs, type TabItem } from '@/shared/ui'
import { useToast } from '@/shared/hooks/useToast'
import {
  Edit,
  Download,
  Calendar,
  MapPin,
  Clock,
  Users,
  FileText,
  Upload,
  UserPlus,
  ArrowLeft,
  Settings,
  FormInput,
  Zap,
  XCircle,
  Tag,
  CreditCard,
  BarChart3,
  Mail,
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/shared/lib/utils'
import { EventSettingsTab } from './EventSettingsTab'
import { EventAttendeeTypesTab } from './EventAttendeeTypesTab'
import { EventBadgesTab } from './EventBadgesTab'
import { EventStatsTab } from './EventStatsTab'
import { EventEmailsTab } from './EventEmailsTab'
import { AssignedTeam } from './components/AssignedTeam'
import { RegistrationsTable } from '@/features/registrations/ui/RegistrationsTable'
import { ImportExcelModal } from '@/features/registrations/ui/ImportExcelModal'
import { AddParticipantForm } from '@/features/registrations/ui/AddParticipantForm'
import { EditEventModal } from '@/features/events/ui/EditEventModal'
import {
  FormBuilder,
  type FormField,
  getFieldById,
} from '@/features/events/components/FormBuilder'
import { FormPreview } from '@/features/events/ui/FormPreview'
import { EmbedCodeGenerator } from '@/features/events/ui/EmbedCodeGenerator'
import { EventActionsModal } from './EventActionsModal'
import { EventSessionsTab } from './EventSessionsTab'

type TabType = 'details' | 'registrations' | 'team' | 'form' | 'settings' | 'attendee-types' | 'badges' | 'sessions' | 'stats' | 'emails'

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()

  // Récupérer l'onglet depuis l'URL, ou 'details' par défaut
  const tabFromUrl = searchParams.get('tab') as TabType | null
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || 'details')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false)

  // Synchroniser l'onglet actif avec l'URL
  useEffect(() => {
    const currentTab = searchParams.get('tab') as TabType | null
    if (currentTab && ['details', 'registrations', 'team', 'form', 'settings', 'attendee-types', 'badges', 'sessions', 'stats', 'emails'].includes(currentTab)) {
      setActiveTab(currentTab)
    }
  }, [searchParams])

  // Fonction pour changer d'onglet et mettre à jour l'URL
  const handleTabChange = (tab: TabType) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('tab', tab)
      return newParams
    })
  }

  // State pour la pagination des inscriptions
  const [registrationsPage, setRegistrationsPage] = useState(1)
  const [registrationsPageSize, setRegistrationsPageSize] = useState(50)
  const [registrationsSearch, setRegistrationsSearch] = useState('')

  // DEBUG: Log pour voir les changements
  console.log('🔍 EventDetails Pagination State:', {
    registrationsPage,
    registrationsPageSize,
    activeTab,
  })
  const [registrationsIsActive, setRegistrationsIsActive] = useState(true)
  const [registrationsActiveTab, setRegistrationsActiveTab] = useState<'active' | 'deleted'>('active')

  // ⏰ POLLING AUTO - Refresh toutes les 5 secondes
  const [pollingInterval, setPollingInterval] = useState(5000)

  // State pour le modal d'actions
  const [showActionsModal, setShowActionsModal] = useState(false)

  // State pour les champs du formulaire - chargé depuis la BDD ou valeurs par défaut
  const [formFields, setFormFields] = useState<FormField[]>([])

  // State pour la configuration du bouton submit
  const [submitButtonText, setSubmitButtonText] = useState<string>("S'inscrire")
  const [submitButtonColor, setSubmitButtonColor] = useState<string>('#4F46E5')
  const [showTitle, setShowTitle] = useState<boolean>(true)
  const [showDescription, setShowDescription] = useState<boolean>(true)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  // Hooks de permissions - DOIVENT être appelés avant les conditions
  const canReadEvents = useCan('read', 'Event')
  const canReadRegistrations = useCan('read', 'Registration')
  const canReadAttendeeTypes = useCan('read', 'AttendeeType')
  const canReadBadges = useCan('read', 'Badge')
  const canUpdateEvent = useCan('update', 'Event')
  const canAssignUsers = useCan('update', 'Event') // Même permission que update event

  const {
    data: event,
    isLoading: eventLoading,
    error,
  } = useGetEventByIdQuery(id!)
  
  const { 
    data: eventAttendeeTypes, 
    isLoading: isLoadingAttendeeTypes 
  } = useGetEventAttendeeTypesQuery(id!, {
    skip: !id
  })

  const [updateRegistrationFields] = useUpdateRegistrationFieldsMutation()
  const [updateEvent] = useUpdateEventMutation()
  const [bulkExportRegistrations] = useBulkExportRegistrationsMutation()

  // RTK Query mutations pour la suppression de champ
  const [checkFieldData] = useCheckFieldDataMutation()
  const [cleanFieldData] = useCleanFieldDataMutation()

  // Queries pour les registrations - DOIVENT être avant les early returns
  const {
    data: registrationsResponse,
    isLoading: registrationsLoading,
    refetch: refetchRegistrations,
  } = useGetRegistrationsQuery(
    id
      ? {
          eventId: id,
          page: registrationsPage,
          limit: registrationsPageSize,
          isActive: registrationsIsActive,
          ...(registrationsSearch && { search: registrationsSearch }),
        }
      : skipToken,
    {
      pollingInterval: activeTab === 'registrations' ? pollingInterval : 0,
    }
  )

  // Hook séparé pour récupérer tous les IDs lors de l'export
  const { data: allRegistrationsForExport } = useGetRegistrationsQuery(
    id
      ? {
          eventId: id,
          page: 1,
          limit: 10000,
        }
      : skipToken,
    {
      skip: !id,
    }
  )

  // Queries pour les stats des onglets
  const { data: activeRegistrationsStats } = useGetRegistrationsQuery(
    id
      ? {
          eventId: id,
          page: 1,
          limit: 1,
          isActive: true,
        }
      : skipToken,
    {
      skip: !id,
    }
  )

  const { data: deletedRegistrationsStats } = useGetRegistrationsQuery(
    id
      ? {
          eventId: id,
          page: 1,
          limit: 1,
          isActive: false,
        }
      : skipToken,
    {
      skip: !id,
    }
  )

  // Charger les champs depuis event.settings.registration_fields quand l'événement est chargé
  useEffect(() => {
    if (
      event?.settings?.registration_fields &&
      Array.isArray(event.settings.registration_fields)
    ) {
      // Reconstituer les champs avec leurs icônes depuis PREDEFINED_FIELDS
      const fieldsWithIcons = event.settings.registration_fields.map(
        (savedField: any) => {
          const predefinedField = getFieldById(savedField.key)
          if (predefinedField) {
            // Fusionner le champ sauvegardé avec l'icône du champ prédéfini
            return {
              ...savedField,
              icon: predefinedField.icon,
              // Ajouter width: 'half' par défaut si non défini (pour les anciens champs)
              width: savedField.width || 'half',
            }
          }
          return {
            ...savedField,
            // Ajouter width: 'half' par défaut si non défini
            width: savedField.width || 'half',
          }
        }
      )
      setFormFields(fieldsWithIcons)
    } else if (event?.id && id) {
      // Valeurs par défaut si aucun champ n'est configuré
      const firstName = getFieldById('first_name')
      const lastName = getFieldById('last_name')
      const email = getFieldById('email')

      if (firstName && lastName && email) {
        // Convert validations: RegExp → string
        const convertValidation = (val: any) => {
          if (!val) return undefined
          const { pattern, ...rest } = val
          return {
            ...rest,
            ...(pattern && { pattern: typeof pattern === 'string' ? pattern : pattern.source })
          }
        }

        const lastValidation = convertValidation(lastName.validation)
        const firstValidation = convertValidation(firstName.validation)
        const emailValidation = convertValidation(email.validation)

        const defaultFields: FormField[] = [
          { 
            type: 'standard', 
            id: `field_${Date.now()}_1`, 
            order: 0, 
            width: 'half' as const, 
            required: true, 
            label: lastName.label,
            fieldType: 'text' as const,
            visibleInPublicForm: lastName.visibleInPublicForm ?? true,
            visibleInAdminForm: lastName.visibleInAdminForm ?? true,
            visibleInAttendeeTable: lastName.visibleInAttendeeTable ?? true,
            visibleInExport: lastName.visibleInExport ?? true,
            ...(lastName.placeholder && { placeholder: lastName.placeholder }),
            ...(lastName.key && { key: lastName.key }),
            ...(lastName.attendeeField && { attendeeField: lastName.attendeeField }),
            ...(lastName.icon && { icon: lastName.icon }),
            ...(lastName.category && { category: lastName.category }),
            ...(lastValidation && { validation: lastValidation }),
          },
          { 
            type: 'standard', 
            id: `field_${Date.now()}_2`, 
            order: 1, 
            width: 'half' as const, 
            required: true, 
            label: firstName.label,
            fieldType: 'text' as const,
            visibleInPublicForm: firstName.visibleInPublicForm ?? true,
            visibleInAdminForm: firstName.visibleInAdminForm ?? true,
            visibleInAttendeeTable: firstName.visibleInAttendeeTable ?? true,
            visibleInExport: firstName.visibleInExport ?? true,
            ...(firstName.placeholder && { placeholder: firstName.placeholder }),
            ...(firstName.key && { key: firstName.key }),
            ...(firstName.attendeeField && { attendeeField: firstName.attendeeField }),
            ...(firstName.icon && { icon: firstName.icon }),
            ...(firstName.category && { category: firstName.category }),
            ...(firstValidation && { validation: firstValidation }),
          },
          { 
            type: 'standard', 
            id: `field_${Date.now()}_3`, 
            order: 2, 
            width: 'full' as const, 
            required: true, 
            label: email.label,
            fieldType: 'email' as const,
            visibleInPublicForm: email.visibleInPublicForm ?? true,
            visibleInAdminForm: email.visibleInAdminForm ?? true,
            visibleInAttendeeTable: email.visibleInAttendeeTable ?? true,
            visibleInExport: email.visibleInExport ?? true,
            ...(email.placeholder && { placeholder: email.placeholder }),
            ...(email.key && { key: email.key }),
            ...(email.attendeeField && { attendeeField: email.attendeeField }),
            ...(email.icon && { icon: email.icon }),
            ...(email.category && { category: email.category }),
            ...(emailValidation && { validation: emailValidation }),
          },
        ]
        setFormFields(defaultFields)
        
        // Sauvegarder automatiquement les champs par défaut
        const cleanedFields = defaultFields.map((field) => {
          const { icon, ...rest } = field as any
          return rest
        })
        
        updateRegistrationFields({
          id,
          fields: cleanedFields,
          submitButtonText,
          submitButtonColor,
          showTitle,
          showDescription,
          isDarkMode,
        }).catch((error) => {
          console.error('Erreur lors de la sauvegarde automatique des champs par défaut:', error)
        })
      }
    }

    // Charger la configuration du bouton submit
    if (event?.settings?.submit_button_text) {
      setSubmitButtonText(event.settings.submit_button_text)
    }
    if (event?.settings?.submit_button_color) {
      setSubmitButtonColor(event.settings.submit_button_color)
    }
    if (event?.settings?.show_title !== undefined) {
      setShowTitle(event.settings.show_title)
    }
    if (event?.settings?.show_description !== undefined) {
      setShowDescription(event.settings.show_description)
    }
    if (event?.settings?.is_dark_mode !== undefined) {
      setIsDarkMode(event.settings.is_dark_mode)
    }
  }, [event])

  // Fonction pour sauvegarder les champs
  const handleSaveFormFields = async (fields: FormField[]) => {
    if (!id) return

    try {
      // Nettoyer les champs en retirant les icônes (composants React non sérialisables)
      const cleanedFields = fields.map((field) => {
        const { icon, ...rest } = field as any
        return rest
      })

      await updateRegistrationFields({
        id,
        fields: cleanedFields,
        submitButtonText,
        submitButtonColor,
        showTitle,
        showDescription,
        isDarkMode,
      }).unwrap()
      console.log('Champs sauvegardés avec succès')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des champs:', error)
      // Log plus de détails
      if (error && typeof error === 'object' && 'data' in error) {
        console.error(
          "Détails de l'erreur:",
          JSON.stringify(error.data, null, 2)
        )
      }
    }
  }

  // Fonction pour vérifier et nettoyer les données d'un champ avant suppression
  const handleFieldDelete = async (fieldId: string): Promise<{ affectedCount: number; canDelete: boolean }> => {
    if (!id) {
      return { affectedCount: 0, canDelete: true }
    }

    try {
      // Vérifier si des données existent
      const checkResult = await checkFieldData({
        eventId: id,
        fieldId,
      }).unwrap()

      // Si des données existent, les nettoyer
      if (checkResult.affectedCount > 0) {
        await cleanFieldData({
          eventId: id,
          fieldId,
        }).unwrap()
      }

      return {
        affectedCount: checkResult.affectedCount,
        canDelete: checkResult.canDelete,
      }
    } catch (error) {
      console.error('Error in handleFieldDelete:', error)
      return { affectedCount: 0, canDelete: true }
    }
  }

  // Fonction pour changer le statut de l'événement
  const handleStatusChange = async (
    newStatus: string,
    options?: {
      notifyUsers?: boolean
      newStartDate?: string
      newEndDate?: string
    }
  ) => {
    if (!id || !event) return

    try {
      const updateData: any = {
        status: newStatus,
      }

      // Si on reporte l'événement, mettre à jour les dates
      if (options?.newStartDate && options?.newEndDate) {
        updateData.startDate = options.newStartDate
        updateData.endDate = options.newEndDate
      }

      await updateEvent({
        id,
        data: updateData,
      }).unwrap()

      // TODO: Implémenter la logique d'envoi d'email
      if (options?.notifyUsers) {
        console.log('TODO: Envoyer email de notification aux participants')
        if (options?.newStartDate) {
          console.log('Nouvelle date de début:', options.newStartDate)
          console.log('Nouvelle date de fin:', options.newEndDate)
        }
      }
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err)
      throw err
    }
  }

  // Fonction pour sauvegarder la configuration du bouton
  const handleConfigChange = (config: {
    submitButtonText?: string
    submitButtonColor?: string
    showTitle?: boolean
    showDescription?: boolean
    isDarkMode?: boolean
  }) => {
    if (config.submitButtonText !== undefined) {
      setSubmitButtonText(config.submitButtonText)
    }
    if (config.submitButtonColor !== undefined) {
      setSubmitButtonColor(config.submitButtonColor)
    }
    if (config.showTitle !== undefined) {
      setShowTitle(config.showTitle)
    }
    if (config.showDescription !== undefined) {
      setShowDescription(config.showDescription)
    }
    if (config.isDarkMode !== undefined) {
      setIsDarkMode(config.isDarkMode)
    }

    // Sauvegarder immédiatement
    if (!id) return

    // Utiliser les nouvelles valeurs de config en priorité, puis les states actuels
    const finalConfig = {
      submitButtonText: config.submitButtonText ?? submitButtonText,
      submitButtonColor: config.submitButtonColor ?? submitButtonColor,
      showTitle: config.showTitle !== undefined ? config.showTitle : showTitle,
      showDescription: config.showDescription !== undefined ? config.showDescription : showDescription,
      isDarkMode: config.isDarkMode !== undefined ? config.isDarkMode : isDarkMode,
    }

    updateRegistrationFields({
      id,
      fields: formFields.map((field) => {
        const { icon, ...rest } = field as any
        return rest
      }),
      ...finalConfig,
    })
  }

  // 🐛 DEBUG: Log pour voir les paramètres de pagination
  console.log('📊 [EventDetails] Pagination params:', {
    registrationsPage,
    registrationsPageSize,
    metaFromResponse: registrationsResponse?.meta,
    dataLength: registrationsResponse?.data?.length,
  })

  // Log pour debug
  console.log('📋 allRegistrationsForExport:', {
    hasData: !!allRegistrationsForExport,
    dataLength: allRegistrationsForExport?.data?.length,
    meta: allRegistrationsForExport?.meta,
  })

  // Les inscriptions sont récupérées via l'API RTK Query
  const allRegistrations = registrationsResponse?.data || []
  const registrationsMeta = registrationsResponse?.meta || {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    statusCounts: {
      awaiting: 0,
      approved: 0,
      refused: 0,
    },
  }

  // Configure registrations tabs
  const registrationsTabs: TabItem[] = [
    {
      id: 'active',
      label: 'Actives',
      count: activeRegistrationsStats?.meta?.total || 0,
    },
    {
      id: 'deleted',
      label: 'Supprimées',
      count: deletedRegistrationsStats?.meta?.total || 0,
    },
  ]

  const handleRegistrationsTabChange = (tabId: string) => {
    const newTab = tabId as 'active' | 'deleted'
    setRegistrationsActiveTab(newTab)
    setRegistrationsIsActive(newTab === 'active')
    setRegistrationsPage(1) // Reset to first page
    setRegistrationsSearch('') // Reset search when changing tab
  }

  // Callback pour l'import Excel - plus besoin du mode local
  const handleImportSuccess = (result: any) => {
    console.log('Import terminé:', result)
    // La liste sera automatiquement rafraîchie par RTK Query invalidation
    // Force refresh just in case
    refetchRegistrations()
  }

  // Fonction pour exporter toutes les inscriptions
  const handleExportAll = async () => {
    console.log('🔵 handleExportAll appelé', { id, hasData: !!allRegistrationsForExport?.data })
    
    if (!id || !allRegistrationsForExport?.data) {
      console.warn('⚠️ Pas de données à exporter', { id, data: allRegistrationsForExport?.data })
      toast.error('Aucune inscription à exporter')
      return
    }

    try {
      // Utiliser tous les IDs récupérés par le hook dédié
      const allIds = allRegistrationsForExport.data.map((reg) => reg.id)
      console.log('📊 IDs à exporter:', allIds.length)

      if (allIds.length === 0) {
        toast.info('Aucune inscription à exporter')
        return
      }

      toast.info(`Export de ${allIds.length} inscription(s) en cours...`)

      const response = await bulkExportRegistrations({
        ids: allIds,
        format: 'excel',
      }).unwrap()

      console.log('✅ Réponse export reçue:', response)

      // Télécharger le fichier
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = response.downloadUrl
      a.download = response.filename || 'inscriptions.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(response.downloadUrl)

      toast.success(`${allIds.length} inscription(s) exportée(s) avec succès`)
    } catch (error) {
      console.error("❌ Erreur lors de l'export:", error)
      toast.error("Erreur lors de l'export des inscriptions")
    }
  }

  // Callback mémorisé pour la recherche des inscriptions - DOIT être avant les early returns
  const handleRegistrationsSearchChange = useCallback((search: string) => {
    console.log('🔍 Search changed to:', search)
    setRegistrationsSearch(search)
    setRegistrationsPage(1) // Reset to first page when searching
  }, [])

  if (eventLoading) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <EventDetailsSkeleton activeTab={activeTab} />
      </PageContainer>
    )
  }

  if (error || !event) {
    // Vérifier si c'est une erreur 403 (accès refusé)
    const isForbidden = error && 'status' in error && error.status === 403
    
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {isForbidden ? 'Accès refusé' : 'Événement non trouvé'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {isForbidden 
            ? "Vous n'avez pas accès à cet événement. Veuillez demander à un administrateur de vous inviter à cet événement."
            : "L'événement que vous recherchez n'existe pas ou a été supprimé."
          }
        </p>
        <Link to="/events">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux événements
          </Button>
        </Link>
      </div>
    )
  }

  // Utiliser les stats actives pour l'affichage global (Header, Sidebar)
  const activeMeta = activeRegistrationsStats?.meta || {
    total: 0,
    statusCounts: { awaiting: 0, approved: 0, refused: 0 }
  }

  const approvedCount = activeMeta.statusCounts.approved
  const awaitingCount = activeMeta.statusCounts.awaiting
  const refusedCount = activeMeta.statusCounts.refused

  // Définir les onglets avec leurs permissions requises
  const allTabs = [
    { 
      id: 'details' as TabType, 
      label: 'Détails', 
      icon: FileText,
      hasPermission: canReadEvents
    },
    {
      id: 'registrations' as TabType,
      label: `Inscriptions (${activeMeta.total})`,
      icon: Users,
      hasPermission: canReadRegistrations
    },
    { 
      id: 'stats' as TabType, 
      label: 'Statistiques', 
      icon: BarChart3,
      hasPermission: canReadRegistrations
    },
    { 
      id: 'team' as TabType, 
      label: 'Équipe', 
      icon: Users,
      hasPermission: canAssignUsers,
      disabledIfDeleted: true 
    },
    { 
      id: 'attendee-types' as TabType, 
      label: 'Types de participants', 
      icon: Tag,
      hasPermission: canReadAttendeeTypes,
      disabledIfDeleted: true 
    },
    { 
      id: 'badges' as TabType, 
      label: 'Badges', 
      icon: CreditCard,
      hasPermission: canReadBadges,
      disabledIfDeleted: true 
    },
    { 
      id: 'sessions' as TabType, 
      label: 'Sessions', 
      icon: Calendar,
      hasPermission: canReadEvents,
      disabledIfDeleted: true 
    },
    { 
      id: 'form' as TabType, 
      label: 'Formulaire', 
      icon: FormInput, 
      hasPermission: canUpdateEvent,
      disabledIfDeleted: true 
    },
    { 
      id: 'emails' as TabType, 
      label: 'Emails', 
      icon: Mail, 
      hasPermission: canUpdateEvent,
      disabledIfDeleted: true 
    },
    { 
      id: 'settings' as TabType, 
      label: 'Paramètres', 
      icon: Settings, 
      hasPermission: canUpdateEvent,
      disabledIfDeleted: true 
    },
  ]

  // Filtrer selon l'état de suppression et les permissions
  const tabs = allTabs.filter(tab => {
    if (event.isDeleted && tab.disabledIfDeleted) return false
    return tab.hasPermission
  })

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner événement supprimé */}
        {event.isDeleted && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-600 dark:border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                CET ÉVÉNEMENT A ÉTÉ SUPPRIMÉ
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                Cet événement est conservé dans l'historique des participants mais n'est plus accessible publiquement.
                Les onglets Formulaire et Paramètres sont désactivés.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Link
              to="/events"
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {event.name}
            </h1>

            {/* Status Badge (read-only) */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                event.status === 'published'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  : event.status === 'draft'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    : event.status === 'registration_closed'
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                      : event.status === 'cancelled'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                        : event.status === 'postponed'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                          : event.status === 'archived'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {event.status === 'registration_closed'
                ? 'Inscriptions closes'
                : event.status === 'cancelled'
                  ? 'Annulé'
                  : event.status === 'postponed'
                    ? 'Reporté'
                    : event.status === 'archived'
                      ? 'Archivé'
                      : event.status === 'published'
                        ? 'Publié'
                        : event.status === 'draft'
                          ? 'Brouillon'
                          : event.status}
            </span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(event.startDate)}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {event.locationType === 'online' ? 'En ligne' : event.location}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {event.maxAttendees && event.maxAttendees > 0 && event.maxAttendees < 999999
                ? `${approvedCount}/${event.maxAttendees} participants`
                : `${approvedCount} participants`}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowActionsModal(true)}
            className="flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span>Actions</span>
          </Button>
          <Can do="update" on="Event" data={event}>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Modifier</span>
            </Button>
          </Can>
          <Can do="export" on="Attendee" data={{ eventId: event.id }}>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => {
                console.log('🖱️ Bouton Export (header) cliqué')
                handleExportAll()
              }}
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </Button>
          </Can>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Description + Détails */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {event.description || 'Aucune description disponible'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Informations détaillées
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date de début
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {formatDateTime(event.startDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date de fin
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {formatDateTime(event.endDate)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Lieu
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                      {event.locationType === 'online' ? 'En ligne' : event.location}
                    </p>
                  </div>
                  {event.websiteUrl && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Site web
                      </label>
                      <p className="mt-1">
                        <a
                          href={event.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline inline-flex items-center"
                        >
                          {event.websiteUrl}
                          <svg
                            className="h-4 w-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </p>
                    </div>
                  )}
                  {event.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistiques Sidebar */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Statistiques
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Inscriptions totales
                    </span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activeMeta.total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Approuvées
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {approvedCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      En attente
                    </span>
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {awaitingCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Refusées
                    </span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {refusedCount}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Places restantes
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {event.maxAttendees > 100000
                          ? 'Illimité'
                          : event.maxAttendees - approvedCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Informations
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Durée
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {event.duration}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Jours restants
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {event.daysUntilStart > 0
                        ? `${event.daysUntilStart} jours`
                        : 'Commencé'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Créé le
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(event.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-end space-x-3">
              <Button
                onClick={() => setIsAddParticipantModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Ajouter un participant</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Importer</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={handleExportAll}
              >
                <Download className="h-4 w-4" />
                <span>Exporter</span>
              </Button>
            </div>

            <RegistrationsTable
              registrations={allRegistrations}
              isLoading={registrationsLoading}
              eventId={id!}
              eventBadgeTemplateId={event?.badgeTemplateId ?? null}
              onRefresh={() => refetchRegistrations()}
              isDeletedTab={registrationsActiveTab === 'deleted'}
              eventAttendeeTypes={eventAttendeeTypes}
              isLoadingAttendeeTypes={isLoadingAttendeeTypes}
              formFields={formFields}
              tabsElement={
                <Tabs
                  items={registrationsTabs}
                  activeTab={registrationsActiveTab}
                  onTabChange={handleRegistrationsTabChange}
                />
              }
              meta={registrationsMeta}
              stats={activeMeta}
              // Server-side pagination props
              currentPage={registrationsPage}
              pageSize={registrationsPageSize}
              totalPages={registrationsMeta.totalPages}
              onPageChange={(page) => {
                console.log('📄 Page changed to:', page)
                setRegistrationsPage(page)
              }}
              onPageSizeChange={(pageSize) => {
                console.log('📏 PageSize changed to:', pageSize)
                setRegistrationsPageSize(pageSize)
                setRegistrationsPage(1) // Reset to first page when changing page size
              }}
              // Server-side search
              onSearchChange={handleRegistrationsSearchChange}
            />
          </div>
        )}

        {activeTab === 'attendee-types' && (
          <EventAttendeeTypesTab event={event} />
        )}

        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form Builder */}
            <div className="space-y-6">
              <FormBuilder
                fields={formFields}
                onChange={(fields: FormField[]) => {
                  setFormFields(fields)
                  handleSaveFormFields(fields)
                }}
                submitButtonText={submitButtonText}
                submitButtonColor={submitButtonColor}
                showTitle={showTitle}
                showDescription={showDescription}
                isDarkMode={isDarkMode}
                onConfigChange={handleConfigChange}
                eventId={id || ''}
                onFieldDelete={handleFieldDelete}
              />

              <EmbedCodeGenerator eventId={event.id} publicToken={event.id} />
            </div>

            {/* Right: Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Aperçu en temps réel
                </h3>
              </div>
              <div className="sticky top-6">
                <FormPreview
                  event={event}
                  fields={formFields}
                  functional={true}
                  submitButtonText={submitButtonText}
                  submitButtonColor={submitButtonColor}
                  showTitle={showTitle}
                  showDescription={showDescription}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <EventSettingsTab event={event} />
        )}

        {activeTab === 'stats' && (
          <EventStatsTab event={event} />
        )}

        {activeTab === 'team' && (
          <AssignedTeam eventId={event.id} />
        )}

        {activeTab === 'badges' && (
          <EventBadgesTab event={event} />
        )}

        {activeTab === 'sessions' && (
          <EventSessionsTab 
            event={event} 
            eventAttendeeTypes={eventAttendeeTypes || []} 
            isLoadingAttendeeTypes={isLoadingAttendeeTypes}
          />
        )}

        {activeTab === 'emails' && (
          <EventEmailsTab event={event} />
        )}
      </div>

      {/* Modals */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        eventId={event.id}
        onImportSuccess={handleImportSuccess}
      />

      <EditEventModal
        event={event}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <EventActionsModal
        isOpen={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        currentStatus={event.status}
        currentStartDate={event.startDate}
        currentEndDate={event.endDate}
        onStatusChange={handleStatusChange}
      />

      {/* Modal Ajouter un participant */}
      <Modal
        isOpen={isAddParticipantModalOpen}
        onClose={() => setIsAddParticipantModalOpen(false)}
        title="Ajouter un participant"
        maxWidth="4xl"
      >
        <AddParticipantForm
          fields={formFields}
          eventId={event.id}
          publicToken={event.publicToken}
          eventAttendeeTypes={eventAttendeeTypes || []}
          submitButtonText="Ajouter"
          submitButtonColor={submitButtonColor}
          onSuccess={() => {
            setIsAddParticipantModalOpen(false)
            refetchRegistrations()
          }}
        />
      </Modal>
      </div>
    </div>
  )
}
