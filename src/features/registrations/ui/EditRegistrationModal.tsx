import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import type { RegistrationDPO } from '../dpo/registration.dpo'
import type { FormField } from '@/features/events/components/FormBuilder/types'
import { isCustomField } from '@/features/events/components/FormBuilder/types'
import type { EventAttendeeType } from '@/features/events/api/eventsApi'
import { useGetEventTablesQuery } from '@/features/events/api/eventsApi'
import {
  getRegistrationFirstName,
  getRegistrationLastName,
  getRegistrationEmail,
  getRegistrationPhone,
  getRegistrationCompany,
  getRegistrationJobTitle,
  getRegistrationCountry,
} from '../utils/registration-helpers'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface RegistrationUpdatePayload {
  attendee?: Record<string, string>
  answers?: Record<string, unknown>
  status?: string
  eventAttendeeTypeId?: string | null
  tableChoiceId?: string | null
  assignedTableId?: string | null
  comment?: string
}

interface EditRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  registration: RegistrationDPO
  onSave: (data: RegistrationUpdatePayload) => Promise<void>
  isLoading?: boolean
  formFields?: FormField[]
  allAnswerKeys?: string[]
  eventAttendeeTypes?: EventAttendeeType[]
}

// â”€â”€â”€ Constants (module-level â€” never recreated) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const INPUT_CLASSES = "w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
const LABEL_CLASSES = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"

// Map standard field keys to their attendee getter and snake_case API field
const STANDARD_FIELD_MAP: Record<string, {
  getter: (reg: RegistrationDPO) => string
  apiField: string
  inputType?: string
}> = {
  first_name: { getter: getRegistrationFirstName, apiField: 'first_name' },
  last_name: { getter: getRegistrationLastName, apiField: 'last_name' },
  email: { getter: getRegistrationEmail, apiField: 'email', inputType: 'email' },
  phone: { getter: getRegistrationPhone, apiField: 'phone', inputType: 'tel' },
  company: { getter: getRegistrationCompany, apiField: 'company' },
  jobTitle: { getter: getRegistrationJobTitle, apiField: 'job_title' },
  country: { getter: getRegistrationCountry, apiField: 'country' },
}

