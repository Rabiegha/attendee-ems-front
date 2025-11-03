import React, { useState } from 'react'
import { X, Download, FileText, Image, File } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { useDownloadBadgeMutation } from '../api/registrationsApi'
import { useToast } from '@/shared/hooks/useToast'
import type { RegistrationDPO } from '../dpo/registration.dpo'

interface BadgeDownloadModalProps {
  isOpen: boolean
  onClose: () => void
  registration: RegistrationDPO
  eventId: string
}

type BadgeFormat = 'pdf' | 'html' | 'image'

const FORMAT_CONFIG = {
  pdf: {
    icon: FileText,
    label: 'PDF',
    description: 'Document imprimable en haute qualité',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/30',
  },
  html: {
    icon: File,
    label: 'HTML',
    description: 'Page web interactive',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-900/30',
  },
  image: {
    icon: Image,
    label: 'Image',
    description: 'Fichier image PNG en haute résolution',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
  },
} as const

export const BadgeDownloadModal: React.FC<BadgeDownloadModalProps> = ({
  isOpen,
  onClose,
  registration,
  eventId,
}) => {
  const [downloadBadge, { isLoading }] = useDownloadBadgeMutation()
  const [selectedFormat, setSelectedFormat] = useState<BadgeFormat>('pdf')
  const toast = useToast()

  const handleDownload = async (format: BadgeFormat) => {
    try {
      const result = await downloadBadge({
        eventId,
        registrationId: registration.id,
        format,
      }).unwrap()

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(result)
      const link = document.createElement('a')
      link.href = url
      
      // Déterminer l'extension de fichier
      const extension = format === 'pdf' ? 'pdf' : format === 'html' ? 'html' : 'png'
      const fileName = `badge-${registration.attendee?.firstName}-${registration.attendee?.lastName}.${extension}`
      
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Nettoyer
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Badge téléchargé en format ${FORMAT_CONFIG[format].label}`)
      onClose()
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du badge:', error)
      toast.error(error.data?.message || 'Erreur lors du téléchargement du badge')
    }
  }

  if (!isOpen) return null

  const fullName = `${registration.attendee?.firstName || ''} ${registration.attendee?.lastName || ''}`.trim()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Télécharger le badge
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Participant info */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Participant :
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {fullName}
            </p>
            {registration.attendee?.company && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {registration.attendee.company}
              </p>
            )}
          </div>

          {/* Format selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Choisissez le format de téléchargement :
            </p>
            <div className="space-y-2">
              {(Object.keys(FORMAT_CONFIG) as BadgeFormat[]).map((format) => {
                const config = FORMAT_CONFIG[format]
                const Icon = config.icon
                const isSelected = selectedFormat === format

                return (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? `border-blue-500 ${config.bgColor}`
                        : `border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 ${config.hoverColor}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {config.label}
                          </span>
                          {isSelected && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={() => handleDownload(selectedFormat)}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Téléchargement...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger {FORMAT_CONFIG[selectedFormat].label}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}