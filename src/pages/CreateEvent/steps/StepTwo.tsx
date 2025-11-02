/**
 * StepTwo - Lieu et participants
 * - Type de lieu (physique/en ligne/hybride)
 * - Adresse (si physique)
 * - Partenaires autorisés
 */

import { useState } from 'react'
import { 
  Input, 
  FormField,
  Select,
  SelectOption,
  GooglePlacesAutocomplete,
} from '@/shared/ui'
import { CreateEventFormData } from '../index'
import { MapPin, Users } from 'lucide-react'
import { useGetUsersQuery } from '@/features/users/api/usersApi'
import type { UserResponse } from '@/features/users/dpo/user.dpo'

interface StepTwoProps {
  formData: CreateEventFormData
  updateFormData: (updates: Partial<CreateEventFormData>) => void
}

// Récupérer la clé API depuis les variables d'environnement
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

export function StepTwo({ formData, updateFormData }: StepTwoProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Récupérer tous les utilisateurs de l'organisation
  const { data: usersData } = useGetUsersQuery({ page: 1, pageSize: 1000 })
  const users = usersData?.users || []

  // Filtrer les utilisateurs par recherche
  const filteredUsers = users.filter((user: UserResponse) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const email = user.email.toLowerCase()
    const search = searchTerm.toLowerCase()
    return fullName.includes(search) || email.includes(search)
  })

  // Toggle sélection utilisateur
  const toggleUser = (userId: string) => {
    const current = formData.assigned_user_ids || []
    if (current.includes(userId)) {
      updateFormData({ assigned_user_ids: current.filter(id => id !== userId) })
    } else {
      updateFormData({ assigned_user_ids: [...current, userId] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Lieu et participants
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Définissez le lieu et les paramètres de participation
        </p>
      </div>

      {/* Type de lieu */}
      <FormField label="Type de lieu">
        <Select
          id="location_type"
          value={formData.location_type}
          onChange={(e) => updateFormData({ location_type: e.target.value as 'physical' | 'online' | 'hybrid' })}
        >
          <SelectOption value="physical">Physique</SelectOption>
          <SelectOption value="online">En ligne</SelectOption>
          <SelectOption value="hybrid">Hybride</SelectOption>
        </Select>
      </FormField>

      {/* Adresse (si physique ou hybride) */}
      {(formData.location_type === 'physical' || formData.location_type === 'hybrid') && (
        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Localisation de l'événement
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {GOOGLE_MAPS_API_KEY 
                  ? 'Recherchez une adresse avec Google Maps ou saisissez-la manuellement'
                  : 'Saisissez l\'adresse complète de l\'événement'
                }
              </p>
            </div>
          </div>

          <FormField label="Adresse complète">
            {GOOGLE_MAPS_API_KEY ? (
              <GooglePlacesAutocomplete
                id="address_formatted"
                name="address_formatted"
                value={formData.address_formatted || ''}
                onChange={(value) => updateFormData({ address_formatted: value })}
                onPlaceSelect={(place) => {
                  const updates: Partial<CreateEventFormData> = {
                    address_formatted: place.formatted_address,
                    latitude: place.latitude,
                    longitude: place.longitude,
                  }
                  
                  if (place.street) updates.address_street = place.street
                  if (place.city) updates.address_city = place.city
                  if (place.postal_code) updates.address_postal_code = place.postal_code
                  if (place.country) updates.address_country = place.country
                  
                  updateFormData(updates)
                }}
                placeholder="Rechercher une adresse..."
                apiKey={GOOGLE_MAPS_API_KEY}
              />
            ) : (
              <Input
                id="address_formatted"
                name="address_formatted"
                value={formData.address_formatted || ''}
                onChange={(e) => updateFormData({ address_formatted: e.target.value })}
                placeholder="123 Rue de la République, 75001 Paris, France"
              />
            )}
          </FormField>

          {/* Affichage des coordonnées GPS si disponibles */}
          {formData.latitude && formData.longitude && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <MapPin className="h-3 w-3" />
              <span>
                GPS: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </span>
            </div>
          )}

          {!GOOGLE_MAPS_API_KEY && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <span className="font-medium">Info :</span> Pour activer l'autocomplete avec Google Maps, 
                ajoutez une clé API Google Maps dans le fichier .env (VITE_GOOGLE_MAPS_API_KEY).
                <a 
                  href="https://github.com/Rabiegha/attendee-ems-front/blob/main/docs/GOOGLE_MAPS_SETUP.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:text-amber-900 dark:hover:text-amber-100"
                >
                  Voir le guide
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Partenaires autorisés */}
      <FormField label="Partenaires autorisés">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Sélectionnez les utilisateurs autorisés à gérer cet événement
        </p>

        {/* Barre de recherche */}
        <div className="mb-3">
          <Input
            id="search_users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            leftIcon={<Users className="h-4 w-4" />}
          />
        </div>

        {/* Liste des utilisateurs */}
        <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user: UserResponse) => (
              <label
                key={user.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.assigned_user_ids?.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </div>
                </div>
              </label>
            ))
          ) : (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur disponible'}
              </p>
            </div>
          )}
        </div>

        {formData.assigned_user_ids && formData.assigned_user_ids.length > 0 && (
          <p className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium">
            ✓ {formData.assigned_user_ids.length} utilisateur(s) sélectionné(s)
          </p>
        )}
      </FormField>
    </div>
  )
}
