import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import {
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Mail,
  Phone,
  Building2,
  RefreshCw,
  QrCode,
  Award,
  RotateCcw,
  UserCheck,
  Users,
  LogOut,
  Undo2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Printer,
} from 'lucide-react'
import type { RegistrationDPO } from '../dpo/registration.dpo'
import { Button, TableSelector, type TableSelectorOption, ActionButtons } from '@/shared/ui'
import { SearchInput } from '@/shared/ui'
import { FilterBar, FilterButton } from '@/shared/ui/FilterBar'
import type { FilterValues } from '@/shared/ui/FilterBar/types'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { Card } from '@/shared/ui/Card'
import { createSelectionColumn } from '@/shared/ui/DataTable/columns'
import { formatDateTime } from '@/shared/lib/utils'
import { useSelector } from 'react-redux'
import { selectToken } from '@/features/auth/model/sessionSlice'
import {
  useUpdateRegistrationStatusMutation,
  useUpdateRegistrationMutation,
  useDeleteRegistrationMutation,
  useRestoreRegistrationMutation,
  usePermanentDeleteRegistrationMutation,
  useBulkDeleteRegistrationsMutation,
  useBulkExportRegistrationsMutation,
  useBulkUpdateRegistrationStatusMutation,
  useBulkCheckInMutation,
  useCheckInMutation,
  useUndoCheckInMutation,
  useCheckOutMutation,
  useUndoCheckOutMutation,
  useApproveWithEmailMutation,
  useRejectWithEmailMutation,
} from '../api/registrationsApi'
import { EventAttendeeType } from '@/features/events/api/eventsApi'
import { useToast } from '@/shared/hooks/useToast'
import { EditRegistrationModal } from './EditRegistrationModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { RestoreRegistrationModal } from './RestoreRegistrationModal'
import { PermanentDeleteRegistrationModal } from './PermanentDeleteRegistrationModal'
import { QrCodeModal } from './QrCodeModal'
import { BadgePreviewModal } from './BadgePreviewModal'
import { BulkStatusChangeModal } from './BulkStatusChangeModal'
import { BulkAttendeeTypeChangeModal } from './BulkAttendeeTypeChangeModal'
import { ApprovalConfirmationModal } from './ApprovalConfirmationModal'
import { RejectionConfirmationModal } from './RejectionConfirmationModal'
import { createBulkActions } from '@/shared/ui/BulkActions'
import {
  getRegistrationFullName,
  getRegistrationEmail,
  getRegistrationPhone,
  getRegistrationCompany,
} from '../utils/registration-helpers'
import { useFuzzySearch } from '@/shared/hooks/useFuzzySearch'
import { generateAndDownloadBadge, type BadgeFormat } from '../utils/badgeDownload'
import type { FormField, CustomField } from '@/features/events/components/FormBuilder/types'
import { isCustomField } from '@/features/events/components/FormBuilder/types'

interface RegistrationsTableProps {
  registrations: RegistrationDPO[]
  isLoading: boolean
  eventId: string
  eventBadgeTemplateId?: string | null
  onExport?: () => void
  onRefresh?: () => void
  isDeletedTab: boolean
  tabsElement?: React.ReactNode
  meta?: {
    total: number
    statusCounts: {
      awaiting: number
      approved: number
      refused: number
    }
  }
  stats?: {
    total: number
    statusCounts: {
      awaiting: number
      approved: number
      refused: number
    }
  }
  // Server-side pagination
  currentPage?: number
  pageSize?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  eventAttendeeTypes?: EventAttendeeType[] | undefined
  isLoadingAttendeeTypes?: boolean
  formFields?: FormField[]
}

const STATUS_CONFIG = {
  awaiting: {
    label: 'En attente',
    icon: Clock,
    color:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  },
  approved: {
    label: 'Approuvé',
    icon: CheckCircle,
    color:
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  },
  refused: {
    label: 'Refusé',
    icon: XCircle,
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  },
  cancelled: {
    label: 'Annulé',
    icon: Ban,
    color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  },
}

// Options pour le TableSelector
const STATUS_OPTIONS: TableSelectorOption<string>[] = [
  {
    value: 'awaiting',
    label: 'En attente',
    icon: Clock,
    color: 'yellow',
    description: 'En attente de validation',
  },
  {
    value: 'approved',
    label: 'Approuvé',
    icon: CheckCircle,
    color: 'green',
    description: 'Inscription approuvée',
  },
  {
    value: 'refused',
    label: 'Refusé',
    icon: XCircle,
    color: 'red',
    description: 'Inscription refusée',
  },
  {
    value: 'cancelled',
    label: 'Annulé',
    icon: Ban,
    color: 'gray',
    description: 'Inscription annulée',
  },
]

