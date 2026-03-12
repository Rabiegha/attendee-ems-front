/**
 * CompanyModal - Modal de création / édition d'entreprise
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui'
import {
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  type Company,
} from '@/features/companies/api/companiesApi'
import { useToast } from '@/shared/hooks/useToast'

interface CompanyModalProps {
  isOpen: boolean
  onClose: () => void
  company?: Company | null  // null = création, Company = édition
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  company,
}) => {
  const { t } = useTranslation('common')
  const toast = useToast()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation()
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation()

  const isEditing = !!company
  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (isOpen) {
      setName(company?.name || '')
      setError('')
    }
  }, [isOpen, company])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = name.trim()
    if (!trimmed) {
      setError(t('companies.validation_required'))
      return
    }

    try {
      if (isEditing && company) {
        await updateCompany({ id: company.id, data: { name: trimmed } }).unwrap()
        toast.success(t('companies.update_success'))
      } else {
        await createCompany({ name: trimmed }).unwrap()
        toast.success(t('companies.create_success'))
      }
      onClose()
    } catch (err: any) {
      if (err?.status === 409) {
        setError(t('companies.already_exists'))
      } else {
        toast.error(isEditing ? t('companies.update_error') : t('companies.create_error'))
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative z-50 w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {isEditing ? t('companies.edit_title') : t('companies.create_title')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {isEditing ? t('companies.edit_subtitle') : t('companies.create_subtitle')}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('companies.field_name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError('')
                  }}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={t('companies.field_name_placeholder')}
                  autoFocus
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  {t('companies.cancel')}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? t('companies.saving')
                    : isEditing
                      ? t('companies.save')
                      : t('companies.create')
                  }
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
