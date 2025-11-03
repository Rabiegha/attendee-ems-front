import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Mail,
  Phone,
  Building2,
  RefreshCw,
  CreditCard,
  QrCode,
} from 'lucide-react'
import type { RegistrationDPO } from '../dpo/registration.dpo'
import { Button } from '@/shared/ui/Button'
import { ActionButtons } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib/utils'
import {
  useUpdateRegistrationStatusMutation,
  useUpdateRegistrationMutation,
  useDeleteRegistrationMutation,
  useBulkDeleteRegistrationsMutation,
  useBulkExportRegistrationsMutation,
  useGenerateBadgesBulkMutation,
} from '../api/registrationsApi'
import { useToast } from '@/shared/hooks/useToast'
import { EditRegistrationModal } from './EditRegistrationModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { QrCodeModal } from './QrCodeModal'
import { useMultiSelect } from '@/shared/hooks/useMultiSelect'
import { BulkActions, createBulkActions } from '@/shared/ui/BulkActions'
import {
  getRegistrationFullName,
  getRegistrationEmail,
  getRegistrationPhone,
  getRegistrationCompany,
} from '../utils/registration-helpers'

interface RegistrationsTableProps {
  registrations: RegistrationDPO[]
  isLoading: boolean
  eventId: string
  onExport?: () => void
  onRefresh?: () => void
  meta?: {
    total: number
    statusCounts: {
      awaiting: number
      approved: number
      refused: number
    }
  }
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

export const RegistrationsTable: React.FC<RegistrationsTableProps> = ({
  registrations,
  isLoading,
  eventId,
  onExport,
  onRefresh,
  meta,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [checkinFilter, setCheckinFilter] = useState<string>('all') // 'all' | 'checked' | 'not_checked'
  const [editingRegistration, setEditingRegistration] =
    useState<RegistrationDPO | null>(null)
  const [deletingRegistration, setDeletingRegistration] =
    useState<RegistrationDPO | null>(null)
  const [qrCodeRegistration, setQrCodeRegistration] =
    useState<RegistrationDPO | null>(null)
  const toast = useToast()
  const navigate = useNavigate()

  const [updateStatus] = useUpdateRegistrationStatusMutation()
  const [updateRegistration, { isLoading: isUpdating }] =
    useUpdateRegistrationMutation()
  const [deleteRegistration] = useDeleteRegistrationMutation()
  const [bulkDeleteRegistrations] = useBulkDeleteRegistrationsMutation()
  const [bulkExportRegistrations] = useBulkExportRegistrationsMutation()
  const [generateBadgesBulk, { isLoading: isGeneratingBadges }] = useGenerateBadgesBulkMutation()

  const handleRowClick = (registration: RegistrationDPO, e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox or action buttons
    if (
      (e.target as HTMLElement).closest('input[type="checkbox"]') ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('select')
    ) {
      return
    }
    // Navigate to attendee detail page
    navigate(`/attendees/${registration.attendeeId}`)
  }

  const handleStatusChange = async (
    registrationId: string,
    newStatus: string
  ) => {
    try {
      await updateStatus({ id: registrationId, status: newStatus }).unwrap()
      toast.success(
        'Statut mis à jour',
        `L'inscription a été ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG].label.toLowerCase()}`
      )
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erreur', 'Impossible de mettre à jour le statut')
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
        "L'inscription a été supprimée avec succès"
      )
      setDeletingRegistration(null)
    } catch (error) {
      console.error('Error deleting registration:', error)
      toast.error('Erreur', "Impossible de supprimer l'inscription")
    }
  }

  // Filtrage
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      !searchQuery ||
      reg.attendee?.firstName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      reg.attendee?.lastName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      reg.attendee?.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter

    const matchesCheckin = 
      checkinFilter === 'all' ||
      (checkinFilter === 'checked' && reg.checkedInAt) ||
      (checkinFilter === 'not_checked' && !reg.checkedInAt)

    return matchesSearch && matchesStatus && matchesCheckin
  })

  // Multi-select functionality
  const {
    selectedIds,
    selectedItems,
    selectedCount,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    unselectAll,
  } = useMultiSelect({
    items: filteredRegistrations,
    getItemId: (registration) => registration.id,
  })

  // Bulk actions
  const bulkActions = useMemo(() => {
    const actions = []

    // Génération de badges pour la sélection
    actions.push({
      id: 'generate-badges',
      label: 'Générer les badges',
      icon: <CreditCard className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: async (selectedIds: Set<string>) => {
        try {
          const result = await generateBadgesBulk({
            eventId,
            registrationIds: Array.from(selectedIds),
          }).unwrap()
          
          toast.success(result.message)
          unselectAll()
          onRefresh?.()
        } catch (error: any) {
          console.error('Erreur lors de la génération des badges:', error)
          toast.error(error.data?.message || 'Erreur lors de la génération des badges')
        }
      },
    })

    // Default export action using API mutation
    actions.push(
      createBulkActions.export(async (selectedIds) => {
        try {
          const response = await bulkExportRegistrations({
            ids: Array.from(selectedIds),
            format: 'excel', // Utiliser Excel au lieu de CSV pour une meilleure compatibilité
          }).unwrap()

          // Download the file using the URL provided by the API
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = response.downloadUrl
          a.download = response.filename || 'inscriptions.xlsx'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)

          unselectAll()
        } catch (error) {
          console.error("Erreur lors de l'export:", error)
          throw error
        }
      })
    )

    // Default delete action using API mutation
    actions.push(
      createBulkActions.delete(async (selectedIds) => {
        try {
          await bulkDeleteRegistrations({
            ids: Array.from(selectedIds),
            eventId,
          }).unwrap()
          unselectAll()
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          throw error
        }
      })
    )

    return actions
  }, [
    bulkDeleteRegistrations, 
    bulkExportRegistrations, 
    generateBadgesBulk,
    isGeneratingBadges,
    unselectAll, 
    eventId,
    toast,
    onRefresh,
  ])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 dark:bg-gray-600 h-16 rounded-lg"
          ></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-colors"
            >
              <option value="all">Tous les statuts</option>
              <option value="awaiting">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="refused">Refusés</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>

          {/* Filtre Check-in */}
          <div className="relative">
            <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <select
              value={checkinFilter}
              onChange={(e) => setCheckinFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-colors"
            >
              <option value="all">Tous les check-ins</option>
              <option value="checked">Enregistrés</option>
              <option value="not_checked">Non enregistrés</option>
            </select>
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              onClick={onRefresh}
              className="flex items-center space-x-2"
              title="Rafraîchir la liste"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Rafraîchir</span>
            </Button>
          )}

          {onExport && (
            <Button
              variant="outline"
              onClick={onExport}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {meta?.total || registrations.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            En attente
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {meta?.statusCounts.awaiting ||
              registrations.filter((r) => r.status === 'awaiting').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Approuvés
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {meta?.statusCounts.approved ||
              registrations.filter((r) => r.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Refusés
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {meta?.statusCounts.refused ||
              registrations.filter((r) => r.status === 'refused').length}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedCount}
        selectedIds={selectedIds}
        selectedItems={selectedItems}
        actions={bulkActions}
        onClearSelection={unselectAll}
        itemType="inscriptions"
      />

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Aucune inscription trouvée
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <label className="flex items-center justify-center cursor-pointer p-2 -m-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate
                        }}
                        onChange={toggleAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRegistrations.map((registration) => {
                  const StatusIcon = STATUS_CONFIG[registration.status].icon

                  return (
                    <tr
                      key={registration.id}
                      onClick={(e) => handleRowClick(registration, e)}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        isSelected(registration.id)
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      }`}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="flex items-center justify-center w-full h-full cursor-pointer p-2 -m-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <input
                            type="checkbox"
                            checked={isSelected(registration.id)}
                            onChange={() => toggleItem(registration.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getRegistrationFullName(registration)}
                          </div>
                          {getRegistrationCompany(registration) && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                              <Building2 className="h-3 w-3 mr-1" />
                              {getRegistrationCompany(registration)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <Mail className="h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
                            {getRegistrationEmail(registration)}
                          </div>
                          {getRegistrationPhone(registration) && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {getRegistrationPhone(registration)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[registration.status].color}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {STATUS_CONFIG[registration.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {registration.checkedInAt ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(registration.checkedInAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              Pas encore
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(registration.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setQrCodeRegistration(registration)
                          }}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Voir QR Code"
                        >
                          <QrCode className="h-5 w-5" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          {registration.status === 'awaiting' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(
                                    registration.id,
                                    'approved'
                                  )
                                }
                                disabled={isUpdating}
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Approuver"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(registration.id, 'refused')
                                }
                                disabled={isUpdating}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Refuser"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <ActionButtons
                            onEdit={() => setEditingRegistration(registration)}
                            onDelete={() => setDeletingRegistration(registration)}
                            size="sm"
                            iconOnly
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Résultat du filtre */}
      {filteredRegistrations.length < registrations.length && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {filteredRegistrations.length} résultat
          {filteredRegistrations.length > 1 ? 's' : ''} sur{' '}
          {registrations.length} inscription
          {registrations.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Modals */}
      {editingRegistration && (
        <EditRegistrationModal
          isOpen={!!editingRegistration}
          onClose={() => setEditingRegistration(null)}
          registration={editingRegistration}
          onSave={handleUpdate}
          isLoading={isUpdating}
        />
      )}

      {deletingRegistration && (
        <DeleteConfirmModal
          isOpen={!!deletingRegistration}
          onClose={() => setDeletingRegistration(null)}
          onConfirm={handleDelete}
          isLoading={isUpdating}
          attendeeName={`${deletingRegistration.attendee?.firstName} ${deletingRegistration.attendee?.lastName}`}
        />
      )}

      {qrCodeRegistration && (
        <QrCodeModal
          isOpen={!!qrCodeRegistration}
          onClose={() => setQrCodeRegistration(null)}
          registration={qrCodeRegistration}
        />
      )}
    </div>
  )
}
