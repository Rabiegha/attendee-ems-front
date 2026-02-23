import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import {
  Download,
  CheckCircle,
  Trash2,
  XCircle,
  Clock,
  Ban,
  Mail,
  Phone,
  Building2,
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
import { selectToken, selectUserId } from '@/features/auth/model/sessionSlice'
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
  useGenerateBadgeMutation,
} from '../api/registrationsApi'
import { EventAttendeeType } from '@/features/events/api/eventsApi'
import { useToast } from '@/shared/hooks/useToast'
import { useAddPrintJobMutation } from '@/features/print-queue/api/printQueueApi'
import { EditRegistrationModal } from './EditRegistrationModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { RestoreRegistrationModal } from './RestoreRegistrationModal'
import { PermanentDeleteRegistrationModal } from './PermanentDeleteRegistrationModal'
import { QrCodeModal } from './QrCodeModal'
import { BadgePreviewModal } from './BadgePreviewModal'
import { BulkStatusChangeModal } from './BulkStatusChangeModal'
import { BulkStatusConfirmationModal } from './BulkStatusConfirmationModal'
import { BulkAttendeeTypeChangeModal } from './BulkAttendeeTypeChangeModal'
import { BulkActionsModal } from './BulkActionsModal'
import { BulkConfirmationModal } from './BulkConfirmationModal'
import { ApprovalConfirmationModal } from './ApprovalConfirmationModal'
import { RejectionConfirmationModal } from './RejectionConfirmationModal'
import {
  getRegistrationFullName,
  getRegistrationEmail,
  getRegistrationPhone,
  getRegistrationCompany,
} from '../utils/registration-helpers'
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
  // Server-side search
  onSearchChange?: (search: string) => void
  eventAttendeeTypes?: EventAttendeeType[] | undefined
  isLoadingAttendeeTypes?: boolean
  formFields?: FormField[]
}

