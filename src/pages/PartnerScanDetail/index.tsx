import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  MessageSquare,
  Save,
  Clock,
  Briefcase,
  Globe,
} from 'lucide-react'
import {
  useGetPartnerScanQuery,
  useUpdatePartnerScanMutation,
} from '@/features/partner-scans/api/partnerScansApi'
import {
  Button,
  PageContainer,
  Card,
  CardContent,
} from '@/shared/ui'
import { useToast } from '@/shared/hooks/useToast'

export const PartnerScanDetail: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['common'])
  const toast = useToast()
  const locale = i18n.language === 'fr' ? fr : enUS

  const {
    data: scan,
    isLoading,
    error,
  } = useGetPartnerScanQuery(scanId!, { skip: !scanId })

  const [updateScan, { isLoading: isUpdating }] = useUpdatePartnerScanMutation()

  const [comment, setComment] = useState('')
  const [hasChanged, setHasChanged] = useState(false)

  useEffect(() => {
    if (scan?.comment != null) {
      setComment(scan.comment)
    }
  }, [scan?.comment])

  const handleCommentChange = (value: string) => {
    setComment(value)
    setHasChanged(value !== (scan?.comment || ''))
  }

  const handleSaveComment = async () => {
    if (!scanId) return
    try {
      await updateScan({ id: scanId, comment }).unwrap()
      setHasChanged(false)
      toast.success(t('common:partner_scans.detail_note_saved'))
    } catch (err) {
      toast.error(t('common:partner_scans.detail_note_save_error'))
    }
  }

  if (!scanId) {
    navigate('/my-contacts')
    return null
  }

  if (isLoading) {
    return (
      <PageContainer maxWidth="4xl" padding="lg">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </PageContainer>
    )
  }

  if (error || !scan) {
    return (
      <PageContainer maxWidth="4xl" padding="lg">
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('common:partner_scans.detail_not_found')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('common:partner_scans.detail_not_found_message')}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/my-contacts')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            {t('common:partner_scans.detail_back')}
          </Button>
        </div>
      </PageContainer>
    )
  }

  const d = scan.attendee_data
  const fullName = `${d?.first_name || ''} ${d?.last_name || ''}`.trim() || t('common:partner_scans.detail_unknown_contact')
  const initials = fullName === t('common:partner_scans.detail_unknown_contact')
    ? '?'
    : fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEEE dd MMMM yyyy à HH:mm', { locale })
    } catch {
      return dateStr
    }
  }

  return (
    <PageContainer maxWidth="4xl" padding="lg">
      <div className="space-y-6">
        {/* Back button + title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {initials}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {fullName}
              </h1>
              {d?.company && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {d.job_title ? `${d.job_title} — ` : ''}{d.company}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Informations de contact */}
        <Card variant="default" padding="lg">
          <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('common:partner_scans.detail_contact_info')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              {d?.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('common:partner_scans.detail_email')}</p>
                    <a
                      href={`mailto:${d.email}`}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block"
                    >
                      {d.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {d?.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('common:partner_scans.detail_phone')}</p>
                    <a
                      href={`tel:${d.phone}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:underline"
                    >
                      {d.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Company */}
              {d?.company && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('common:partner_scans.detail_company')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {d.company}
                    </p>
                  </div>
                </div>
              )}

              {/* Job title */}
              {d?.job_title && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Briefcase className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('common:partner_scans.detail_job_title')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {d.job_title}
                    </p>
                  </div>
                </div>
              )}

              {/* Country */}
              {d?.country && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                    <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('common:partner_scans.detail_country')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {d.country}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contexte du scan */}
        <Card variant="default" padding="lg">
          <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('common:partner_scans.detail_scan_context')}
            </h2>
            <div className="space-y-3">
              {/* Event */}
              {scan.event && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('common:partner_scans.detail_event')} : <span className="font-medium">{scan.event.name}</span>
                  </span>
                </div>
              )}

              {/* Date du scan */}
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('common:partner_scans.detail_scanned_at')} : <span className="font-medium">{formatDate(scan.scanned_at)}</span>
                </span>
              </div>

              {/* Statut inscription */}
              {d?.registration_status && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('common:partner_scans.detail_status')} : <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      d.registration_status === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : d.registration_status === 'awaiting'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {d.registration_status}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Note / Commentaire éditable */}
        <Card variant="default" padding="lg">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                {t('common:partner_scans.detail_my_note')}
              </h2>
              {hasChanged && (
                <Button
                  size="sm"
                  onClick={handleSaveComment}
                  disabled={isUpdating}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  {isUpdating ? t('common:partner_scans.detail_saving') : t('common:partner_scans.detail_save')}
                </Button>
              )}
            </div>
            <textarea
              value={comment}
              onChange={(e) => handleCommentChange(e.target.value)}
              placeholder={t('common:partner_scans.detail_note_placeholder')}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {t('common:partner_scans.detail_note_private')}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
