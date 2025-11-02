/**
 * StepThree - Options email et approbation
 * - Capacité maximale
 * - Approbation automatique des inscriptions
 * - Vérification email requise
 * - Emails de confirmation
 * - Emails d'approbation
 * - Rappels
 */

import { useState } from 'react'
import { Card, CardContent, Input, FormField } from '@/shared/ui'
import { CreateEventFormData } from '../index'
import { Mail, Shield, Users } from 'lucide-react'

interface StepThreeProps {
  formData: CreateEventFormData
  updateFormData: (updates: Partial<CreateEventFormData>) => void
}

export function StepThree({ formData, updateFormData }: StepThreeProps) {
  const [showCapacity, setShowCapacity] = useState(!!formData.capacity)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Options et paramètres
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configurez les options d'inscription et de notification
        </p>
      </div>



      {/* Capacité maximale */}
      <Card variant="outlined">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Gestion des participants
              </h4>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="has_capacity"
                    checked={showCapacity}
                    onChange={(e) => {
                      setShowCapacity(e.target.checked)
                      if (!e.target.checked) {
                        const { capacity, ...rest } = formData
                        updateFormData(rest as any)
                      }
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Limiter le nombre de participants
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Définir une capacité maximale pour cet événement
                    </p>
                  </div>
                </label>

                {showCapacity && (
                  <FormField label="Capacité maximale">
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      min={1}
                      value={formData.capacity || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined
                        if (value) {
                          updateFormData({ capacity: value })
                        }
                      }}
                      placeholder="Ex: 100"
                    />
                  </FormField>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approbation */}
      <Card variant="outlined">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Gestion des inscriptions
              </h4>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="registration_auto_approve"
                    checked={formData.registration_auto_approve}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateFormData({ registration_auto_approve: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Approuver automatiquement tous les inscrits
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Les participants sont immédiatement approuvés sans validation manuelle
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="require_email_verification"
                    checked={formData.require_email_verification}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateFormData({ require_email_verification: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Vérifier l'email pour être pris en compte
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      L'inscription est validée uniquement après vérification de l'adresse email
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications email */}
      <Card variant="outlined">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Notifications par email
              </h4>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="confirmation_email_enabled"
                    checked={formData.confirmation_email_enabled}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateFormData({ confirmation_email_enabled: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Envoyer un email de confirmation lors de l'inscription
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Le participant reçoit un email confirmant son inscription
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="approval_email_enabled"
                    checked={formData.approval_email_enabled}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateFormData({ approval_email_enabled: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Envoyer un email lorsque l'inscription est approuvée
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Le participant reçoit un email quand son inscription est validée
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="reminder_email_enabled"
                    checked={formData.reminder_email_enabled}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateFormData({ reminder_email_enabled: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Envoyer des rappels avant l'événement
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Les participants reçoivent des rappels quelques jours avant l'événement
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