export const EditRegistrationModal: React.FC<EditRegistrationModalProps> = ({
  isOpen,
  onClose,
  registration,
  onSave,
  isLoading = false,
  formFields = [],
  allAnswerKeys = [],
  eventAttendeeTypes = [],
}) => {
  const { t } = useTranslation(['events', 'common'])

  // â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [attendeeData, setAttendeeData] = useState<Record<string, string>>({})
  const [answersData, setAnswersData] = useState<Record<string, unknown>>({})
  const [status, setStatus] = useState('')
  const [eventAttendeeTypeId, setEventAttendeeTypeId] = useState('')
  const [tableChoiceId, setTableChoiceId] = useState('')
  const [assignedTableId, setAssignedTableId] = useState('')
  const [comment, setComment] = useState('')

  // â”€â”€â”€ Queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: eventTables = [] } = useGetEventTablesQuery(registration.eventId, {
    skip: !registration.eventId,
  })

  // â”€â”€â”€ Memoized computed values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const statusOptions = useMemo(() => [
    { value: 'awaiting', label: t('events:registrations.status_awaiting', 'En attente') },
    { value: 'approved', label: t('events:registrations.status_approved', 'Approuvé') },
    { value: 'refused', label: t('events:registrations.status_refused', 'Refusé') },
    { value: 'cancelled', label: t('events:registrations.status_cancelled', 'Annulé') },
  ], [t])

  const attendeeTypeOptions = useMemo(
    () => eventAttendeeTypes
      .filter(eat => eat.is_active && eat.attendeeType?.is_active)
      .map(eat => ({
        value: eat.id,
        label: eat.attendeeType.name,
        color: eat.color_hex || eat.attendeeType.color_hex,
      })),
    [eventAttendeeTypes],
  )

  const standardFields = useMemo(() => formFields.filter(f => !isCustomField(f)), [formFields])
  const customFields = useMemo(() => formFields.filter(f => isCustomField(f)), [formFields])
  const hasFormFields = formFields.length > 0

  // â”€â”€â”€ Extra answer keys not covered by form config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const extraAnswerKeys = useMemo(() => {
    if (!hasFormFields) return []
    const customLabels = new Set(customFields.map(f => f.label))
    return Object.keys(answersData).filter(k => !customLabels.has(k))
  }, [hasFormFields, customFields, answersData])

  // â”€â”€â”€ Init state from registration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const stdData: Record<string, string> = {}
    for (const [key, config] of Object.entries(STANDARD_FIELD_MAP)) {
      stdData[key] = config.getter(registration)
    }
    setAttendeeData(stdData)

    // Build answers map: init all known keys, then overlay actual values
    const ans: Record<string, unknown> = {}
    for (const key of allAnswerKeys) {
      ans[key] = ''
    }
    if (registration.answers) {
      for (const [key, value] of Object.entries(registration.answers)) {
        ans[key] = value ?? ''
      }
    }
    setAnswersData(ans)

    setStatus(registration.status || 'awaiting')
    setEventAttendeeTypeId(registration.eventAttendeeType?.id || '')
    setTableChoiceId(registration.tableChoiceId || '')
    setAssignedTableId(registration.assignedTableId || '')
    setComment(registration.comment || '')
    // allAnswerKeys is stable (memoized by parent) â€” safe as dependency
  }, [registration, allAnswerKeys])

  // â”€â”€â”€ Submit handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    const updateData: RegistrationUpdatePayload = {}

    // Only send attendee data if something actually changed
    const attendeeDiff: Record<string, string> = {}
    for (const [key, value] of Object.entries(attendeeData)) {
      const config = STANDARD_FIELD_MAP[key]
      if (config && value !== config.getter(registration)) {
        attendeeDiff[config.apiField] = value
      }
    }
    if (Object.keys(attendeeDiff).length > 0) {
      updateData.attendee = attendeeDiff
    }

    // Only send answers if something changed
    const originalAnswers = registration.answers ?? {}
    const answersDiff: Record<string, unknown> = {}
    let answersChanged = false
    for (const [key, value] of Object.entries(answersData)) {
      const original = originalAnswers[key as keyof typeof originalAnswers] ?? ''
      if (JSON.stringify(value) !== JSON.stringify(original)) {
        answersChanged = true
      }
      answersDiff[key] = value
    }
    if (answersChanged) {
      updateData.answers = answersDiff
    }

    // Registration-level fields â€” only send if changed
    if (status !== (registration.status || 'awaiting')) {
      updateData.status = status
    }

    const currentTypeId = registration.eventAttendeeType?.id || ''
    if (eventAttendeeTypeId !== currentTypeId) {
      updateData.eventAttendeeTypeId = eventAttendeeTypeId || null
    }

    if (tableChoiceId !== (registration.tableChoiceId || '')) {
      updateData.tableChoiceId = tableChoiceId || null
    }

    if (assignedTableId !== (registration.assignedTableId || '')) {
      updateData.assignedTableId = assignedTableId || null
    }

    if (comment !== (registration.comment || '')) {
      updateData.comment = comment
    }

    await onSave(updateData)
  }, [attendeeData, answersData, status, eventAttendeeTypeId, tableChoiceId, assignedTableId, comment, registration, onSave])

  // â”€â”€â”€ Render helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renderStandardField = (field: FormField) => {
    const key = ('key' in field && field.key) || ('attendeeField' in field && field.attendeeField) || field.id
    const config = STANDARD_FIELD_MAP[key]
    if (!config) return null

    const isRequired = field.required || key === 'email'

    return (
      <div key={field.id} className={field.width === 'half' ? '' : 'col-span-2'}>
        <label className={LABEL_CLASSES}>
          {field.label}
          {isRequired && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
        <input
          type={config.inputType || 'text'}
          required={isRequired}
          value={attendeeData[key] || ''}
          onChange={(e) => setAttendeeData(prev => ({ ...prev, [key]: e.target.value }))}
          placeholder={field.placeholder || ''}
          className={INPUT_CLASSES}
        />
      </div>
    )
  }

  const renderCustomField = (field: FormField) => {
    if (!isCustomField(field)) return null
    const label = field.label
    const rawValue = answersData[label]
    const value = rawValue ?? ''

    const handleChange = (newValue: unknown) => {
      setAnswersData(prev => ({ ...prev, [label]: newValue }))
    }

    // Safe string coercion for text inputs
    const strValue = typeof value === 'string' ? value : String(value)

    switch (field.fieldType) {
      case 'textarea':
        return (
          <div key={field.id} className={field.width === 'half' ? '' : 'col-span-2'}>
            <label className={LABEL_CLASSES}>
              {field.label}
              {field.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
            </label>
            <textarea
              value={strValue}
              onChange={(e) => handleChange(e.target.value)}
              required={field.required}
              placeholder={field.placeholder || ''}
              rows={3}
              className={INPUT_CLASSES}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className={field.width === 'half' ? '' : 'col-span-2'}>
            <label className={LABEL_CLASSES}>
              {field.label}
              {field.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
            </label>
            <select
              value={strValue}
              onChange={(e) => handleChange(e.target.value)}
              required={field.required}
              className={INPUT_CLASSES}
            >
              <option value="">{field.placeholder || 'Sélectionner...'}</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )

      case 'radio':
        return (
          <div key={field.id} className={field.width === 'half' ? '' : 'col-span-2'}>
            <label className={LABEL_CLASSES}>
              {field.label}
              {field.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
            </label>
            <div className="flex flex-wrap gap-3 mt-1">
              {field.options?.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name={`radio_${field.id}`}
                    value={opt.value}
                    checked={strValue === opt.value}
                    onChange={(e) => handleChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id} className={field.width === 'half' ? '' : 'col-span-2'}>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={value === true || value === 'true'}
                onChange={(e) => handleChange(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              {field.checkboxText || field.label}
            </label>
          </div>
        )

      case 'multiselect':
        return (
          <div key={field.id} className={field.width === 'half' ? '' : 'col-span-2'}>
            <label className={LABEL_CLASSES}>
              {field.label}
              {field.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {field.options?.map(opt => {
                const selected = Array.isArray(value) ? (value as string[]).includes(opt.value) : false
                return (
                  <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => {
                        const current = Array.isArray(value) ? [...value] as string[] : []
                        if (e.target.checked) {
                          handleChange([...current, opt.value])
                        } else {
                          handleChange(current.filter(v => v !== opt.value))
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    {opt.label}
                  </label>
                )
              })}
            </div>
          </div>
        )

      case 'number':
        return (
          <div key={field.id} className={field.width === 'half' ? '' : 'col-span-2'}>
            <label className={LABEL_CLASSES}>
              {field.label}
              {field.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={strValue}
              onChange={(e) => handleChange(e.target.value)}
              required={field.required}
              placeholder={field.placeholder || ''}
              className={INPUT_CLASSES}
            />
          </div>
        )

      case 'date':
        return (
          <div key={field.id} className={field.width === 'half' ? '' : 'col-span-2'}>
            <label className={LABEL_CLASSES}>
              {field.label}
              {field.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={strValue}
              onChange={(e) => handleChange(e.target.value)}
              required={field.required}
              className={INPUT_CLASSES}
            />
          </div>
        )

      // text, email, phone — text input
      default:
        return (
          <div key={field.id} className={field.width === 'half' ? '' : 'col-span-2'}>
            <label className={LABEL_CLASSES}>
              {field.label}
              {field.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
            </label>
            <input
              type={field.fieldType === 'email' ? 'email' : field.fieldType === 'phone' ? 'tel' : 'text'}
              value={strValue}
              onChange={(e) => handleChange(e.target.value)}
              required={field.required}
              placeholder={field.placeholder || ''}
              className={INPUT_CLASSES}
            />
          </div>
        )
    }
  }

  // Fallback: if no formFields provided, show default fields
  const renderDefaultFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASSES}>{t('events:registrations.first_name')}</label>
          <input
            type="text"
            value={attendeeData.first_name || ''}
            onChange={(e) => setAttendeeData(prev => ({ ...prev, first_name: e.target.value }))}
            className={INPUT_CLASSES}
          />
        </div>
        <div>
          <label className={LABEL_CLASSES}>{t('events:registrations.last_name')}</label>
          <input
            type="text"
            value={attendeeData.last_name || ''}
            onChange={(e) => setAttendeeData(prev => ({ ...prev, last_name: e.target.value }))}
            className={INPUT_CLASSES}
          />
        </div>
      </div>
      <div>
        <label className={LABEL_CLASSES}>
          {t('events:registrations.email_field')} <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input
          type="email"
          required
          value={attendeeData.email || ''}
          onChange={(e) => setAttendeeData(prev => ({ ...prev, email: e.target.value }))}
          className={INPUT_CLASSES}
        />
      </div>
      <div>
        <label className={LABEL_CLASSES}>{t('events:registrations.phone_field')}</label>
        <input
          type="tel"
          value={attendeeData.phone || ''}
          onChange={(e) => setAttendeeData(prev => ({ ...prev, phone: e.target.value }))}
          className={INPUT_CLASSES}
        />
      </div>
      <div>
        <label className={LABEL_CLASSES}>{t('events:registrations.company_field')}</label>
        <input
          type="text"
          value={attendeeData.company || ''}
          onChange={(e) => setAttendeeData(prev => ({ ...prev, company: e.target.value }))}
          className={INPUT_CLASSES}
        />
      </div>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('events:registrations.edit_title')}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">

        {/* 1. Person info (standard fields) */}
        {hasFormFields ? (
          <>
            {standardFields.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {standardFields.map(renderStandardField)}
              </div>
            )}
          </>
        ) : (
          renderDefaultFields()
        )}

        {/* 2. Status & Type */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className={LABEL_CLASSES}>{t('events:registrations.header_status', 'Statut')}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={INPUT_CLASSES}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Attendee Type */}
            <div>
              <label className={LABEL_CLASSES}>{t('events:registrations.header_type', 'Type')}</label>
              <select
                value={eventAttendeeTypeId}
                onChange={(e) => setEventAttendeeTypeId(e.target.value)}
                className={INPUT_CLASSES}
              >
                <option value="">{t('events:registrations.filter_none', 'Aucun')}</option>
                {attendeeTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Tables (only if event has tables) */}
        {eventTables.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Table Choice */}
              <div>
                <label className={LABEL_CLASSES}>{t('events:registrations.header_table_choice', 'Table choisie')}</label>
                <select
                  value={tableChoiceId}
                  onChange={(e) => setTableChoiceId(e.target.value)}
                  className={INPUT_CLASSES}
                >
                  <option value="">{t('events:registrations.filter_none', 'Aucune')}</option>
                  {eventTables.map(tbl => (
                    <option key={tbl.id} value={tbl.id}>{tbl.name}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Table */}
              <div>
                <label className={LABEL_CLASSES}>{t('events:registrations.header_assigned_table', 'Table assignée')}</label>
                <select
                  value={assignedTableId}
                  onChange={(e) => setAssignedTableId(e.target.value)}
                  className={INPUT_CLASSES}
                >
                  <option value="">{t('events:registrations.filter_none', 'Aucune')}</option>
                  {eventTables.map(tbl => (
                    <option key={tbl.id} value={tbl.id}>{tbl.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 4. Custom fields & extra data */}
        {hasFormFields && customFields.length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                {t('events:registrations.custom_fields', 'Champs personnalisés')}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {customFields.map(renderCustomField)}
            </div>
          </>
        )}

        {/* Extra answers not in form config (e.g. from imports) */}
        {hasFormFields && extraAnswerKeys.length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                {t('events:registrations.additional_data', 'Données supplémentaires')}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {extraAnswerKeys.map(key => (
                <div key={key} className="col-span-2">
                  <label className={LABEL_CLASSES}>{key}</label>
                  <input
                    type="text"
                    value={String(answersData[key] ?? '')}
                    onChange={(e) => setAnswersData(prev => ({ ...prev, [key]: e.target.value }))}
                    className={INPUT_CLASSES}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* 5. Comment (always last) */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <label className={LABEL_CLASSES}>{t('events:registrations.comment', 'Commentaire')}</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('events:registrations.comment_placeholder', 'Ajouter un commentaire...')}
            rows={2}
            className={INPUT_CLASSES}
          />
        </div>

      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('common:app.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common:app.saving') : t('common:app.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
