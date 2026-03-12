import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, Input, FormField, Select, SelectOption } from '@/shared/ui'
import { useGetCompaniesQuery } from '@/features/companies/api/companiesApi'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: any | null
  onSave: (userId: string, data: any) => Promise<void>
  /** Si true, affiche un select entreprise au lieu d'un champ texte */
  useCompanySelect?: boolean
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  useCompanySelect = false,
}) => {
  const { t } = useTranslation(['users', 'common'])
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    company_id: '' as string | null,
    job_title: '',
  })

  // Charger les entreprises pour le select
  const { data: companies = [] } = useGetCompaniesQuery(undefined, {
    skip: !useCompanySelect,
  })

  React.useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        company_id: user.company_id || '',
        job_title: user.job_title || '',
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const dataToSend: any = { ...formData }
      if (useCompanySelect) {
        // Envoyer company_id (string ou null pour dissocier)
        dataToSend.company_id = formData.company_id || null
        delete dataToSend.company
      } else {
        delete dataToSend.company_id
      }
      await onSave(user.id, dataToSend)
      onClose()
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('users:modal.edit_title')}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label={t('users:detail.first_name')}>
            <Input
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              placeholder={t('users:detail.first_name')}
            />
          </FormField>
          <FormField label={t('users:detail.last_name')}>
            <Input
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              placeholder={t('users:detail.last_name')}
            />
          </FormField>
        </div>
        
        <FormField label={t('users:detail.email')} required>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="email@example.com"
          />
        </FormField>
        
        <FormField label={t('users:detail.phone')}>
          <Input
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+33 6 12 34 56 78"
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label={t('users:modal.company')}>
            {useCompanySelect ? (
              <Select
                value={formData.company_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, company_id: e.target.value || null })
                }
              >
                <SelectOption value="">{t('common:partners.no_company')}</SelectOption>
                {companies.map((c) => (
                  <SelectOption key={c.id} value={c.id}>{c.name}</SelectOption>
                ))}
              </Select>
            ) : (
              <Input
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder={t('users:modal.company_placeholder')}
              />
            )}
          </FormField>
          <FormField label={t('users:modal.job_title')}>
            <Input
              value={formData.job_title}
              onChange={(e) =>
                setFormData({ ...formData, job_title: e.target.value })
              }
              placeholder={t('users:modal.job_title')}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            {t('common:app.cancel')}
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isSaving || !formData.email}
          >
            {isSaving ? t('common:app.saving') : t('common:app.save')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
