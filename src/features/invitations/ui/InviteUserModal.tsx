import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSelector } from 'react-redux'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { FormField } from '@/shared/ui/FormField'
import { Input } from '@/shared/ui/Input'
import { useToast } from '../../../shared/ui/useToast'
import { useSendInvitationMutation } from '../api/invitationsApi'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { selectUser, selectOrganization } from '@/features/auth/model/sessionSlice'
import { 
  type UserRole, 
  type CreateInvitationRequest,
  ROLE_DESCRIPTIONS 
} from '../types/invitation.types'

// Schéma de validation
const invitationSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  role: z.enum([
    'SUPER_ADMIN', 'ORG_ADMIN', 'ORG_MANAGER', 'EVENT_MANAGER',
    'CHECKIN_STAFF', 'PARTNER', 'READONLY'
  ] as const, {
    required_error: 'Veuillez sélectionner un rôle'
  }),
  orgId: z.string().optional(),
  eventIds: z.array(z.string()).optional(),
  personalizedMessage: z.string().optional(),
})

type InvitationFormData = z.infer<typeof invitationSchema>

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast()
  const user = useSelector(selectUser)
  const organization = useSelector(selectOrganization)
  
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')
  const [showEventSelection, setShowEventSelection] = useState(false)
  
  const [sendInvitation, { isLoading: isSending }] = useSendInvitationMutation()
  const { data: eventsData } = useGetEventsQuery({})
  
  const isSuperAdmin = user?.isSuperAdmin
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      orgId: !isSuperAdmin ? organization?.id : undefined,
      eventIds: [],
    }
  })

  const watchedRole = watch('role')
  
  // Gérer l'affichage de la sélection d'événements
  useEffect(() => {
    if (watchedRole && ROLE_DESCRIPTIONS[watchedRole]?.requiresEventSelection) {
      setShowEventSelection(true)
    } else {
      setShowEventSelection(false)
      setValue('eventIds', [])
    }
  }, [watchedRole, setValue])

  // Reset du formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      reset()
      setSelectedRole('')
      setShowEventSelection(false)
    }
  }, [isOpen, reset])

  const onSubmit = async (data: InvitationFormData) => {
    console.log('🚀 Envoi invitation - Données:', data)
    console.log('🏢 Utilisateur:', user)
    console.log('🏢 Organisation:', organization)
    console.log('🔐 Super Admin?', isSuperAdmin)
    alert(`Tentative d'envoi d'invitation à ${data.email} avec le rôle ${data.role}`)
    
    try {
      // Pour les Super Admin, orgId vient du formulaire
      // Pour les Org Admin, orgId vient de leur organisation actuelle
      let targetOrgId: string | undefined

      if (isSuperAdmin) {
        targetOrgId = data.orgId
        console.log('🔐 Super Admin - orgId depuis formulaire:', targetOrgId)
      } else {
        targetOrgId = organization?.id
        console.log('👤 Org Admin - orgId depuis session:', targetOrgId)
        if (!targetOrgId) {
          console.error('❌ Organisation non trouvée')
          alert('Erreur: Organisation non trouvée')
          return
        }
      }

      const invitationData: CreateInvitationRequest = {
        email: data.email,
        role: data.role,
        ...(targetOrgId && { orgId: targetOrgId }),
        ...(data.eventIds?.length && { eventIds: data.eventIds }),
        ...(data.personalizedMessage && { personalizedMessage: data.personalizedMessage }),
      }

      console.log('📧 Envoi invitation - Payload:', invitationData)

      const result = await sendInvitation(invitationData).unwrap()
      
      console.log('✅ Invitation envoyée avec succès:', result)
      
      alert(`Succès: Invitation envoyée à ${data.email}`)
      
      onClose()
      reset()
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'invitation:', error)
      alert(`Erreur: ${error?.data?.message || 'Erreur inconnue'}`)
    }
  }

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role)
    setValue('role', role, { shouldValidate: true })
  }

  // Filtrer les rôles selon les permissions
  const availableRoles = Object.entries(ROLE_DESCRIPTIONS).filter(([role]) => {
    if (role === 'SUPER_ADMIN') return false // Ne peut pas inviter de Super Admin
    if (!isSuperAdmin && ['ORG_ADMIN', 'ORG_MANAGER'].includes(role)) return false // Org Admin ne peut pas inviter d'autres admins
    return true
  }) as [UserRole, typeof ROLE_DESCRIPTIONS[UserRole]][]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inviter un utilisateur"
      maxWidth="2xl"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <FormField
          label="Adresse email"
          error={errors.email?.message}
        >
          <Input
            type="email"
            placeholder="utilisateur@example.com"
            {...register('email')}
          />
        </FormField>

        {/* Organisation (seulement pour Super Admin) */}
        {isSuperAdmin && (
          <FormField
            label="Organisation"
            error={errors.orgId?.message}
          >
            <select
              {...register('orgId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner une organisation</option>
              <option value="org-choyou">Choyou</option>
              <option value="org-itforbusiness">IT for Business</option>
            </select>
          </FormField>
        )}

        {/* Sélection du rôle */}
        <FormField
          label="Rôle utilisateur"
          error={errors.role?.message}
        >
          <div className="grid grid-cols-1 gap-3">
            {availableRoles.map(([role, config]) => (
              <label
                key={role}
                className={`
                  relative flex cursor-pointer rounded-lg border p-4 focus:outline-none
                  ${selectedRole === role 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="radio"
                  value={role}
                  checked={selectedRole === role}
                  onChange={() => handleRoleChange(role)}
                  className="sr-only"
                />
                <div className="flex flex-1">
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">
                      {config.label}
                    </span>
                    <span className="block text-sm text-gray-500">
                      {config.description}
                    </span>
                    {config.requiresEventSelection && (
                      <span className="block text-xs text-orange-600 mt-1">
                        Nécessite une sélection d'événements
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </FormField>

        {/* Sélection des événements (conditionnel) */}
        {showEventSelection && eventsData && (
          <FormField
            label="Événements autorisés"
            error={errors.eventIds?.message}
          >
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
              {eventsData.map((event) => (
                <label key={event.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    value={event.id}
                    {...register('eventIds')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {event.name}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      {event.location} • {new Date(event.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sélectionnez les événements auxquels l'utilisateur aura accès
            </p>
          </FormField>
        )}

        {/* Message personnalisé (optionnel) */}
        <FormField
          label="Message personnalisé (optionnel)"
        >
          <textarea
            {...register('personalizedMessage')}
            rows={3}
            placeholder="Ajoutez un message personnel à l'invitation..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </FormField>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isSending}
          >
            {isSending ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
          </Button>
        </div>
        </form>
      </div>
    </Modal>
  )
}