/**
 * Composants Skeleton spécifiques par page
 * Pour des états de chargement cohérents et réalistes
 */

import React from 'react'
import { Skeleton, SkeletonText, SkeletonCard } from './Skeleton'

/**
 * Skeleton pour les cartes d'événements (grille)
 */
export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
      {/* Image/Badge */}
      <Skeleton className="h-48 w-full rounded-md" />
      
      {/* Titre */}
      <Skeleton className="h-6 w-3/4" />
      
      {/* Date et lieu */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      {/* Stats */}
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      
      {/* Boutons */}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  )
}

/**
 * Grille de skeleton pour événements
 */
export const EventsGridSkeleton: React.FC<{ count?: number }> = ({ 
  count = 6 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton pour les cartes de statistiques
 */
export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton variant="circular" className="h-10 w-10" />
      </div>
    </div>
  )
}

/**
 * Grille de cartes statistiques
 */
export const StatsGridSkeleton: React.FC<{ count?: number }> = ({ 
  count = 4 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton pour la ligne d'un utilisateur dans une table
 */
export const UserRowSkeleton: React.FC = () => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      {/* Avatar + Nom */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" className="h-10 w-10" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </td>
      
      {/* Rôle */}
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-24 rounded-full" />
      </td>
      
      {/* Statut */}
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      
      {/* Date */}
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      
      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </td>
    </tr>
  )
}

/**
 * Table complète d'utilisateurs avec skeleton
 */
export const UsersTableSkeleton: React.FC<{ rows?: number }> = ({ 
  rows = 8 
}) => {
  return (
    <div className="overflow-visible">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-24" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="px-6 py-3 text-right">
              <Skeleton className="h-4 w-16 ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, i) => (
            <UserRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Skeleton pour une ligne d'attendee
 */
export const AttendeeRowSkeleton: React.FC = () => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      {/* Checkbox */}
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-4" />
      </td>
      
      {/* Nom */}
      <td className="px-6 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </td>
      
      {/* Contact */}
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-40" />
      </td>
      
      {/* Entreprise */}
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-28" />
      </td>
      
      {/* Check-ins */}
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-12 rounded-full" />
      </td>
      
      {/* Inscription */}
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      
      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </td>
    </tr>
  )
}

/**
 * Skeleton pour l'onglet Détails de EventDetails
 */
export const EventDetailsTabSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne gauche: Description + Détails (2/3) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite: Statistiques sidebar (1/3) */}
      <div className="space-y-6">
        {/* Card Statistiques */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-12" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-12" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Card Actions rapides */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton className="h-5 w-36 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton pour l'onglet Inscriptions de EventDetails
 */
export const EventRegistrationsTabSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header avec titre et boutons */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Table des inscriptions */}
      <RegistrationsTableSkeleton rows={10} />
    </div>
  )
}

/**
 * Skeleton pour l'onglet Formulaire de EventDetails
 */