const STATUS_CONFIG_STATIC = {
  awaiting: {
    icon: Clock,
    color:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  },
  approved: {
    icon: CheckCircle,
    color:
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  },
  refused: {
    icon: XCircle,
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  },
  cancelled: {
    icon: Ban,
    color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  },
}

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
  onSearchChange,
  eventAttendeeTypes,
  isLoadingAttendeeTypes = false,
  formFields = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [bulkActionsModalOpen, setBulkActionsModalOpen] = useState(false)
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set())
  const { t, i18n } = useTranslation(['events', 'common'])
  const colHeader = (label: string) => () => <span title={label}>{label}</span>

  const STATUS_CONFIG = useMemo(() => ({
    awaiting: { ...STATUS_CONFIG_STATIC.awaiting, label: t('events:registrations.status_awaiting') },
    approved: { ...STATUS_CONFIG_STATIC.approved, label: t('events:registrations.status_approved') },
    refused: { ...STATUS_CONFIG_STATIC.refused, label: t('events:registrations.status_refused') },
    cancelled: { ...STATUS_CONFIG_STATIC.cancelled, label: t('events:registrations.status_cancelled') },
  }), [t])

  const STATUS_OPTIONS: TableSelectorOption<string>[] = useMemo(() => [
    { value: 'awaiting', label: t('events:registrations.status_awaiting'), icon: Clock, color: 'yellow', description: t('events:registrations.status_awaiting_desc') },
    { value: 'approved', label: t('events:registrations.status_approved'), icon: CheckCircle, color: 'green', description: t('events:registrations.status_approved_desc') },
    { value: 'refused', label: t('events:registrations.status_refused'), icon: XCircle, color: 'red', description: t('events:registrations.status_refused_desc') },
    { value: 'cancelled', label: t('events:registrations.status_cancelled'), icon: Ban, color: 'gray', description: t('events:registrations.status_cancelled_desc') },
  ], [t])
  const [tableResetCounter, setTableResetCounter] = useState(0)
  const tableRef = useRef<any>(null)
  
  // États pour les différentes confirmations bulk
  const [bulkConfirmation, setBulkConfirmation] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'default' | 'danger' | 'warning' | 'success'
    action: () => Promise<void>
  } | null>(null)
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false)
  const [bulkStatusSelectedIds, setBulkStatusSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatusConfirmationModalOpen, setBulkStatusConfirmationModalOpen] = useState(false)
  const [bulkStatusToConfirm, setBulkStatusToConfirm] = useState<'approved' | 'refused' | null>(null)
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
  const userId = useSelector(selectUserId)
  const [addPrintJob] = useAddPrintJobMutation()

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
        toast.error(t('events:registrations.must_be_connected'))
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
      toast.error(t('events:registrations.badge_download_error', { format }))
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

  // Fonction d'impression de badge (via Electron print queue)
  const [generateBadge] = useGenerateBadgeMutation()
  
  const handlePrintBadge = async (registration: RegistrationDPO) => {
    const printKey = registration.id
    setPrintingKeys(prev => new Set(prev).add(printKey))

    try {
      if (!userId) {
        toast.error(t('events:registrations.user_not_connected'))
        return
      }

      // Récupérer ou générer l'URL du badge
      let badgePdfUrl = registration.badgePdfUrl || registration.badgeImageUrl
      
      if (!badgePdfUrl) {
        try {
          toast.info(t('events:registrations.badge_generating'))
          const result = await generateBadge({
            registrationId: registration.id,
            eventId
          }).unwrap()
          
          // Le endpoint generate-badge retourne l'objet Badge crée
          // On construit l'URL manuellement car le refresh peut prendre du temps
          if (result && result.id) {
            badgePdfUrl = `/api/badges/${result.id}/pdf`
          } else {
             throw new Error(t('events:registrations.badge_id_missing'))
          }
        } catch (genError) {
          console.error("Erreur génération badge:", genError)
          toast.error(t('events:registrations.badge_generate_error'))
          return
        }
      }
      
      if (!badgePdfUrl) {
         toast.error(t('events:registrations.badge_url_error'))
         return
      }

      const attendeeName = registration.attendee 
        ? `${registration.attendee.firstName} ${registration.attendee.lastName}`
        : t('events:registrations.participant_fallback')

      await addPrintJob({
        registrationId: registration.id,
        eventId,
        userId,
        badgeUrl: badgePdfUrl,
      }).unwrap()

      toast.success(t('events:registrations.badge_added_to_queue', { name: attendeeName }))
    } catch (error) {
      console.error('Error printing badge:', error)
      toast.error(t('events:registrations.badge_print_error'))
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
      label: t('events:registrations.filter_status'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: t('events:registrations.filter_all_statuses') },
        { value: 'awaiting', label: t('events:registrations.filter_awaiting') },
        { value: 'approved', label: t('events:registrations.filter_approved') },
        { value: 'refused', label: t('events:registrations.filter_refused') },
        { value: 'cancelled', label: t('events:registrations.filter_cancelled') },
      ],
    },
    attendeeType: {
      label: t('events:registrations.filter_attendee_type'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: t('events:registrations.filter_all_types') },
        { value: 'none', label: t('events:registrations.filter_none') },
        ...(eventAttendeeTypes?.filter(type => type.is_active && type.attendeeType.is_active).map(type => ({
          value: type.attendee_type_id,
          label: type.attendeeType.name
        })) || [])
      ],
    },
    checkin: {
      label: t('events:registrations.filter_checkin'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: t('events:registrations.filter_all_checkins') },
        { value: 'checked', label: t('events:registrations.filter_checked') },
        { value: 'not_checked', label: t('events:registrations.filter_not_checked') },
      ],
    },
  }

  // Options pour le sélecteur de type dans le tableau
  const attendeeTypeOptions: TableSelectorOption<string>[] = useMemo(() => {
    if (!eventAttendeeTypes) return [{ value: 'none', label: t('events:registrations.filter_none'), color: 'gray' as const }]
    
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
      { value: 'none', label: t('events:registrations.filter_none'), color: 'gray' as const },
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
        t('events:registrations.status_updated'),
        t('events:registrations.status_updated_desc', { status: STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG].label.toLowerCase() })
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

      let title = t('events:registrations.error_title')
      let message = t('events:registrations.cannot_update_status')

      if (error?.status === 409) {
        title = t('events:registrations.capacity_reached')
        message = t('events:registrations.event_full_cannot_approve')
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
      toast.success(t('events:registrations.type_updated'), t('events:registrations.type_updated_desc'))
      // Le nettoyage se fera automatiquement quand le serveur renverra la bonne valeur
    } catch (error: any) {
      console.error('Error updating type:', error)
      // Erreur: restaurer l'ancienne valeur
      setOptimisticTypeUpdates(prev => {
        const next = new Map(prev)
        next.delete(registrationId)
        return next
      })
      toast.error(t('events:registrations.error_title'), t('events:registrations.cannot_update_type'))
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
        ? t('events:registrations.approved_with_email')
        : t('events:registrations.approved_without_email')
      
      toast.success(t('events:registrations.approved_toast_title'), message)
      setApprovingRegistration(null)
    } catch (error: any) {
      console.error('Error approving with email:', error)
      
      let title = t('events:registrations.error_title')
      let message = t('events:registrations.cannot_approve')

      if (error?.status === 409) {
        title = t('events:registrations.capacity_reached')
        message = t('events:registrations.event_full_cannot_approve')
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
        ? t('events:registrations.refused_with_email')
        : t('events:registrations.refused_without_email')
      
      toast.success(t('events:registrations.refused_toast_title'), message)
      setRejectingRegistration(null)
    } catch (error: any) {
      console.error('Error rejecting with email:', error)
      
      let title = t('events:registrations.error_title')
      let message = t('events:registrations.cannot_refuse')

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
        t('events:registrations.checkin_done'),
        t('events:registrations.checkin_done_desc')
      )
    } catch (error: any) {
      console.error('Error checking in:', error)
      const errorMessage = error?.data?.message || t('events:registrations.checkin_error')
      toast.error(t('events:registrations.error_title'), errorMessage)
    }
  }

  const handleUndoCheckIn = async (registration: RegistrationDPO) => {
    try {
      await undoCheckIn({
        id: registration.id,
        eventId,
      }).unwrap()
      toast.success(
        t('events:registrations.checkin_cancelled'),
        t('events:registrations.checkin_cancelled_desc')
      )
    } catch (error: any) {
      console.error('Error undoing check-in:', error)
      const errorMessage = error?.data?.message || t('events:registrations.checkin_cancel_error')
      toast.error(t('events:registrations.error_title'), errorMessage)
    }
  }

  const handleCheckOut = async (registration: RegistrationDPO) => {
    try {
      await checkOut({
        id: registration.id,
        eventId,
      }).unwrap()
      toast.success(
        t('events:registrations.checkout_done'),
        t('events:registrations.checkout_done_desc')
      )
    } catch (error: any) {
      console.error('Error checking out:', error)
      const errorMessage = error?.data?.message || t('events:registrations.checkout_error')
      toast.error(t('events:registrations.error_title'), errorMessage)
    }
  }

  const handleUndoCheckOut = async (registration: RegistrationDPO) => {
    try {
      await undoCheckOut({
        id: registration.id,
        eventId,
      }).unwrap()
      toast.success(
        t('events:registrations.checkout_cancelled'),
        t('events:registrations.checkout_cancelled_desc')
      )
    } catch (error: any) {
      console.error('Error undoing check-out:', error)
      const errorMessage = error?.data?.message || t('events:registrations.checkout_cancel_error')
      toast.error(t('events:registrations.error_title'), errorMessage)
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
        t('events:registrations.updated_title'),
        t('events:registrations.updated_desc')
      )
      setEditingRegistration(null)
    } catch (error) {
      console.error('Error updating registration:', error)
      toast.error(t('events:registrations.error_title'), t('events:registrations.cannot_update'))
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
        t('events:registrations.deleted_title'),
        t('events:registrations.deleted_desc')
      )
      setDeletingRegistration(null)
    } catch (error) {
      console.error('Error deleting registration:', error)
      toast.error(t('events:registrations.error_title'), t('events:registrations.cannot_delete'))
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
        t('events:registrations.restored_title'),
        t('events:registrations.restored_desc')
      )
      setRestoringRegistration(null)
    } catch (error: any) {
      console.error('Error restoring registration:', error)
      
      let title = t('events:registrations.error_title')
      let message = t('events:registrations.cannot_restore')

      if (error?.status === 409) {
        title = t('events:registrations.capacity_reached')
        message = t('events:registrations.event_full_cannot_restore')
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
        t('events:registrations.permanently_deleted_title'),
        t('events:registrations.permanently_deleted_desc')
      )
      setPermanentDeletingRegistration(null)
    } catch (error) {
      console.error('Error permanently deleting registration:', error)
      toast.error(t('events:registrations.error_title'), t('events:registrations.cannot_permanently_delete'))
    }
  }

  const handleBulkStatusSelect = (status: string) => {
    // Si c'est approved ou refused, ouvrir le modal de confirmation
    if (status === 'approved' || status === 'refused') {
      setBulkStatusToConfirm(status)
      setBulkStatusConfirmationModalOpen(true)
      // Fermer le premier modal maintenant que le second s'ouvre
      setBulkStatusModalOpen(false)
    } else {
      // Pour les autres statuts (awaiting, cancelled), appliquer directement sans email
      handleBulkStatusChange(status, false)
    }
  }

  const handleBulkStatusChange = async (status: string, sendEmail: boolean) => {
    try {
      const result = await bulkUpdateStatus({
        ids: Array.from(bulkStatusSelectedIds),
        status,
        sendEmail,
      }).unwrap()
      
      const statusLabel = STATUS_OPTIONS.find(o => o.value === status)?.label || status
      
      let message = t('events:registrations.bulk_status_message', { count: bulkStatusSelectedIds.size, status: statusLabel })
      if (sendEmail && result.emailsSent !== undefined) {
        message += ` ${t('events:registrations.bulk_status_emails_sent', { count: result.emailsSent })}`
      }
      
      toast.success(message)
      
      // Réinitialiser
      setBulkStatusModalOpen(false)
      setBulkStatusConfirmationModalOpen(false)
      setBulkStatusToConfirm(null)
      setBulkStatusSelectedIds(new Set())
    } catch (error: any) {
      console.error('Erreur lors du changement de statut:', error)
      
      let title = t('events:registrations.error')
      let message = t('events:registrations.bulk_status_error')

      if (error?.status === 409) {
        title = t('events:registrations.capacity_reached')
        message = t('events:registrations.event_full_cannot_approve_plural')
      } else if (error?.data?.message) {
        message = error.data.message
      }

      toast.error(title, message)
      throw error
    }
  }

  // Fonction pour désélectionner tous les éléments
  const clearBulkSelection = useCallback(() => {
    setBulkSelectedIds(new Set())
    setTableResetCounter(prev => prev + 1) // Forcer le re-render du DataTable
  }, [])

  // Handlers pour le modal d'actions groupées
  const handleBulkExport = async () => {
    try {
      const response = await bulkExportRegistrations({
        ids: Array.from(bulkSelectedIds),
        format: 'excel',
        lang: i18n.language,
      }).unwrap()

      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = response.downloadUrl
      a.download = response.filename || 'inscriptions.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      toast.success(t('events:registrations.bulk_exported', { count: bulkSelectedIds.size }))
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      toast.error(t('events:registrations.bulk_export_error'))
    }
  }

  const handleBulkCheckIn = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('events:registrations.confirm_checkin_title'),
      message: t('events:registrations.confirm_checkin_message', { count: bulkSelectedIds.size }),
      variant: 'success',
      action: async () => {
        try {
          const result = await bulkCheckIn({
            ids: Array.from(bulkSelectedIds),
          }).unwrap()
          toast.success(t('events:registrations.bulk_checkins_done', { count: result.checkedInCount }))
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors du check-in:', error)
          toast.error(t('events:registrations.bulk_checkin_error'))
        }
      }
    })
  }

  const handleBulkUndoCheckIn = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('events:registrations.cancel_checkins_title'),
      message: t('events:registrations.cancel_checkins_message', { count: bulkSelectedIds.size }),
      variant: 'warning',
      action: async () => {
        try {
          await Promise.all(
            Array.from(bulkSelectedIds).map((id) =>
              undoCheckIn({ id, eventId }).unwrap()
            )
          )
          toast.success(t('events:registrations.bulk_checkins_cancelled', { count: bulkSelectedIds.size }))
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors de l\'annulation du check-in:', error)
          toast.error(t('events:registrations.bulk_undo_checkin_error'))
        }
      }
    })
  }

  const handleBulkCheckOut = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('events:registrations.confirm_checkout_title'),
      message: t('events:registrations.confirm_checkout_message', { count: bulkSelectedIds.size }),
      variant: 'success',
      action: async () => {
        try {
          await Promise.all(
            Array.from(bulkSelectedIds).map((id) =>
              checkOut({ id, eventId }).unwrap()
            )
          )
          toast.success(t('events:registrations.bulk_checkouts_done', { count: bulkSelectedIds.size }))
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors du check-out:', error)
          toast.error(t('events:registrations.bulk_checkout_error'))
        }
      }
    })
  }

  const handleBulkUndoCheckOut = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('events:registrations.cancel_checkouts_title'),
      message: t('events:registrations.cancel_checkouts_message', { count: bulkSelectedIds.size }),
      variant: 'warning',
      action: async () => {
        try {
          await Promise.all(
            Array.from(bulkSelectedIds).map((id) =>
              undoCheckOut({ id, eventId }).unwrap()
            )
          )
          toast.success(t('events:registrations.bulk_checkouts_cancelled', { count: bulkSelectedIds.size }))
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors de l\'annulation du check-out:', error)
          toast.error(t('events:registrations.bulk_undo_checkout_error'))
        }
      }
    })
  }

  const handleBulkDelete = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('events:registrations.bulk_delete_title'),
      message: t('events:registrations.bulk_delete_message', { count: bulkSelectedIds.size }),
      variant: 'warning',
      action: async () => {
        try {
          await Promise.all(
            Array.from(bulkSelectedIds).map((id) =>
              deleteRegistration({ id, eventId }).unwrap()
            )
          )
          toast.success(t('events:registrations.bulk_deleted', { count: bulkSelectedIds.size }))
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          toast.error(t('events:registrations.bulk_delete_error'))
        }
      }
    })
  }

  const handleBulkRestore = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('events:registrations.bulk_restore_title'),
      message: t('events:registrations.bulk_restore_message', { count: bulkSelectedIds.size }),
      variant: 'success',
      action: async () => {
        try {
          await Promise.all(
            Array.from(bulkSelectedIds).map((id) =>
              restoreRegistration({ id, eventId }).unwrap()
            )
          )
          toast.success(t('events:registrations.bulk_restored', { count: bulkSelectedIds.size }))
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors de la restauration:', error)
          toast.error(t('events:registrations.bulk_restore_error'))
        }
      }
    })
  }

  const handleBulkPermanentDelete = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('events:registrations.bulk_permanent_delete_title'),
      message: t('events:registrations.bulk_permanent_delete_message', { count: bulkSelectedIds.size }),
      variant: 'danger',
      action: async () => {
        try {
          await Promise.all(
            Array.from(bulkSelectedIds).map((id) =>
              permanentDeleteRegistration({ id, eventId }).unwrap()
            )
          )
          toast.success(t('events:registrations.bulk_permanently_deleted', { count: bulkSelectedIds.size }))
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors de la suppression définitive:', error)
          toast.error(t('events:registrations.bulk_permanent_delete_error'))
        }
      }
    })
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
      
      toast.success(t('events:registrations.bulk_updated', { count: bulkTypeSelectedIds.size }))
      
      // Réinitialiser
      setBulkTypeModalOpen(false)
      setBulkTypeSelectedIds(new Set())
    } catch (error) {
      console.error('Erreur lors du changement de type:', error)
      toast.error(t('events:registrations.error'), t('events:registrations.bulk_type_error'))
      throw error
    }
  }

  // Extraction des valeurs de filtres
  const statusFilter = (filterValues.status as string) || 'all'
  const checkinFilter = (filterValues.checkin as string) || 'all'
  const attendeeTypeFilter = (filterValues.attendeeType as string) || 'all'

  // Tracker la dernière valeur de recherche envoyée pour éviter les appels inutiles
  const lastSearchRef = useRef<string>('')

  // Envoyer la recherche au backend via debounce
  useEffect(() => {
    if (!onSearchChange) return
    
    const timer = setTimeout(() => {
      // Ne pas appeler si la valeur n'a pas changé
      if (searchQuery !== lastSearchRef.current) {
        lastSearchRef.current = searchQuery
        onSearchChange(searchQuery)
      }
    }, 500) // Debounce de 500ms
    return () => clearTimeout(timer)
  }, [searchQuery, onSearchChange])

  // Filtrage côté client (uniquement pour les filtres non gérés par le backend)
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
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
  }, [registrations, statusFilter, checkinFilter, attendeeTypeFilter])

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
        : field?.label || fieldId
      
      return {
        id: `custom_${fieldId}`,
        header: () => <span title={storedLabel}>{storedLabel}</span>,
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
        header: colHeader(t('events:registrations.header_participant')),
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
        header: colHeader(t('events:registrations.header_contact')),
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
        header: colHeader(t('events:registrations.header_type')),
        accessorFn: (row) => row.eventAttendeeType?.attendeeType?.name || t('events:registrations.none'),
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
                description: t('events:registrations.type_disabled')
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
        header: colHeader(t('events:registrations.header_status')),
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
              loadingText={t('events:registrations.updating')}
            />
          )
        },
      },
      {
        id: 'checkin',
        header: colHeader(t('events:registrations.header_checkin')),
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
                  title={t('events:registrations.cancel_checkin_tooltip')}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {t('events:registrations.not_yet')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCheckIn(row.original)}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 p-1.5 h-auto"
                  title={t('events:registrations.do_checkin_tooltip')}
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
        header: colHeader(t('events:registrations.header_checkout')),
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
                  title={t('events:registrations.cancel_checkout_tooltip')}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : row.original.checkedInAt ? (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {t('events:registrations.not_yet')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCheckOut(row.original)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 h-auto"
                  title={t('events:registrations.do_checkout_tooltip')}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  {t('events:registrations.not_available')}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'date',
        header: colHeader(t('events:registrations.header_registration_date')),
        accessorKey: 'invitedAt',
        cell: ({ row }) => (
          <div className="cursor-pointer text-sm text-gray-500 dark:text-gray-400" onClick={() => handleRowClick(row.original)}>
            {formatDateTime(row.original.invitedAt || row.original.createdAt)}
          </div>
        ),
      },
      {
        id: 'qrcode',
        header: colHeader(t('events:registrations.header_qrcode')),
        cell: ({ row }) => (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setQrCodeRegistration(row.original)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title={t('events:registrations.see_qrcode_tooltip')}
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: 'badge',
        header: colHeader(t('events:registrations.header_badge')),
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setBadgeDownloadRegistration(row.original)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              title={t('events:registrations.see_badge_tooltip')}
            >
              <Award className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePrintBadge(row.original)}
              disabled={printingKeys.has(row.original.id)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('events:registrations.print_badge_tooltip')}
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
              title={t('events:registrations.download_pdf_tooltip')}
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
              title={t('events:registrations.download_image_tooltip')}
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
        header: colHeader(t('events:registrations.header_actions')),
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
                title={t('events:registrations.restore_tooltip')}
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPermanentDeletingRegistration(row.original)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[32px] p-1.5"
                title={t('events:registrations.permanent_delete_tooltip')}
              >
                <Trash2 className="h-4 w-4 shrink-0" />
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
                    title={t('events:registrations.approve_tooltip')}
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRejectingRegistration(row.original)}
                    disabled={isUpdating}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[32px] p-1.5"
                    title={t('events:registrations.refuse_tooltip')}
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
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
    [isUpdating, isDeletedTab, optimisticStatusUpdates, updateStatus, quickDownloadingKeys, customColumns, t, STATUS_CONFIG, STATUS_OPTIONS]
  )

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <FilterBar
        resultCount={meta?.total || 0}
        resultLabel={t('events:registrations.registration_label')}
        onReset={() => {
          setSearchQuery('')
          setFilterValues({})
        }}
        showResetButton={searchQuery !== '' || Object.keys(filterValues).length > 0}
        {...(onRefresh && { onRefresh })}
        showRefreshButton={!!onRefresh}
      >
        <SearchInput
          placeholder={t('events:registrations.search_placeholder_full')}
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
            {t('events:registrations.export_button')}
          </Button>
        )}
      </FilterBar>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">{t('events:registrations.stat_total')}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.total ?? meta?.total ?? registrations.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {t('events:registrations.stat_awaiting')}
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats?.statusCounts.awaiting ?? meta?.statusCounts.awaiting ??
              registrations.filter((r) => r.status === 'awaiting').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {t('events:registrations.stat_approved')}
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats?.statusCounts.approved ?? meta?.statusCounts.approved ??
              registrations.filter((r) => r.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {t('events:registrations.stat_refused')}
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats?.statusCounts.refused ?? meta?.statusCounts.refused ??
              registrations.filter((r) => r.status === 'refused').length}
          </div>
        </div>
      </div>

      {/* DataTable */}
      <Card variant="default" padding="none" className="min-w-full">
        {/* Barre d'actions groupées personnalisée */}
        {bulkSelectedIds.size > 0 && (
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {t('events:registrations.selected_count', { count: bulkSelectedIds.size })}
                </span>
                <button
                  onClick={clearBulkSelection}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                >
                  {t('events:registrations.deselect_all')}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setBulkActionsModalOpen(true)}
                  leftIcon={<Users className="h-4 w-4" />}
                >
                  Actions
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <DataTable
          key={`${isDeletedTab ? 'deleted' : 'active'}-${tableResetCounter}`}
          columns={columns}
          data={filteredRegistrations}
          isLoading={isLoading}
          enableRowSelection
          bulkActions={[]} // Désactiver les actions par défaut
          getItemId={(registration) => registration.id}
          itemType={t('events:registrations.registration_label')}
          tabsElement={tabsElement}
          onRowSelectionChange={(selectedRows) => {
            const ids = new Set(selectedRows.map((row) => row.id))
            setBulkSelectedIds(ids)
          }}
          emptyMessage={
            isDeletedTab
              ? t('events:registrations.no_deleted_registrations')
              : t('events:registrations.no_registrations_found')
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

      {/* Modal d'actions groupées */}
      <BulkActionsModal
        isOpen={bulkActionsModalOpen}
        onClose={() => setBulkActionsModalOpen(false)}
        selectedCount={bulkSelectedIds.size}
        isDeletedTab={isDeletedTab}
        onExport={handleBulkExport}
        onChangeStatus={() => {
          setBulkStatusSelectedIds(bulkSelectedIds)
          setBulkStatusModalOpen(true)
        }}
        onChangeType={() => {
          setBulkTypeSelectedIds(bulkSelectedIds)
          setBulkTypeModalOpen(true)
        }}
        onCheckIn={handleBulkCheckIn}
        onUndoCheckIn={handleBulkUndoCheckIn}
        onCheckOut={handleBulkCheckOut}
        onUndoCheckOut={handleBulkUndoCheckOut}
        onDelete={handleBulkDelete}
        onRestore={handleBulkRestore}
        onPermanentDelete={handleBulkPermanentDelete}
      />

      <BulkStatusChangeModal
        isOpen={bulkStatusModalOpen}
        onClose={() => {
          setBulkStatusModalOpen(false)
          setBulkStatusSelectedIds(new Set())
        }}
        onBack={() => {
          // Retourner au modal d'actions groupées
          setBulkStatusModalOpen(false)
          setBulkActionsModalOpen(true)
        }}
        onConfirm={handleBulkStatusSelect}
        selectedCount={bulkStatusSelectedIds.size}
      />

      {bulkStatusToConfirm && (
        <BulkStatusConfirmationModal
          isOpen={bulkStatusConfirmationModalOpen}
          onClose={() => {
            setBulkStatusConfirmationModalOpen(false)
            setBulkStatusToConfirm(null)
            // Aussi fermer le premier modal
            setBulkStatusModalOpen(false)
            setBulkStatusSelectedIds(new Set())
          }}
          onBack={() => {
            // Retourner au modal de sélection du statut
            setBulkStatusConfirmationModalOpen(false)
            setBulkStatusToConfirm(null)
            setBulkStatusModalOpen(true)
          }}
          status={bulkStatusToConfirm}
          selectedCount={bulkStatusSelectedIds.size}
          onConfirm={(sendEmail) => handleBulkStatusChange(bulkStatusToConfirm, sendEmail)}
        />
      )}

      <BulkAttendeeTypeChangeModal
        isOpen={bulkTypeModalOpen}
        onClose={() => {
          setBulkTypeModalOpen(false)
          setBulkTypeSelectedIds(new Set())
        }}
        onBack={() => {
          // Retourner au modal d'actions groupées
          setBulkTypeModalOpen(false)
          setBulkActionsModalOpen(true)
        }}
        onConfirm={handleBulkAttendeeTypeChange}
        selectedCount={bulkTypeSelectedIds.size}
        attendeeTypes={eventAttendeeTypes || []}
      />

      {/* Modal de confirmation générique pour les actions bulk */}
      {bulkConfirmation && (
        <BulkConfirmationModal
          isOpen={bulkConfirmation.isOpen}
          onClose={() => setBulkConfirmation(null)}
          onBack={() => {
            setBulkConfirmation(null)
            setBulkActionsModalOpen(true)
          }}
          onConfirm={async () => {
            await bulkConfirmation.action()
            setBulkConfirmation(null)
          }}
          title={bulkConfirmation.title}
          message={bulkConfirmation.message}
          variant={bulkConfirmation.variant}
        />
      )}
    </div>
  )
}
