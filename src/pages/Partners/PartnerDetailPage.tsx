/**
 * PartnerDetailPage - Détail d'un partenaire avec ses leads
 *
 * Affiche les informations du partenaire et la liste de ses scans.
 */

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Users,
  Mail,
  Building2,
  Phone,
  Calendar,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  PageContainer,
  PageHeader,
  PageSection,
  Tabs,
  type TabItem,
} from '@/shared/ui'
import { useGetPartnerByIdQuery } from '@/features/partners/api/partnersApi'
import {
  useGetAllPartnerScansQuery,
  type PartnerScansAllQueryParams,
} from '@/features/partner-scans/api/partnerScansApi'
import { PartnerScansTable } from '@/features/partner-scans/ui/PartnerScansTable'
import { ROUTES } from '@/app/config/constants'
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner'

export const PartnerDetailPage: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')

  const isActive = activeTab === 'active'

  // Données du partenaire
  const { data: partner, isLoading: isLoadingPartner } = useGetPartnerByIdQuery(
    partnerId!,
    { skip: !partnerId },
  )

  // Scans du partenaire
  const scansQueryParams: PartnerScansAllQueryParams = {
    page,
    limit: pageSize,
    is_active: isActive,
  }
  if (search) scansQueryParams.search = search
  if (partnerId) scansQueryParams.user_id = partnerId

  const { data: scansData, isLoading: isLoadingScans, refetch } = useGetAllPartnerScansQuery(
    scansQueryParams,
    { skip: !partnerId },
  )

  // Compteurs pour les onglets
  const activeCountParams: PartnerScansAllQueryParams = {
    page: 1,
    limit: 1,
    is_active: true,
  }
  if (partnerId) activeCountParams.user_id = partnerId

  const deletedCountParams: PartnerScansAllQueryParams = {
    page: 1,
    limit: 1,
    is_active: false,
  }
  if (partnerId) deletedCountParams.user_id = partnerId

  const { data: activeCountData } = useGetAllPartnerScansQuery(
    activeCountParams,
    { skip: !partnerId },
  )

  const { data: deletedCountData } = useGetAllPartnerScansQuery(
    deletedCountParams,
    { skip: !partnerId },
  )

  if (isLoadingPartner) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </PageContainer>
    )
  }

  if (!partner) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">Partenaire introuvable</p>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.PARTNERS)}
            className="mt-4"
          >
            {t('partners.detail_back')}
          </Button>
        </div>
      </PageContainer>
    )
  }

  const fullName = [partner.first_name, partner.last_name].filter(Boolean).join(' ') || partner.email
  const initials = [partner.first_name?.[0], partner.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'active' | 'deleted')
    setPage(1)
    setSearch('')
  }

  const tabs: TabItem[] = [
    {
      id: 'active',
      label: t('partner_scans.tab_active'),
      count: activeCountData?.meta?.total || 0,
    },
    {
      id: 'deleted',
      label: t('partner_scans.tab_deleted'),
      count: deletedCountData?.meta?.total || 0,
    },
  ]

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      {/* Bouton retour + header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.PARTNERS)}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="mb-4 -ml-2"
        >
          {t('partners.detail_back')}
        </Button>

        <PageHeader
          title={fullName}
          description={t('partners.detail_subtitle')}
          icon={Users}
        />
      </div>

      {/* Carte info partenaire */}
      <PageSection spacing="lg">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                  {initials}
                </span>
              </div>

              {/* Infos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                    <div className="text-gray-900 dark:text-white">{partner.email}</div>
                  </div>
                </div>

                {partner.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('partners.col_company')}
                      </div>
                      <div className="text-gray-900 dark:text-white">{partner.company}</div>
                    </div>
                  </div>
                )}

                {partner.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('partners.col_phone')}
                      </div>
                      <div className="text-gray-900 dark:text-white">{partner.phone}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('partners.col_created_at')}
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {new Date(partner.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Titre section scans */}
      <PageSection spacing="lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('partners.detail_scans_title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('partners.detail_scans_subtitle')}
        </p>
      </PageSection>

      {/* Table des scans du partenaire */}
      <PartnerScansTable
        scans={scansData?.data ?? []}
        isLoading={isLoadingScans}
        showEventColumn={true}
        isDeletedTab={!isActive}
        totalItems={scansData?.meta?.total}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        onSearchChange={handleSearchChange}
        onRefresh={() => refetch()}
        tabsElement={
          <Tabs
            items={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        }
      />
    </PageContainer>
  )
}