export const RegistrationsTable: React.FC<RegistrationsTableProps> = ({
  registrations,
  isLoading,
  eventId,
  eventBadgeTemplateId,
  onExport,
  onRefresh,
  isDeletedTab,
  tabsElement,
  meta,
  stats,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  eventAttendeeTypes,
  isLoadingAttendeeTypes = false,
  formFields = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false)
  const [bulkStatusSelectedIds, setBulkStatusSelectedIds] = useState<Set<string>>(new Set())
  const [bulkTypeModalOpen, setBulkTypeModalOpen] = useState(false)
  const [bulkTypeSelectedIds, setBulkTypeSelectedIds] = useState<Set<string>>(new Set())
  const [editingRegistration, setEditingRegistration] =
    useState<RegistrationDPO | null>(null)
  const [deletingRegistration, setDeletingRegistration] =
    useState<RegistrationDPO | null>(null)
  const [approvingRegistration, setApprovingRegistration] =
    useState<RegistrationDPO | null>(null)
  const [rejectingRegistration, setRejectingRegistration] =
    useState<RegistrationDPO | null>(null)
  const [restoringRegistration, setRestoringRegistration] =
    useState<RegistrationDPO | null>(null)
  const [permanentDeletingRegistration, setPermanentDeletingRegistration] =
    useState<RegistrationDPO | null>(null)
  const [qrCodeRegistration, setQrCodeRegistration] =
    useState<RegistrationDPO | null>(null)
  const [badgeDownloadRegistration, setBadgeDownloadRegistration] =
    useState<RegistrationDPO | null>(null)
  const [quickDownloadingKeys, setQuickDownloadingKeys] = useState<Set<string>>(new Set())
  const [printingKeys, setPrintingKeys] = useState<Set<string>>(new Set())
  const downloadQueueRef = useRef<Array<{ registration: RegistrationDPO; format: 'pdf' | 'image' }>>([])
  const isProcessingQueueRef = useRef(false)
  const toast = useToast()
  const navigate = useNavigate()
  const token = useSelector(selectToken)

  // Fonction pour traiter la queue de téléchargements
  const processDownloadQueue = async () => {
    if (isProcessingQueueRef.current || downloadQueueRef.current.length === 0) {
      return
    }

    isProcessingQueueRef.current = true
    const item = downloadQueueRef.current[0]
    
    if (!item) {
      isProcessingQueueRef.current = false
      return
    }
    
    const { registration, format } = item
    const downloadKey = `${registration.id}-${format}`

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
      
      if (!token) {
        toast.error('Vous devez être connecté pour télécharger un badge')
        return
      }
      
      // Utiliser la fonction utilitaire pour générer et télécharger
      await generateAndDownloadBadge({
        registrationId: registration.id,
        eventId,
        format,
        firstName: registration.attendee?.firstName,
        lastName: registration.attendee?.lastName,
        token,
        apiUrl: API_URL,
      })
      
    } catch (error) {
      console.error(`Error downloading badge ${format}:`, error)
      toast.error(`Erreur lors du téléchargement du badge ${format}`)
    } finally {
      // Retirer de la queue et du Set
      downloadQueueRef.current.shift()
      setQuickDownloadingKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(downloadKey)
        return newSet
      })
      
      isProcessingQueueRef.current = false
      
      // Traiter le suivant s'il y en a
      if (downloadQueueRef.current.length > 0) {
        setTimeout(() => processDownloadQueue(), 100)
      }
    }
  }

  // Fonction de téléchargement rapide de badge (ajout à la queue)
  const handleQuickDownloadBadge = (registration: RegistrationDPO, format: 'pdf' | 'image') => {
    const downloadKey = `${registration.id}-${format}`
    
    // Ajouter à la queue
    downloadQueueRef.current.push({ registration, format })
    
    // Ajouter au Set des téléchargements actifs
    setQuickDownloadingKeys(prev => new Set(prev).add(downloadKey))
    
    // Démarrer le traitement
    processDownloadQueue()
  }

  // Fonction d'impression de badge
  const handlePrintBadge = async (registration: RegistrationDPO) => {
    const printKey = registration.id
    setPrintingKeys(prev => new Set(prev).add(printKey))

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
      
      if (!token) {
        toast.error('Vous devez être connecté pour imprimer un badge')
        return
      }

      // Récupérer le badge ID depuis l'URL du badge
      const badgeUrl = registration.badgePdfUrl || registration.badgeImageUrl
      if (!badgeUrl) {
        toast.error('Ce participant n\'a pas encore de badge généré')
        return
      }

      // Extraire le badge ID depuis l'URL (format: /api/badges/{badgeId}/pdf)
      const badgeIdMatch = badgeUrl.match(/\/badges\/([a-f0-9-]+)\//i)
      if (!badgeIdMatch) {
        toast.error('Impossible d\'extraire l\'ID du badge')
        return
      }
      const badgeId = badgeIdMatch[1]

      const response = await fetch(
        `${API_URL}/badge-generation/${badgeId}/pdf-base64`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Échec de la récupération du badge')
      }

      const pdfBase64 = await response.text()

      // Ouvrir une fenêtre d'impression
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error('Impossible d\'ouvrir la fenêtre d\'impression. Veuillez autoriser les popups.')
        return
      }

      const attendeeName = registration.attendee 
        ? `${registration.attendee.firstName} ${registration.attendee.lastName}`
        : 'Participant'

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impression Badge - ${attendeeName}</title>
            <style>
              body { margin: 0; padding: 0; }
              iframe { border: none; width: 100%; height: 100vh; }
            </style>
          </head>
          <body>
            <iframe src="data:application/pdf;base64,${pdfBase64}"></iframe>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()

      toast.success(`Badge de ${attendeeName} prêt à imprimer`)
    } catch (error) {
      console.error('Error printing badge:', error)
      toast.error('Erreur lors de l\'impression du badge')
    } finally {
      setPrintingKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(printKey)
        return newSet
      })
    }
  }

  // Configuration des filtres pour le popup
  const filterConfig = {
    status: {
      label: 'Statut',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'awaiting', label: 'En attente' },
        { value: 'approved', label: 'Approuvés' },
        { value: 'refused', label: 'Refusés' },
        { value: 'cancelled', label: 'Annulés' },
      ],
    },
    attendeeType: {
      label: 'Type de participant',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous les types' },
        { value: 'none', label: 'Aucun' },
        ...(eventAttendeeTypes?.filter(type => type.is_active && type.attendeeType.is_active).map(type => ({
          value: type.attendee_type_id,
          label: type.attendeeType.name
        })) || [])
      ],
    },
    checkin: {
      label: 'Check-in',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous les check-ins' },
        { value: 'checked', label: 'Enregistrés' },
        { value: 'not_checked', label: 'Non enregistrés' },
      ],
    },
  }

  // Options pour le sélecteur de type dans le tableau
  const attendeeTypeOptions: TableSelectorOption<string>[] = useMemo(() => {
    if (!eventAttendeeTypes) return [{ value: 'none', label: 'Aucun', color: 'gray' as const }]
    
    // Vérifier quels types inactifs sont utilisés par au moins une registration
    const usedTypeIds = new Set(
      registrations
        ?.filter(r => r.eventAttendeeType?.id)
        .map(r => r.eventAttendeeType!.id)
    )
    
    // Séparer les types actifs et inactifs
    const activeTypes = eventAttendeeTypes
      .filter(type => type.is_active && type.attendeeType.is_active)
      .map(type => ({
        value: type.id,
        label: type.attendeeType.name,
        hexColor: type.color_hex || type.attendeeType.color_hex || '#9ca3af',
        textHexColor: type.text_color_hex || type.attendeeType.text_color_hex || '#ffffff',
        disabled: false,
      }))
    
    // Types inactifs mais utilisés (affichés en bas, grisés, disabled)
    const inactiveUsedTypes = eventAttendeeTypes
      .filter(type => !type.is_active && usedTypeIds.has(type.id))
      .map(type => ({
        value: type.id,
        label: type.attendeeType.name,
        hexColor: '#6b7280', // Gris
        textHexColor: '#9ca3af',
        disabled: true,
      }))
    
    return [
      { value: 'none', label: 'Aucun', color: 'gray' as const },
      ...activeTypes,
      ...inactiveUsedTypes
    ]
  }, [eventAttendeeTypes, registrations])

  // Optimistic updates: stocke temporairement les nouveaux status avant confirmation serveur
  const [optimisticStatusUpdates, setOptimisticStatusUpdates] = useState<Map<string, string>>(new Map())
  // Optimistic updates pour les types de participants
  const [optimisticTypeUpdates, setOptimisticTypeUpdates] = useState<Map<string, string>>(new Map())

  // Nettoyage automatique des mises à jour optimistes quand les valeurs serveur correspondent
  useEffect(() => {
    // Nettoyer les mises à jour de statut optimistes
    const statusToClean: string[] = []
    optimisticStatusUpdates.forEach((optimisticValue, registrationId) => {
      const registration = registrations.find(r => r.id === registrationId)
      if (registration && registration.status === optimisticValue) {
        statusToClean.push(registrationId)
      }
    })
    
    if (statusToClean.length > 0) {
      setOptimisticStatusUpdates(prev => {
        const next = new Map(prev)
        statusToClean.forEach(id => next.delete(id))
        return next
      })
    }

    // Nettoyer les mises à jour de type optimistes
    const typeToClean: string[] = []
    optimisticTypeUpdates.forEach((optimisticValue, registrationId) => {
      const registration = registrations.find(r => r.id === registrationId)
      const serverTypeId = registration?.eventAttendeeType?.id || 'none'
      if (serverTypeId === optimisticValue) {
        typeToClean.push(registrationId)
      }
    })
    
    if (typeToClean.length > 0) {
      setOptimisticTypeUpdates(prev => {
        const next = new Map(prev)
        typeToClean.forEach(id => next.delete(id))
        return next
      })
    }
  }, [registrations, optimisticStatusUpdates, optimisticTypeUpdates])

  const [updateStatus] = useUpdateRegistrationStatusMutation()
  const [approveWithEmail, { isLoading: isApproving }] = useApproveWithEmailMutation()
  const [rejectWithEmail, { isLoading: isRejecting }] = useRejectWithEmailMutation()
  const [updateRegistration, { isLoading: isUpdating }] =
    useUpdateRegistrationMutation()
  const [deleteRegistration] = useDeleteRegistrationMutation()
  const [restoreRegistration] = useRestoreRegistrationMutation()
  const [permanentDeleteRegistration] = usePermanentDeleteRegistrationMutation()
  const [bulkDeleteRegistrations] = useBulkDeleteRegistrationsMutation()
  const [bulkExportRegistrations] = useBulkExportRegistrationsMutation()
  const [bulkUpdateStatus] = useBulkUpdateRegistrationStatusMutation()
  const [bulkCheckIn] = useBulkCheckInMutation()
  const [checkIn] = useCheckInMutation()
  const [undoCheckIn] = useUndoCheckInMutation()
  const [checkOut] = useCheckOutMutation()
  const [undoCheckOut] = useUndoCheckOutMutation()

  const handleRowClick = (registration: RegistrationDPO) => {
    navigate(`/attendees/${registration.attendeeId}`)
  }

  const handleStatusChange = async (
    registrationId: string,
    newStatus: string
  ) => {
    // Optimistic update: afficher immédiatement le nouveau statut
    setOptimisticStatusUpdates(prev => new Map(prev).set(registrationId, newStatus))
    
    try {
      await updateStatus({ id: registrationId, status: newStatus }).unwrap()
      toast.success(
        'Statut mis à jour',
        `L'inscription a été ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG].label.toLowerCase()}`
      )
      // Le nettoyage se fera automatiquement quand le serveur renverra la bonne valeur
    } catch (error: any) {
      console.error('Error updating status:', error)
      // Erreur: restaurer l'ancienne valeur
      setOptimisticStatusUpdates(prev => {
        const next = new Map(prev)
        next.delete(registrationId)
        return next
      })

      let title = 'Erreur'
      let message = 'Impossible de mettre à jour le statut'

      if (error?.status === 409) {
        title = 'Capacité atteinte'
        message = "L'événement est complet. Impossible d'approuver ce participant."
      } else if (error?.data?.message) {
        message = error.data.message
      }

      toast.error(title, message)
    }
  }

  const handleAttendeeTypeChange = async (
    registrationId: string,
    newEventAttendeeTypeId: string
  ) => {
    // Optimistic update: afficher immédiatement le nouveau type
    setOptimisticTypeUpdates(prev => new Map(prev).set(registrationId, newEventAttendeeTypeId))
    
    try {
      await updateRegistration({
        id: registrationId,
        eventId,
        data: {
          eventAttendeeTypeId: newEventAttendeeTypeId === 'none' ? null : newEventAttendeeTypeId
        }
      }).unwrap()
      toast.success('Type mis à jour', 'Le type de participant a été modifié')
      // Le nettoyage se fera automatiquement quand le serveur renverra la bonne valeur
    } catch (error: any) {
      console.error('Error updating type:', error)
      // Erreur: restaurer l'ancienne valeur
      setOptimisticTypeUpdates(prev => {
        const next = new Map(prev)
        next.delete(registrationId)
        return next
      })
      toast.error('Erreur', 'Impossible de mettre à jour le type')
    }
  }

  const handleApproveWithEmail = async (sendEmail: boolean) => {
    if (!approvingRegistration) return

    try {
      await approveWithEmail({
        id: approvingRegistration.id,
        sendEmail,
      }).unwrap()
      
      const message = sendEmail 
        ? "L'inscription a été approuvée et l'email de confirmation a été envoyé"
        : "L'inscription a été approuvée sans envoi d'email"
      
      toast.success('Inscription approuvée', message)
      setApprovingRegistration(null)
    } catch (error: any) {
      console.error('Error approving with email:', error)
      
      let title = 'Erreur'
      let message = "Impossible d'approuver l'inscription"

      if (error?.status === 409) {
        title = 'Capacité atteinte'
        message = "L'événement est complet. Impossible d'approuver ce participant."
      } else if (error?.data?.message) {
        message = error.data.message
      }

      toast.error(title, message)
    }
  }

  const handleRejectWithEmail = async (sendEmail: boolean) => {
    if (!rejectingRegistration) return

    try {
      await rejectWithEmail({
        id: rejectingRegistration.id,
        sendEmail,
      }).unwrap()
      
      const message = sendEmail 
        ? "L'inscription a été refusée et l'email de notification a été envoyé"
        : "L'inscription a été refusée sans envoi d'email"
      
      toast.success('Inscription refusée', message)
      setRejectingRegistration(null)
    } catch (error: any) {
      console.error('Error rejecting with email:', error)
      
      let title = 'Erreur'
      let message = "Impossible de refuser l'inscription"

      if (error?.data?.message) {
        message = error.data.message
      }

      toast.error(title, message)
    }
  }

  const handleCheckIn = async (registration: RegistrationDPO) => {
    try {
      await checkIn({
        id: registration.id,
        eventId,
      }).unwrap()
      toast.success(
        'Check-in effectué',
        'Le participant a été enregistré comme présent'
      )
    } catch (error: any) {
      console.error('Error checking in:', error)
      const errorMessage = error?.data?.message || 'Impossible d\'effectuer le check-in'
      toast.error('Erreur', errorMessage)
    }
  }

  const handleUndoCheckIn = async (registration: RegistrationDPO) => {
    try {
      await undoCheckIn({
        id: registration.id,
        eventId,
      }).unwrap()
      toast.success(
        'Check-in annulé',
        'Le check-in a été annulé avec succès'
      )
    } catch (error: any) {
      console.error('Error undoing check-in:', error)
      const errorMessage = error?.data?.message || 'Impossible d\'annuler le check-in'
      toast.error('Erreur', errorMessage)
    }
  }

  const handleCheckOut = async (registration: RegistrationDPO) => {
    try {
      await checkOut({
        id: registration.id,
        eventId,
      }).unwrap()
      toast.success(
        'Check-out effectué',
        'Le participant a été enregistré comme sorti'
      )
    } catch (error: any) {
      console.error('Error checking out:', error)
      const errorMessage = error?.data?.message || 'Impossible d\'effectuer le check-out'
      toast.error('Erreur', errorMessage)
    }
  }

  const handleUndoCheckOut = async (registration: RegistrationDPO) => {
    try {
      await undoCheckOut({
        id: registration.id,
        eventId,
      }).unwrap()
      toast.success(
        'Check-out annulé',
        'Le check-out a été annulé avec succès'
      )
    } catch (error: any) {
      console.error('Error undoing check-out:', error)
      const errorMessage = error?.data?.message || 'Impossible d\'annuler le check-out'
      toast.error('Erreur', errorMessage)
    }
  }

  const handleUpdate = async (data: any) => {
    if (!editingRegistration) return

    try {
      await updateRegistration({
        id: editingRegistration.id,
        eventId,
        data,
      }).unwrap()
      toast.success(
        'Inscription mise à jour',
        'Les informations ont été modifiées avec succès'
      )
      setEditingRegistration(null)
    } catch (error) {
      console.error('Error updating registration:', error)
      toast.error('Erreur', "Impossible de mettre à jour l'inscription")
    }
  }

  const handleDelete = async () => {
    if (!deletingRegistration) return

    try {
      await deleteRegistration({
        id: deletingRegistration.id,
        eventId,
      }).unwrap()
      toast.success(
        'Inscription supprimée',
        "L'inscription a été déplacée dans les éléments supprimés"
      )
      setDeletingRegistration(null)
    } catch (error) {
      console.error('Error deleting registration:', error)
      toast.error('Erreur', "Impossible de supprimer l'inscription")
    }
  }

  const handleRestore = async () => {
    if (!restoringRegistration) return

    try {
      await restoreRegistration({
        id: restoringRegistration.id,
        eventId,
      }).unwrap()
      toast.success(
        'Inscription restaurée',
        "L'inscription a été restaurée avec succès"
      )
      setRestoringRegistration(null)
    } catch (error: any) {
      console.error('Error restoring registration:', error)
      
      let title = 'Erreur'
      let message = "Impossible de restaurer l'inscription"

      if (error?.status === 409) {
        title = 'Capacité atteinte'
        message = "L'événement est complet. Impossible de restaurer une inscription approuvée."
      } else if (error?.data?.message) {
        message = error.data.message
      }

      toast.error(title, message)
    }
  }

  const handlePermanentDelete = async () => {
    if (!permanentDeletingRegistration) return

    try {
      await permanentDeleteRegistration({
        id: permanentDeletingRegistration.id,
        eventId,
      }).unwrap()
      toast.success(
        'Inscription supprimée définitivement',
        "L'inscription a été supprimée définitivement"
      )
      setPermanentDeletingRegistration(null)
    } catch (error) {
      console.error('Error permanently deleting registration:', error)
      toast.error('Erreur', "Impossible de supprimer définitivement l'inscription")
    }
  }

  const handleBulkStatusChange = async (status: string) => {
    try {
      await bulkUpdateStatus({
        ids: Array.from(bulkStatusSelectedIds),
        status,
      }).unwrap()
      
      const statusLabel = STATUS_OPTIONS.find(o => o.value === status)?.label || status
      toast.success(`${bulkStatusSelectedIds.size} inscription(s) → ${statusLabel}`)
      
      // Réinitialiser
      setBulkStatusModalOpen(false)
      setBulkStatusSelectedIds(new Set())
    } catch (error: any) {
      console.error('Erreur lors du changement de statut:', error)
      
      let title = 'Erreur'
      let message = 'Erreur lors du changement de statut'

      if (error?.status === 409) {
        title = 'Capacité atteinte'
        message = "L'événement est complet. Impossible d'approuver ces participants."
      } else if (error?.data?.message) {
        message = error.data.message
      }

      toast.error(title, message)
      throw error
    }
  }

  const handleBulkAttendeeTypeChange = async (attendeeTypeId: string) => {
    try {
      // On utilise updateRegistration en boucle car il n'y a pas encore de mutation bulk pour le type
      // TODO: Créer une mutation bulkUpdateAttendeeType pour optimiser
      await Promise.all(
        Array.from(bulkTypeSelectedIds).map((id) =>
          updateRegistration({
            id,
            eventId,
            data: {
              eventAttendeeTypeId: attendeeTypeId === 'none' ? null : attendeeTypeId
            }
          }).unwrap()
        )
      )
      
      toast.success(`${bulkTypeSelectedIds.size} inscription(s) mise(s) à jour`)
      
      // Réinitialiser
      setBulkTypeModalOpen(false)
      setBulkTypeSelectedIds(new Set())
    } catch (error) {
      console.error('Erreur lors du changement de type:', error)
      toast.error('Erreur', "Impossible de mettre à jour les types")
      throw error
    }
  }

  // Extraction des valeurs de filtres
  const statusFilter = (filterValues.status as string) || 'all'
  const checkinFilter = (filterValues.checkin as string) || 'all'
  const attendeeTypeFilter = (filterValues.attendeeType as string) || 'all'

  // 1. Recherche floue (Fuzzy Search)
  const searchResults = useFuzzySearch(
    registrations,
    searchQuery,
    [
      'attendee.firstName',
      'attendee.lastName',
      'attendee.email',
      'attendee.company',
    ]
  )

  // Filtrage
  const filteredRegistrations = useMemo(() => {
    // 2. Autres filtres
    return searchResults.filter((reg) => {
      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter

      const matchesCheckin =
        checkinFilter === 'all' ||
        (checkinFilter === 'checked' && reg.checkedInAt) ||
        (checkinFilter === 'not_checked' && !reg.checkedInAt)

      const matchesAttendeeType = 
        attendeeTypeFilter === 'all' || 
        (attendeeTypeFilter === 'none' && !reg.eventAttendeeTypeId) ||
        reg.eventAttendeeTypeId === attendeeTypeFilter || // Si on filtre par ID de liaison
        (reg.eventAttendeeType?.attendeeType?.id === attendeeTypeFilter) // Si on filtre par ID de type

      return matchesStatus && matchesCheckin && matchesAttendeeType
    })
  }, [searchResults, statusFilter, checkinFilter, attendeeTypeFilter])

  // Helper function pour formater les valeurs des champs custom
  const formatCustomValue = (value: any, field: CustomField): string => {
    if (value === null || value === undefined) return '-'

    switch (field.fieldType) {
      case 'date':
        try {
          return new Date(value).toLocaleDateString('fr-FR')
        } catch {
          return String(value)
        }
      case 'checkbox':
        return value === true ? '✓' : '✗'
      case 'multiselect':
        if (Array.isArray(value)) {
          return value.join(', ')
        }
        return String(value)
      case 'select':
      case 'radio':
        // Trouver le label de l'option sélectionnée
        const option = field.options?.find(opt => opt.value === value)
        return option?.label || String(value)
      default:
        return String(value)
    }
  }

  // Extraire toutes les clés d'answers présentes dans les données
  const allAnswerKeys = useMemo(() => {
    const keys = new Set<string>()
    registrations.forEach(reg => {
      if (reg.answers && typeof reg.answers === 'object') {
        Object.keys(reg.answers).forEach(key => keys.add(key))
      }
    })
    return Array.from(keys)
  }, [registrations])

  // Calculer la visibilité initiale des colonnes basée sur le contenu
  const initialColumnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {}
    
    // Toujours afficher select, participant et actions
    // Les autres colonnes ne sont affichées que si elles ont au moins une valeur
    
    // Contact : masquer si aucun email ET aucun téléphone ET aucun commentaire
    const hasContactData = registrations.some(reg => 
      getRegistrationEmail(reg) || getRegistrationPhone(reg) || reg.comment
    )
    visibility['contact'] = hasContactData
    
    // AttendeeType : masquer si tous sont 'Aucun' ou undefined
    const hasAttendeeType = registrations.some(reg => 
      reg.eventAttendeeType?.attendeeType?.name
    )
    visibility['attendeeType'] = hasAttendeeType
    
    // Status : toujours afficher
    visibility['status'] = true
    
    // CreatedAt : masquer si tous vides
    const hasCreatedAt = registrations.some(reg => reg.createdAt)
    visibility['createdAt'] = hasCreatedAt
    
    // CheckIn : masquer si aucun check-in
    const hasCheckIn = registrations.some(reg => reg.checkedInAt)
    visibility['checkIn'] = hasCheckIn
    
    // CheckOut : masquer si aucun check-out
    const hasCheckOut = registrations.some(reg => reg.checkedOutAt)
    visibility['checkOut'] = hasCheckOut
    
    // Pour les colonnes custom, vérifier si au moins une valeur existe
    allAnswerKeys.forEach(fieldId => {
      const hasData = registrations.some(reg => {
        const answer = reg.answers?.[fieldId]
        // Support ancien et nouveau format
        const value = typeof answer === 'object' && answer !== null && 'value' in answer ? answer.value : answer
        return value !== undefined && value !== null && value !== ''
      })
      visibility[`custom_${fieldId}`] = hasData
    })
    
    return visibility
  }, [registrations, allAnswerKeys])

  // Générer les colonnes dynamiques pour les champs custom
  const customColumns = useMemo<ColumnDef<RegistrationDPO>[]>(() => {
    // Pour chaque clé trouvée dans answers, créer une colonne
    return allAnswerKeys.map((fieldId) => {
      // Chercher le champ dans le formulaire pour avoir le type et les options
      const field = formFields?.find(f => f.id === fieldId && isCustomField(f)) as CustomField | undefined
      
      // Récupérer le label depuis les données (première inscription qui a ce champ)
      const sampleAnswer = registrations.find(reg => reg.answers?.[fieldId])?.answers?.[fieldId]
      const storedLabel = typeof sampleAnswer === 'object' && sampleAnswer !== null && 'label' in sampleAnswer 
        ? sampleAnswer.label 
        : field?.label || `Champ ${fieldId.slice(0, 8)}...`
      
      return {
        id: `custom_${fieldId}`,
        header: storedLabel,
        accessorFn: (row) => {
          const answer = row.answers?.[fieldId]
          // Support ancien format (valeur directe) et nouveau format (objet)
          return typeof answer === 'object' && answer !== null && 'value' in answer ? answer.value : answer
        },
        cell: ({ row }) => {
          const answer = row.original.answers?.[fieldId]
          const value = typeof answer === 'object' && answer !== null && 'value' in answer ? answer.value : answer
          const fieldType = typeof answer === 'object' && answer !== null && 'fieldType' in answer ? answer.fieldType : field?.fieldType
          
          return (
            <div 
              className="cursor-pointer text-sm text-gray-900 dark:text-white"
              onClick={() => handleRowClick(row.original)}
            >
              {field && fieldType ? formatCustomValue(value, { ...field, fieldType }) : (value ? String(value) : '—')}
            </div>
          )
        },
      }
    })
  }, [allAnswerKeys, formFields, registrations])

  // Columns definition
  const columns = useMemo<ColumnDef<RegistrationDPO>[]>(
    () => {
      const baseColumns: ColumnDef<RegistrationDPO>[] = [
      createSelectionColumn<RegistrationDPO>(),
      {
        id: 'participant',
        header: 'Participant',
        accessorFn: (row) => getRegistrationFullName(row),
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => (
          <div className="cursor-pointer" onClick={() => handleRowClick(row.original)}>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {getRegistrationFullName(row.original)}
            </div>
            {getRegistrationCompany(row.original) && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                <Building2 className="h-3 w-3 mr-1" />
                {getRegistrationCompany(row.original)}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'contact',
        header: 'Contact',
        accessorFn: (row) => getRegistrationEmail(row),
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => (
          <div className="cursor-pointer space-y-1" onClick={() => handleRowClick(row.original)}>
            <div className="text-sm text-gray-900 dark:text-white flex items-center">
              <Mail className="h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
              {getRegistrationEmail(row.original)}
            </div>
            {getRegistrationPhone(row.original) && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {getRegistrationPhone(row.original)}
              </div>
            )}
            {row.original.comment && (
              <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                💬 {row.original.comment}
              </div>
            )}
          </div>
        ),
      },
      // Injecter les colonnes custom ici
      ...customColumns,
      {
        id: 'attendeeType',
        header: 'Type',
        accessorFn: (row) => row.eventAttendeeType?.attendeeType?.name || 'Aucun',
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => {
          // Utiliser la valeur optimiste si disponible, sinon la valeur serveur
          const optimisticType = optimisticTypeUpdates.get(row.original.id)
          const serverTypeId = row.original.eventAttendeeType?.id || 'none'
          const currentTypeId = optimisticType || serverTypeId
          
          // S'assurer que l'option actuelle existe dans la liste pour l'affichage correct
          // (Même si la liste globale est en cours de chargement ou si le type est manquant)
          const currentOptionExists = attendeeTypeOptions.some(o => o.value === currentTypeId)
          
          let displayOptions = attendeeTypeOptions
          if (!currentOptionExists && row.original.eventAttendeeType) {
            // Le type actuel n'est pas dans la liste (probablement désactivé)
            // On l'ajoute uniquement pour cet utilisateur avec une indication
            displayOptions = [
              ...attendeeTypeOptions,
              {
                value: row.original.eventAttendeeType.id,
                label: row.original.eventAttendeeType.attendeeType.name,
                hexColor: row.original.eventAttendeeType.color_hex || row.original.eventAttendeeType.attendeeType.color_hex,
                textHexColor: row.original.eventAttendeeType.text_color_hex || row.original.eventAttendeeType.attendeeType.text_color_hex || '#ffffff',
                description: 'Type désactivé' as const
              }
            ]
          }

          return (
            <TableSelector
              value={currentTypeId}
              options={displayOptions}
              onChange={(newValue) => handleAttendeeTypeChange(row.original.id, newValue)}
              disabled={isLoadingAttendeeTypes && !eventAttendeeTypes}
              loadingText="..."
              size="sm"
            />
          )
        },
      },
      {
        id: 'status',
        header: 'Statut',
        accessorKey: 'status',
        cell: ({ row }) => {
          // Utiliser la valeur optimiste si disponible, sinon la valeur serveur
          const optimisticStatus = optimisticStatusUpdates.get(row.original.id)
          const displayedStatus = optimisticStatus || row.original.status
          
          if (isDeletedTab) {
            // Affichage simple pour les inscriptions supprimées
            const StatusIcon = STATUS_CONFIG[displayedStatus as keyof typeof STATUS_CONFIG].icon
            return (
              <div className="cursor-pointer" onClick={() => handleRowClick(row.original)}>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[displayedStatus as keyof typeof STATUS_CONFIG].color}`}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {STATUS_CONFIG[displayedStatus as keyof typeof STATUS_CONFIG].label}
                </span>
              </div>
            )
          }

          // StatusSelector pour les inscriptions actives
          return (
            <TableSelector
              value={displayedStatus}
              options={STATUS_OPTIONS}
              onChange={async (newStatus) => {
                try {
                  await handleStatusChange(row.original.id, newStatus)
                } catch (error) {
                  // L'erreur est déjà gérée dans handleStatusChange
                  throw error
                }
              }}
              loadingText="Mise à jour..."
            />
          )
        },
      },
      {
        id: 'checkin',
        header: 'Check-in',
        accessorKey: 'checkedInAt',
        cell: ({ row }) => (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {row.original.checkedInAt ? (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(row.original.checkedInAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUndoCheckIn(row.original)}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 p-1.5 h-auto"
                  title="Annuler le check-in"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    Pas encore
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCheckIn(row.original)}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 p-1.5 h-auto"
                  title="Effectuer le check-in"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        ),
      },
      {
        id: 'checkout',
        header: 'Check-out',
        accessorKey: 'checkedOutAt',
        cell: ({ row }) => (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {row.original.checkedOutAt ? (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <LogOut className="h-4 w-4 text-blue-500" />
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(row.original.checkedOutAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUndoCheckOut(row.original)}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 p-1.5 h-auto"
                  title="Annuler le check-out"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : row.original.checkedInAt ? (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    Pas encore
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCheckOut(row.original)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 h-auto"
                  title="Effectuer le check-out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  Non disponible
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'date',
        header: "Date d'inscription",
        accessorKey: 'invitedAt',
        cell: ({ row }) => (
          <div className="cursor-pointer text-sm text-gray-500 dark:text-gray-400" onClick={() => handleRowClick(row.original)}>
            {formatDateTime(row.original.invitedAt || row.original.createdAt)}
          </div>
        ),
      },
      {
        id: 'qrcode',
        header: 'QR Code',
        cell: ({ row }) => (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setQrCodeRegistration(row.original)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Voir QR Code"
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: 'badge',
        header: 'Badge',
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setBadgeDownloadRegistration(row.original)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              title="Voir le badge"
            >
              <Award className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePrintBadge(row.original)}
              disabled={printingKeys.has(row.original.id)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Imprimer le badge"
            >
              {printingKeys.has(row.original.id) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => handleQuickDownloadBadge(row.original, 'pdf')}
              disabled={quickDownloadingKeys.has(`${row.original.id}-pdf`)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Télécharger PDF"
            >
              {quickDownloadingKeys.has(`${row.original.id}-pdf`) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => handleQuickDownloadBadge(row.original, 'image')}
              disabled={quickDownloadingKeys.has(`${row.original.id}-image`)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Télécharger Image"
            >
              {quickDownloadingKeys.has(`${row.original.id}-image`) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) =>
          isDeletedTab ? (
            <ActionButtons
              size="sm"
              iconOnly
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRestoringRegistration(row.original)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 min-w-[32px] p-1.5"
                title="Restaurer"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPermanentDeletingRegistration(row.original)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[32px] p-1.5"
                title="Supprimer définitivement"
              >
                <XCircle className="h-4 w-4 shrink-0" />
              </Button>
            </ActionButtons>
          ) : (
            <ActionButtons
              onEdit={() => setEditingRegistration(row.original)}
              onDelete={() => setDeletingRegistration(row.original)}
              size="sm"
              iconOnly
            >
              {row.original.status === 'awaiting' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setApprovingRegistration(row.original)}
                    disabled={isUpdating}
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 min-w-[32px] p-1.5"
                    title="Approuver"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRejectingRegistration(row.original)}
                    disabled={isUpdating}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[32px] p-1.5"
                    title="Refuser"
                  >
                    <XCircle className="h-4 w-4 shrink-0" />
                  </Button>
                </>
              )}
            </ActionButtons>
          ),
        enableSorting: false,
        enableHiding: false,
      },
    ]
    
    return baseColumns
  },
    [isUpdating, isDeletedTab, optimisticStatusUpdates, updateStatus, quickDownloadingKeys, customColumns]
  )

  // Bulk actions
  const bulkActions = useMemo(() => {
    const actions = []

    // Export : toujours disponible
    actions.push(
      createBulkActions.export(async (selectedIds) => {
        console.log('🔵 Export sélection multiple appelé', { count: selectedIds.size })
        try {
          const response = await bulkExportRegistrations({
            ids: Array.from(selectedIds),
            format: 'excel',
          }).unwrap()

          console.log('✅ Réponse export sélection:', response)

          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = response.downloadUrl
          a.download = response.filename || 'inscriptions.xlsx'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          
          toast.success(`${selectedIds.size} inscription(s) exportée(s)`)
        } catch (error) {
          console.error("❌ Erreur lors de l'export sélection:", error)
          toast.error("Erreur lors de l'export")
          throw error
        }
      })
    )

    if (!isDeletedTab) {
      // Actions pour les inscriptions actives
      
      // Changer le statut avec sélecteur
      actions.push({
        id: 'change-status',
        label: 'Changer le statut',
        icon: <RefreshCw className="h-4 w-4" />,
        variant: 'outline' as const,
        skipClearSelection: true, // Ne pas réinitialiser car on ouvre juste une modale
        onClick: async (selectedIds: Set<string>) => {
          // Ouvrir la modale de sélection de statut
          setBulkStatusSelectedIds(selectedIds)
          setBulkStatusModalOpen(true)
          // Ne pas throw d'erreur ici car on ouvre juste la modale
        }
      })

      // Changer le type avec sélecteur
      actions.push({
        id: 'change-type',
        label: 'Changer le type',
        icon: <Users className="h-4 w-4" />,
        variant: 'outline' as const,
        skipClearSelection: true,
        onClick: async (selectedIds: Set<string>) => {
          setBulkTypeSelectedIds(selectedIds)
          setBulkTypeModalOpen(true)
        }
      })

      // Check-in en masse
      actions.push({
        id: 'check-in',
        label: 'Check-in',
        icon: <UserCheck className="h-4 w-4" />,
        variant: 'default' as const,
        requiresConfirmation: true,
        confirmationMessage: 'Enregistrer le check-in pour toutes les inscriptions sélectionnées ?',
        actionType: 'edit' as const,
        onClick: async (selectedIds: Set<string>) => {
          try {
            const result = await bulkCheckIn({
              ids: Array.from(selectedIds),
            }).unwrap()
            
            toast.success(`Check-in effectué pour ${result.checkedInCount} inscription(s)`)
          } catch (error) {
            console.error('Erreur lors du check-in:', error)
            toast.error('Erreur lors du check-in')
            throw error
          }
        }
      })

      // Undo Check-in en masse
      actions.push({
        id: 'undo-check-in',
        label: 'Annuler Check-in',
        icon: <Undo2 className="h-4 w-4" />,
        variant: 'outline' as const,
        requiresConfirmation: true,
        confirmationMessage: 'Annuler le check-in pour toutes les inscriptions sélectionnées ?',
        actionType: 'edit' as const,
        onClick: async (selectedIds: Set<string>) => {
          try {
            await Promise.all(
              Array.from(selectedIds).map((id) =>
                undoCheckIn({ id, eventId }).unwrap()
              )
            )
            toast.success(`Check-in annulé pour ${selectedIds.size} inscription(s)`)
          } catch (error) {
            console.error('Erreur lors de l\'annulation du check-in:', error)
            toast.error('Erreur lors de l\'annulation du check-in')
            throw error
          }
        }
      })

      // Check-out en masse
      actions.push({
        id: 'check-out',
        label: 'Check-out',
        icon: <LogOut className="h-4 w-4" />,
        variant: 'default' as const,
        requiresConfirmation: true,
        confirmationMessage: 'Enregistrer le check-out pour toutes les inscriptions sélectionnées ?',
        actionType: 'edit' as const,
        onClick: async (selectedIds: Set<string>) => {
          try {
            await Promise.all(
              Array.from(selectedIds).map((id) =>
                checkOut({ id, eventId }).unwrap()
              )
            )
            toast.success(`Check-out effectué pour ${selectedIds.size} inscription(s)`)
          } catch (error) {
            console.error('Erreur lors du check-out:', error)
            toast.error('Erreur lors du check-out')
            throw error
          }
        }
      })

      // Undo Check-out en masse
      actions.push({
        id: 'undo-check-out',
        label: 'Annuler Check-out',
        icon: <Undo2 className="h-4 w-4" />,
        variant: 'outline' as const,
        requiresConfirmation: true,
        confirmationMessage: 'Annuler le check-out pour toutes les inscriptions sélectionnées ?',
        actionType: 'edit' as const,
        onClick: async (selectedIds: Set<string>) => {
          try {
            await Promise.all(
              Array.from(selectedIds).map((id) =>
                undoCheckOut({ id, eventId }).unwrap()
              )
            )
            toast.success(`Check-out annulé pour ${selectedIds.size} inscription(s)`)
          } catch (error) {
            console.error('Erreur lors de l\'annulation du check-out:', error)
            toast.error('Erreur lors de l\'annulation du check-out')
            throw error
          }
        }
      })

      // Supprimer (soft delete)
      actions.push({
        id: 'delete',
        label: 'Supprimer',
        icon: <XCircle className="h-4 w-4" />,
        variant: 'destructive' as const,
        requiresConfirmation: true,
        confirmationMessage: 'Supprimer toutes les inscriptions sélectionnées ? Elles seront déplacées dans les éléments supprimés.',
        actionType: 'delete' as const,
        onClick: async (selectedIds: Set<string>) => {
          try {
            // Utiliser deleteRegistration pour chaque ID (soft delete)
            await Promise.all(
              Array.from(selectedIds).map((id) =>
                deleteRegistration({ id, eventId }).unwrap()
              )
            )
            toast.success(`${selectedIds.size} inscription(s) supprimée(s)`)
          } catch (error) {
            console.error('Erreur lors de la suppression:', error)
            toast.error('Erreur lors de la suppression')
            throw error
          }
        }
      })
    } else {
      // Actions pour les inscriptions supprimées
      
      // Restaurer en masse
      actions.push({
        id: 'restore',
        label: 'Restaurer',
        icon: <RotateCcw className="h-4 w-4" />,
        variant: 'default' as const,
        requiresConfirmation: true,
        confirmationMessage: 'Restaurer toutes les inscriptions sélectionnées ?',
        actionType: 'edit' as const,
        onClick: async (selectedIds: Set<string>) => {
          try {
            await Promise.all(
              Array.from(selectedIds).map((id) =>
                restoreRegistration({ id, eventId }).unwrap()
              )
            )
            toast.success(`${selectedIds.size} inscription(s) restaurée(s)`)
          } catch (error) {
            console.error('Erreur lors de la restauration:', error)
            toast.error('Erreur lors de la restauration')
            throw error
          }
        }
      })

      // Supprimer définitivement
      actions.push({
        id: 'permanent-delete',
        label: 'Supprimer définitivement',
        icon: <XCircle className="h-4 w-4" />,
        variant: 'destructive' as const,
        requiresConfirmation: true,
        confirmationMessage: 'ATTENTION : Cette action est IRRÉVERSIBLE. Supprimer définitivement toutes les inscriptions sélectionnées ?',
        actionType: 'delete' as const,
        onClick: async (selectedIds: Set<string>) => {
          try {
            await Promise.all(
              Array.from(selectedIds).map((id) =>
                permanentDeleteRegistration({ id, eventId }).unwrap()
              )
            )
            toast.success(`${selectedIds.size} inscription(s) supprimée(s) définitivement`)
          } catch (error) {
            console.error('Erreur lors de la suppression définitive:', error)
            toast.error('Erreur lors de la suppression définitive')
            throw error
          }
        }
      })
    }

    return actions
  }, [isDeletedTab, bulkExportRegistrations, bulkUpdateStatus, deleteRegistration, restoreRegistration, permanentDeleteRegistration, eventId, toast])

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <FilterBar
        resultCount={filteredRegistrations.length}
        resultLabel="inscription"
        onReset={() => {
          setSearchQuery('')
          setFilterValues({})
        }}
        showResetButton={searchQuery !== '' || Object.keys(filterValues).length > 0}
        {...(onRefresh && { onRefresh })}
        showRefreshButton={!!onRefresh}
      >
        <SearchInput
          placeholder="Rechercher par nom, prénom ou email..."
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <FilterButton
          filters={filterConfig}
          values={filterValues}
          onChange={setFilterValues}
        />

        {onExport && (
          <Button
            variant="outline"
            onClick={onExport}
            className="h-10 flex-shrink-0"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Exporter
          </Button>
        )}
      </FilterBar>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.total ?? meta?.total ?? registrations.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            En attente
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats?.statusCounts.awaiting ?? meta?.statusCounts.awaiting ??
              registrations.filter((r) => r.status === 'awaiting').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Approuvés
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats?.statusCounts.approved ?? meta?.statusCounts.approved ??
              registrations.filter((r) => r.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Refusés
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats?.statusCounts.refused ?? meta?.statusCounts.refused ??
              registrations.filter((r) => r.status === 'refused').length}
          </div>
        </div>
      </div>

      {/* DataTable */}
      <Card variant="default" padding="none" className="min-w-full">
        <DataTable
          key={isDeletedTab ? 'deleted' : 'active'}
          columns={columns}
          data={filteredRegistrations}
          isLoading={isLoading}
          enableRowSelection
          bulkActions={bulkActions}
          getItemId={(registration) => registration.id}
          itemType="inscriptions"
          tabsElement={tabsElement}
          onRowSelectionChange={() => {
            // TanStack Table handles selection
          }}
          emptyMessage={
            isDeletedTab
              ? 'Aucune inscription supprimée'
              : 'Aucune inscription trouvée'
          }
          // Server-side pagination
          enablePagination={true}
          pageSize={pageSize || 50}
          currentPage={currentPage || 1}
          totalItems={meta?.total || 0}
          onPageChange={onPageChange || (() => {})}
          onPageSizeChange={onPageSizeChange || (() => {})}
          initialColumnVisibility={initialColumnVisibility}
        />
      </Card>

      {/* Modals */}
      {editingRegistration && (
        <EditRegistrationModal
          isOpen={!!editingRegistration}
          onClose={() => setEditingRegistration(null)}
          registration={editingRegistration}
          onSave={handleUpdate}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deletingRegistration}
        onClose={() => setDeletingRegistration(null)}
        onConfirm={handleDelete}
        attendeeName={deletingRegistration ? getRegistrationFullName(deletingRegistration) : ''}
      />

      <ApprovalConfirmationModal
        isOpen={!!approvingRegistration}
        onClose={() => setApprovingRegistration(null)}
        registrationName={approvingRegistration ? getRegistrationFullName(approvingRegistration) : ''}
        onApprove={handleApproveWithEmail}
        isApproving={isApproving}
      />

      <RejectionConfirmationModal
        isOpen={!!rejectingRegistration}
        onClose={() => setRejectingRegistration(null)}
        registrationName={rejectingRegistration ? getRegistrationFullName(rejectingRegistration) : ''}
        onReject={handleRejectWithEmail}
        isRejecting={isRejecting}
      />

      <RestoreRegistrationModal
        isOpen={!!restoringRegistration}
        onClose={() => setRestoringRegistration(null)}
        registration={restoringRegistration}
        onRestore={handleRestore}
      />

      <PermanentDeleteRegistrationModal
        isOpen={!!permanentDeletingRegistration}
        onClose={() => setPermanentDeletingRegistration(null)}
        registration={permanentDeletingRegistration}
        onPermanentDelete={handlePermanentDelete}
      />

      {qrCodeRegistration && (
        <QrCodeModal
          isOpen={!!qrCodeRegistration}
          onClose={() => setQrCodeRegistration(null)}
          registration={qrCodeRegistration}
        />
      )}

      {badgeDownloadRegistration && (
        <BadgePreviewModal
          isOpen={!!badgeDownloadRegistration}
          onClose={() => setBadgeDownloadRegistration(null)}
          registration={badgeDownloadRegistration}
          eventId={eventId}
          currentBadgeTemplateId={eventBadgeTemplateId ?? null}
        />
      )}

      <BulkStatusChangeModal
        isOpen={bulkStatusModalOpen}
        onClose={() => {
          setBulkStatusModalOpen(false)
          setBulkStatusSelectedIds(new Set())
        }}
        onConfirm={handleBulkStatusChange}
        selectedCount={bulkStatusSelectedIds.size}
      />

      <BulkAttendeeTypeChangeModal
        isOpen={bulkTypeModalOpen}
        onClose={() => {
          setBulkTypeModalOpen(false)
          setBulkTypeSelectedIds(new Set())
        }}
        onConfirm={handleBulkAttendeeTypeChange}
        selectedCount={bulkTypeSelectedIds.size}
        attendeeTypes={eventAttendeeTypes || []}
      />
    </div>
  )
}
