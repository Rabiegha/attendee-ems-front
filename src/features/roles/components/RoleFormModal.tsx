/**
 * RoleFormModal - Modal pour créer ou éditer un rôle
 */

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { RoleWithDetails } from '../api/rbacAdminApi'

interface RoleFormModalProps {
  role?: RoleWithDetails | undefined // Si présent = mode édition
  orgId: string
  onSave: (data: {
    code: string
    name: string
    level?: number
    rank?: number
  }) => Promise<void>
  onClose: () => void
  isLoading?: boolean
  nextRank?: number | undefined
}

export function RoleFormModal({
  role,
  orgId,
  onSave,
  onClose,
  isLoading = false,
  nextRank,
}: RoleFormModalProps) {
  const [code, setCode] = useState(role?.code || '')
  const [name, setName] = useState(role?.name || '')
  const [level, setLevel] = useState(role?.level?.toString() || '')
  const [rank, setRank] = useState(
    role?.rank?.toString() || nextRank?.toString() || ''
  )

  const isEditMode = !!role

  useEffect(() => {
    if (!role && nextRank !== undefined) {
      setRank(nextRank.toString())
    }
  }, [nextRank, role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data: {
      code: string
      name: string
      level?: number
      rank?: number
    } = { code, name }
    
    if (level) data.level = parseInt(level, 10)
    if (rank) data.rank = parseInt(rank, 10)
    
    await onSave(data)
  }

  const isValid = code.trim() && name.trim()

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Éditer le rôle' : 'Créer un nouveau rôle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Code *
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex: project_manager"
              disabled={isEditMode} // Code non modifiable en édition
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Identifiant unique (snake_case recommandé)
              {isEditMode && ' - Non modifiable'}
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Chef de Projet"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Nom d'affichage du rôle
            </p>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Niveau (optionnel)
            </label>
            <input
              type="number"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="ex: 300"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Niveau hiérarchique (calculé automatiquement si non fourni)
            </p>
          </div>

          {/* Rank */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rang (optionnel)
            </label>
            <input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder={nextRank?.toString() || 'Auto'}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Position dans la hiérarchie (calculé automatiquement si non fourni)
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading
                ? 'Enregistrement...'
                : isEditMode
                  ? 'Mettre à jour'
                  : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
