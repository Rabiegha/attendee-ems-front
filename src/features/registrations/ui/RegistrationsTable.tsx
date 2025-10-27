import React, { useState } from 'react'
import { Search, Filter, Download, CheckCircle, XCircle, Clock, Ban, Mail, Phone, Building2, Edit2, Trash2 } from 'lucide-react'
import type { RegistrationDPO } from '../dpo/registration.dpo'
import { Button } from '@/shared/ui/Button'
import { formatDateTime } from '@/shared/lib/utils'
import { useUpdateRegistrationStatusMutation, useUpdateRegistrationMutation, useDeleteRegistrationMutation } from '../api/registrationsApi'
import { useToast } from '@/shared/hooks/useToast'
import { EditRegistrationModal } from './EditRegistrationModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'

interface RegistrationsTableProps {
  registrations: RegistrationDPO[]
  isLoading: boolean
  eventId: string
  onExport?: () => void
}

const STATUS_CONFIG = {
  awaiting: { label: 'En attente', icon: Clock, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' },
  approved: { label: 'Approuvé', icon: CheckCircle, color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' },
  refused: { label: 'Refusé', icon: XCircle, color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' },
  cancelled: { label: 'Annulé', icon: Ban, color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' },
}

export const RegistrationsTable: React.FC<RegistrationsTableProps> = ({ 
  registrations, 
  isLoading,
  eventId,
  onExport 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editingRegistration, setEditingRegistration] = useState<RegistrationDPO | null>(null)
  const [deletingRegistration, setDeletingRegistration] = useState<RegistrationDPO | null>(null)
  const toast = useToast()
  
  const [updateStatus] = useUpdateRegistrationStatusMutation()
  const [updateRegistration, { isLoading: isUpdating }] = useUpdateRegistrationMutation()
  const [deleteRegistration] = useDeleteRegistrationMutation()

  const handleStatusChange = async (registrationId: string, newStatus: string) => {
    try {
      await updateStatus({ id: registrationId, status: newStatus }).unwrap()
      toast.success('Statut mis à jour', `L'inscription a été ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG].label.toLowerCase()}`)
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
        data 
      }).unwrap()
      toast.success('Inscription mise à jour', 'Les informations ont été modifiées avec succès')
      setEditingRegistration(null)
    } catch (error) {
      console.error('Error updating registration:', error)
      toast.error('Erreur', 'Impossible de mettre à jour l\'inscription')
    }
  }

  const handleDelete = async () => {
    if (!deletingRegistration) return
    
    try {
      await deleteRegistration({ 
        id: deletingRegistration.id,
        eventId 
      }).unwrap()
      toast.success('Inscription supprimée', 'L\'inscription a été supprimée avec succès')
      setDeletingRegistration(null)
    } catch (error) {
      console.error('Error deleting registration:', error)
      toast.error('Erreur', 'Impossible de supprimer l\'inscription')
    }
  }

  // Filtrage
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      !searchQuery || 
      reg.attendee?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.attendee?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.attendee?.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-600 h-16 rounded-lg"></div>
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
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{registrations.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">En attente</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {registrations.filter(r => r.status === 'awaiting').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">Approuvés</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {registrations.filter(r => r.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">Refusés</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {registrations.filter(r => r.status === 'refused').length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Aucune inscription trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
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
                    Date d'inscription
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
                    <tr key={registration.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {registration.attendee?.firstName} {registration.attendee?.lastName}
                          </div>
                          {registration.attendee?.company && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                              <Building2 className="h-3 w-3 mr-1" />
                              {registration.attendee.company}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <Mail className="h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
                            {registration.attendee?.email}
                          </div>
                          {registration.attendee?.phone && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {registration.attendee.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[registration.status].color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {STATUS_CONFIG[registration.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(registration.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {registration.status === 'awaiting' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(registration.id, 'approved')}
                                disabled={isUpdating}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 disabled:opacity-50 transition-colors"
                                title="Approuver"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(registration.id, 'refused')}
                                disabled={isUpdating}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 disabled:opacity-50 transition-colors"
                                title="Refuser"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setEditingRegistration(registration)}
                            disabled={isUpdating}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 disabled:opacity-50 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeletingRegistration(registration)}
                            disabled={isUpdating}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 disabled:opacity-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
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
          {filteredRegistrations.length} résultat{filteredRegistrations.length > 1 ? 's' : ''} sur {registrations.length} inscription{registrations.length > 1 ? 's' : ''}
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
    </div>
  )
}
