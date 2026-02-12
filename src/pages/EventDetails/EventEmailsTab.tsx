import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useUpdateEventMutation } from '@/features/events/api/eventsApi'
import { Button, FormField } from '@/shared/ui'
import { Save, Mail, QrCode, AlertTriangle } from 'lucide-react'
import type { EventDPO } from '@/features/events/dpo/event.dpo'
import { useToast } from '@/shared/hooks/useToast'

interface EventEmailsTabProps {
  event: EventDPO
}

export const EventEmailsTab: React.FC<EventEmailsTabProps> = ({ event }) => {
  const toast = useToast()
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation()

  // Si l'événement est supprimé, afficher un message
  if (event.isDeleted) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border-2 border-red-200 dark:border-red-800 p-8 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-600 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
          Événement supprimé
        </h2>
        <p className="text-red-700 dark:text-red-400">
          Cet événement a été supprimé et ne peut plus être modifié.
          Les paramètres sont désactivés.
        </p>
      </div>
    )
  }

  // État initial mémorisé pour la comparaison
  const initialFormData = useMemo(() => ({
    include_qr_code_in_approval: event.includeQrCodeInApproval ?? true,
  }), [event])

  // État du formulaire
  const [formData, setFormData] = useState(initialFormData)
  const [isExiting, setIsExiting] = useState(false)
  const [showSaveButton, setShowSaveButton] = useState(false)

  // Mettre à jour le formulaire quand les données initiales changent
  useEffect(() => {
    setFormData(initialFormData)
  }, [initialFormData])

  // Détection des changements
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData)
  }, [formData, initialFormData])

  // Gérer l'animation d'entrée et de sortie
  useEffect(() => {
    if (isDirty) {
      setIsExiting(false)
      setShowSaveButton(true)
      return undefined
    } else if (showSaveButton) {
      // Déclencher l'animation de sortie
      setIsExiting(true)
      const timer = setTimeout(() => {
        setShowSaveButton(false)
        setIsExiting(false)
      }, 400) // Durée de l'animation
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isDirty, showSaveButton])

  // Fonction de sauvegarde
  const handleSave = async () => {
    try {
      await updateEvent({
        id: event.id,
        data: {
          includeQrCodeInApproval: formData.include_qr_code_in_approval,
        },
      }).unwrap()

      toast.success('Paramètres email enregistrés avec succès')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres email:', error)
      toast.error('Erreur lors de la sauvegarde des paramètres email')
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Paramètres Email
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configurez les paramètres des emails envoyés pour cet événement
        </p>
      </div>

      {/* Section QR Code */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <QrCode className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            QR Code d'accès
          </h3>
        </div>

        <FormField label="Inclure le QR code dans l'email d'approbation">
          <div className="flex items-center space-x-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.include_qr_code_in_approval}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    include_qr_code_in_approval: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formData.include_qr_code_in_approval ? 'Activé' : 'Désactivé'}
            </span>
          </div>
        </FormField>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Lorsque activé, un QR code unique sera inclus dans l'email d'approbation de l'inscription.
          Les participants pourront le présenter à l'entrée pour un accès rapide à l'événement.
        </p>
      </div>

      {/* Bouton de sauvegarde flottant via Portal */}
      {showSaveButton && createPortal(
        <div 
          className={`fixed bottom-6 right-6 z-50 ${isExiting ? 'animate-slide-down' : 'animate-slide-up'}`}
          style={{
            marginLeft: typeof window !== 'undefined' && localStorage.getItem('sidebarOpen') === 'false' ? '4rem' : '16rem'
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-300 dark:border-amber-600 shadow-2xl p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                Modifications non sauvegardées
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              leftIcon={<Save className="h-4 w-4" />}
              className="whitespace-nowrap">
              {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
