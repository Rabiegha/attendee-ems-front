import React, { useState, useEffect } from 'react'
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  LockKeyhole,
  Mail,
  Calendar,
  Unlock,
  FileEdit,
} from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { ModalSteps } from '@/shared/ui/ModalSteps'

interface EventActionsModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: string
  currentStartDate?: string
  currentEndDate?: string
  onStatusChange: (
    newStatus: string,
    options?: {
      notifyUsers?: boolean
      newStartDate?: string
      newEndDate?: string
    }
  ) => Promise<void>
}

type ActionType =
  | 'publish'
  | 'unpublish'
  | 'close_registration'
  | 'reopen_registration'
  | 'cancel'
  | 'postpone'
  | 'archive'
  | null

export const EventActionsModal: React.FC<EventActionsModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  currentStartDate,
  currentEndDate,
  onStatusChange,
}) => {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null)
  const [notifyUsers, setNotifyUsers] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Pour l'action "Reporter"
  const [newStartDate, setNewStartDate] = useState('')
  const [newEndDate, setNewEndDate] = useState('')

  // Réinitialiser l'état du modal quand il s'ouvre/ferme
  useEffect(() => {
    if (!isOpen) {
      // Réinitialiser tous les états quand le modal se ferme
      setSelectedAction(null)
      setNotifyUsers(true)
      setIsSubmitting(false)
      setNewStartDate('')
      setNewEndDate('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleActionSelect = (action: ActionType) => {
    setSelectedAction(action)
    
    // Pré-remplir les dates actuelles pour le report
    if (action === 'postpone') {
      if (currentStartDate) {
        const dateOnly = currentStartDate.split('T')[0]
        if (dateOnly) setNewStartDate(dateOnly)
      }
      if (currentEndDate) {
        const dateOnly = currentEndDate.split('T')[0]
        if (dateOnly) setNewEndDate(dateOnly)
      }
    }
  }

  const handleConfirm = async () => {
    if (!selectedAction) return

    setIsSubmitting(true)
    try {
      let newStatus = currentStatus
      const options: {
        notifyUsers?: boolean
        newStartDate?: string
        newEndDate?: string
      } = {}

      switch (selectedAction) {
        case 'publish':
          newStatus = 'published'
          break
        case 'unpublish':
          newStatus = 'draft'
          break
        case 'close_registration':
          newStatus = 'registration_closed'
          break
        case 'reopen_registration':
          newStatus = 'published'
          break
        case 'cancel':
          newStatus = 'cancelled'
          options.notifyUsers = notifyUsers
          break
        case 'postpone':
          newStatus = 'postponed'
          options.notifyUsers = notifyUsers
          options.newStartDate = newStartDate
          options.newEndDate = newEndDate
          break
        case 'archive':
          newStatus = 'archived'
          break
      }

      await onStatusChange(newStatus, options)
      onClose()
      // Reset
      setSelectedAction(null)
      setNotifyUsers(true)
      setNewStartDate('')
      setNewEndDate('')
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setSelectedAction(null)
    setNotifyUsers(true)
    setNewStartDate('')
    setNewEndDate('')
  }

  const getActionConfig = (action: ActionType) => {
    switch (action) {
      case 'publish':
        return {
          title: 'Publier l\'événement',
          description:
            'L\'événement sera visible par tous les utilisateurs et les inscriptions seront ouvertes.',
          icon: CheckCircle,
          color: 'blue',
          showNotify: false,
        }
      case 'unpublish':
        return {
          title: 'Repasser en brouillon',
          description:
            'Le formulaire restera visible mais il faudra publier l\'événement pour que les inscriptions soient prises en compte. Les inscriptions existantes seront conservées.',
          icon: FileEdit,
          color: 'gray',
          showNotify: false,
        }
      case 'close_registration':
        return {
          title: 'Clôturer les inscriptions',
          description:
            'L\'événement restera visible mais les nouvelles inscriptions seront impossibles. Les participants déjà inscrits conservent leur accès. Le formulaire d\'inscription affichera automatiquement que les inscriptions sont closes.',
          icon: LockKeyhole,
          color: 'orange',
          showNotify: false,
        }
      case 'reopen_registration':
        return {
          title: 'Réouvrir les inscriptions',
          description:
            'Les inscriptions seront à nouveau ouvertes. Le formulaire d\'inscription redeviendra accessible au public.',
          icon: Unlock,
          color: 'green',
          showNotify: false,
        }
      case 'cancel':
        return {
          title: 'Annuler l\'événement',
          description:
            'L\'événement sera marqué comme annulé. Cette action est définitive. Le formulaire d\'inscription affichera automatiquement l\'annulation.',
          icon: XCircle,
          color: 'red',
          showNotify: true,
          notifyLabel: 'Envoyer un email d\'annulation à tous les inscrits',
        }
      case 'postpone':
        return {
          title: 'Reporter l\'événement',
          description:
            'Sélectionnez les nouvelles dates. Les inscriptions existantes seront conservées. Le formulaire d\'inscription affichera automatiquement le report.',
          icon: Clock,
          color: 'yellow',
          showNotify: true,
          notifyLabel: 'Informer les participants du report et de la nouvelle date',
          requiresDates: true,
        }
      case 'archive':
        return {
          title: 'Archiver l\'événement',
          description:
            'L\'événement sera archivé et ne sera plus visible dans la liste principale. Les données seront conservées pour consultation.',
          icon: Archive,
          color: 'gray',
          showNotify: false,
        }
      default:
        return null
    }
  }

  const availableActions = [
    ...(currentStatus === 'draft'
      ? [
          {
            id: 'publish' as ActionType,
            label: 'Publier l\'événement',
            icon: CheckCircle,
            color: 'text-blue-600 dark:text-blue-400',
          },
        ]
      : []),
    ...(currentStatus === 'published' || currentStatus === 'registration_closed'
      ? [
          {
            id: 'unpublish' as ActionType,
            label: 'Repasser en brouillon',
            icon: FileEdit,
            color: 'text-gray-600 dark:text-gray-400',
          },
        ]
      : []),
    ...(currentStatus === 'published'
      ? [
          {
            id: 'close_registration' as ActionType,
            label: 'Clôturer les inscriptions',
            icon: LockKeyhole,
            color: 'text-orange-600 dark:text-orange-400',
          },
        ]
      : []),
    ...(currentStatus === 'registration_closed'
      ? [
          {
            id: 'reopen_registration' as ActionType,
            label: 'Réouvrir les inscriptions',
            icon: Unlock,
            color: 'text-green-600 dark:text-green-400',
          },
        ]
      : []),
    ...(currentStatus !== 'cancelled' && currentStatus !== 'archived'
      ? [
          {
            id: 'cancel' as ActionType,
            label: 'Annuler l\'événement',
            icon: XCircle,
            color: 'text-red-600 dark:text-red-400',
          },
        ]
      : []),
    ...(currentStatus === 'published' || currentStatus === 'registration_closed'
      ? [
          {
            id: 'postpone' as ActionType,
            label: 'Reporter l\'événement',
            icon: Clock,
            color: 'text-yellow-600 dark:text-yellow-400',
          },
        ]
      : []),
    ...(currentStatus !== 'archived'
      ? [
          {
            id: 'archive' as ActionType,
            label: 'Archiver l\'événement',
            icon: Archive,
            color: 'text-gray-600 dark:text-gray-400',
          },
        ]
      : []),
  ]

  const actionConfig = selectedAction ? getActionConfig(selectedAction) : null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedAction ? (actionConfig?.title ?? 'Action') : 'Actions sur l\'événement'}
      maxWidth="md"
      contentPadding={false}
    >
      <ModalSteps currentStep={selectedAction ? 1 : 0}>
        <div className="p-6">
          {!selectedAction ? (
            // Liste des actions
            <div className="space-y-2">
              {availableActions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Aucune action disponible pour cet événement
                </p>
              ) : (
                availableActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleActionSelect(action.id)}
                      className="w-full flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <Icon className={`h-5 w-5 mr-3 ${action.color}`} />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {action.label}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          ) : (
            // Confirmation de l'action
            <div className="space-y-4">
              {actionConfig && (
                <>
                  {/* Icon + Description */}
                  <div className="flex items-start">
                    <div
                      className={`p-3 rounded-full bg-${actionConfig.color}-100 dark:bg-${actionConfig.color}-900/30 mr-4`}
                    >
                      <actionConfig.icon
                        className={`h-6 w-6 text-${actionConfig.color}-600 dark:text-${actionConfig.color}-400`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-300">
                        {actionConfig.description}
                      </p>
                    </div>
                  </div>

                  {/* Sélection de dates pour le report */}
                  {actionConfig.requiresDates && (
                    <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 space-y-3">
                      <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white mb-3">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                        <span>Nouvelles dates de l'événement</span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date de début
                        </label>
                        <input
                          type="date"
                          value={newStartDate}
                          onChange={(e) => setNewStartDate(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          value={newEndDate}
                          onChange={(e) => setNewEndDate(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Option de notification */}
                  {actionConfig.showNotify && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyUsers}
                          onChange={(e) => setNotifyUsers(e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {actionConfig.notifyLabel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Un email sera envoyé automatiquement aux participants
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Warning pour les actions critiques */}
                  {(selectedAction === 'cancel' || selectedAction === 'archive') && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Attention :</strong> Cette action est définitive et ne
                        peut pas être annulée.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </ModalSteps>

      {/* Footer */}
      <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
        {selectedAction ? (
          <>
            <Button
              onClick={handleBack}
              disabled={isSubmitting}
              variant="outline"
            >
              Retour
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                isSubmitting ||
                (selectedAction === 'postpone' &&
                  (!newStartDate || !newEndDate))
              }
              loading={isSubmitting}
              loadingText="Traitement..."
            >
              Confirmer
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        )}
      </div>
    </Modal>
  )
}