export const EventFormTabSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gauche: Form Builder */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Embed Code */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      {/* Droite: Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-12 w-full mt-6" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton pour l'onglet Paramètres de EventDetails
 */
export const EventSettingsTabSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Section 1 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

/**
 * Skeleton complet pour les détails d'un événement avec onglets
 */
export const EventDetailsSkeleton: React.FC<{ activeTab?: string }> = ({ activeTab = 'details' }) => {
  return (
    <div className="space-y-6">
      {/* Header avec titre, infos et boutons */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Skeleton className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          {['Détails', 'Inscriptions', 'Formulaire', 'Paramètres'].map((label, i) => (
            <div 
              key={i} 
              className={`flex items-center py-4 ${
                (i === 0 && activeTab === 'details') ||
                (i === 1 && activeTab === 'registrations') ||
                (i === 2 && activeTab === 'form') ||
                (i === 3 && activeTab === 'settings')
                  ? 'border-b-2 border-blue-500'
                  : ''
              }`}
            >
              <Skeleton className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'details' && <EventDetailsTabSkeleton />}
      {activeTab === 'registrations' && <EventRegistrationsTabSkeleton />}
      {activeTab === 'form' && <EventFormTabSkeleton />}
      {activeTab === 'settings' && <EventSettingsTabSkeleton />}
    </div>
  )
}

/**
 * Skeleton pour liste de registrations
 */
export const RegistrationsTableSkeleton: React.FC<{ rows?: number }> = ({ 
  rows = 10 
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton variant="circular" className="h-12 w-12" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton pour les templates de badges
 */
export const BadgeTemplateCardSkeleton: React.FC = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <Skeleton className="h-32 w-full rounded" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  )
}

/**
 * Grille de templates de badges
 */
export const BadgeTemplatesGridSkeleton: React.FC<{ count?: number }> = ({ 
  count = 6 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BadgeTemplateCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton pour page de formulaire
 */
export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Section 1 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
      
      {/* Section 2 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      
      {/* Boutons */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

/**
 * Skeleton pour page Events (grille seulement, pas les filtres)
 */
export const EventsPageSkeleton: React.FC = () => {
  return <EventsGridSkeleton count={6} />
}

/**
 * Skeleton pour page Organizations (une seule carte avec équipe intégrée)
 */
export const OrganizationsPageSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header de l'organisation */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Icône */}
            <Skeleton className="h-10 w-10 rounded-lg" />
            {/* Nom et infos */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Badge plan */}
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Liste de l'équipe (toujours visible, pas de toggle) */}
      <div className="p-6 pt-4">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <Skeleton className="h-8 w-8 rounded-full" />
                {/* Nom et email */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              {/* Badge rôle */}
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton pour page Roles & Permissions (2 colonnes: liste rôles + permissions)
 */
export const RolesPermissionsPageSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne gauche : Liste des rôles (1/3) */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <Skeleton className="h-6 w-24 mb-4" />
          
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i}
                className={`p-3 rounded-lg border-2 ${
                  i === 0 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    {i === 1 && <Skeleton className="h-5 w-20 rounded" />}
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colonne droite : Permissions du rôle sélectionné (2/3) */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {/* Header du rôle */}
          <div className="mb-6 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>
          
          {/* Catégories de permissions (accordéons) */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Header de catégorie */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
                
                {/* Permissions de la catégorie (visible pour la première) */}
                {i === 0 && (
                  <div className="p-4 space-y-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-5 w-5 rounded" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Bouton sauvegarder en bas */}
          <div className="mt-6 flex justify-end">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton pour page avec filtres (contenu seulement, pas les filtres)
 */
export const PageWithFiltersSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatsGridSkeleton count={4} />
      
      {/* Contenu principal */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="px-6 pt-6">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <UsersTableSkeleton rows={8} />
      </div>
    </div>
  )
}

/**
 * Skeleton pour les cartes de stats du Dashboard
 */
export const DashboardStatsCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="space-y-3">
            {/* Icon with gradient background */}
            <Skeleton className="w-12 h-12 rounded-lg" />
            {/* Title */}
            <Skeleton className="h-5 w-32" />
            {/* Description */}
            <Skeleton className="h-4 w-24" />
            {/* Badges (for non-action cards) */}
            {i < 2 && (
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton pour liste d'événements du Dashboard
 */
export const DashboardEventListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 pr-4 py-3 bg-white dark:bg-gray-800 rounded-r-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {/* Titre */}
              <Skeleton className="h-5 w-48" />
              {/* Date */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              {/* Participants */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            {/* Badge status */}
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton pour liste de participants du Dashboard
 */
export const DashboardAttendeeListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 pr-4 py-3 bg-white dark:bg-gray-800 rounded-r-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {/* Nom */}
              <Skeleton className="h-5 w-40" />
              {/* Email */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-48" />
              </div>
              {/* Date */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            {/* Badge actif */}
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton complet pour page Dashboard
 */
export const DashboardPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <DashboardStatsCardsSkeleton />
      
      {/* Deux colonnes: Événements + Participants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-7 w-48" />
          <DashboardEventListSkeleton />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-7 w-48" />
          <DashboardAttendeeListSkeleton />
        </div>
      </div>
    </div>
  )
}
