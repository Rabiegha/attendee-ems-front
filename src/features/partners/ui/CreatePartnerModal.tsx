import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Modal, FormField, Input, Button, Select, SelectOption } from '@/shared/ui'
import { useCreateUserMutation } from '@/features/users/api/usersApi'
import { useGetRolesFilteredQuery } from '@/features/roles/api/rolesApi'
import { useGetCompaniesQuery } from '@/features/companies/api/companiesApi'
import { useToast } from '@/shared/hooks/useToast'
import type { RootState } from '@/app/store'
import { UserPlus } from 'lucide-react'

interface CreatePartnerModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreatePartnerModal: React.FC<CreatePartnerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation('common')
  const toast = useToast()
  const currentUser = useSelector((state: RootState) => state.session.user)

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company_id: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [createUser, { isLoading }] = useCreateUserMutation()

  // Charger les rôles pour trouver l'ID du rôle PARTNER
  const { data: roles = [] } = useGetRolesFilteredQuery(
    currentUser?.orgId ? { orgId: currentUser.orgId } : {},
  )

  // Charger les entreprises
  const { data: companies = [] } = useGetCompaniesQuery()

  const partnerRole = roles.find((r) => r.code === 'PARTNER')

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const resetForm = () => {
    setFormData({ email: '', firstName: '', lastName: '', company_id: '', password: '', confirmPassword: '' })
    setErrors({})
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('partners.invite_validation_required')
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('partners.invite_validation_required')
    }
    if (!formData.email.trim()) {
      newErrors.email = t('partners.invite_validation_required')
    }
    if (!formData.password) {
      newErrors.password = t('partners.invite_validation_required')
    } else if (formData.password.length < 6) {
      newErrors.password = t('partners.password_min_length')
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('partners.invite_validation_required')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('partners.password_mismatch')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (!partnerRole) {
      toast.error(t('partners.create_error'))
      return
    }

    try {
      const userData: any = {
        email: formData.email,
        password: formData.password,
        role_id: partnerRole.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        is_active: true,
      }
      if (formData.company_id) userData.company_id = formData.company_id

      await createUser(userData).unwrap()

      toast.success(t('partners.create_success'))
      resetForm()
      onClose()
    } catch (err: any) {
      const message = err?.data?.message || t('partners.create_error')
      toast.error(message)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('partners.create_modal_title')}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
          {t('partners.create_modal_subtitle')}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={t('partners.field_first_name')} required error={errors.firstName}>
            <Input
              value={formData.firstName}
              onChange={handleChange('firstName')}
              placeholder="Jean"
            />
          </FormField>
          <FormField label={t('partners.field_last_name')} required error={errors.lastName}>
            <Input
              value={formData.lastName}
              onChange={handleChange('lastName')}
              placeholder="Dupont"
            />
          </FormField>
        </div>

        <FormField label={t('partners.field_email')} required error={errors.email}>
          <Input
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="partenaire@exemple.com"
          />
        </FormField>

        <FormField label={t('partners.field_company')}>
          <Select
            value={formData.company_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, company_id: e.target.value }))}
            placeholder={t('partners.select_company_placeholder')}
          >
            <SelectOption value="">{t('partners.no_company')}</SelectOption>
            {companies.map((c) => (
              <SelectOption key={c.id} value={c.id}>{c.name}</SelectOption>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={t('partners.field_password')} required error={errors.password}>
            <Input
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="••••••••"
            />
          </FormField>
          <FormField label={t('partners.field_confirm_password')} required error={errors.confirmPassword}>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="••••••••"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('app.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !partnerRole}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            {isLoading ? t('partners.creating') : t('partners.create_partner')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
