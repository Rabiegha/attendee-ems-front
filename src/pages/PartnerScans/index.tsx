import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Users, Download } from 'lucide-react'
import { PageContainer } from '@/shared/ui/PageContainer'
import { PageHeader, Tabs, Button, type TabItem } from '@/shared/ui'
import { useGetAllPartnerScansQuery, useLazyExportPartnerScansExcelQuery } from '@/features/partner-scans/api/partnerScansApi'
import { PartnerScansTable } from '@/features/partner-scans/ui/PartnerScansTable'
import { useToast } from '@/shared/hooks/useToast'
import { selectUserRoles } from '@/features/auth/model/sessionSlice'

export const PartnerScansPage: React.FC = () => {
  const { t } = useTranslation(['common'])
  const userRoles = useSelector(selectUserRoles)
  const isPartner = userRoles.includes('PARTNER')
  const toast = useToast()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')

  const isActive = activeTab === 'active'

  // Requête principale — contacts actifs ou supprimés
  const { data, isLoading, refetch } = useGetAllPartnerScansQuery({
    page,
    limit: pageSize,
    search: search || undefined,
    is_active: isActive,
  })

  // Compteurs pour les tabs (requêtes sans search pour avoir le total réel)
  const { data: activeCountData } = useGetAllPartnerScansQuery({
    page: 1,
    limit: 1,
    is_active: true,
  })
  const { data: deletedCountData } = useGetAllPartnerScansQuery({
    page: 1,
    limit: 1,
    is_active: false,
  })

  // Export Excel
  const [triggerExport] = useLazyExportPartnerScansExcelQuery()

  const handleExport = useCallback(async () => {
    try {
      const result = await triggerExport({}).unwrap()
      const url = URL.createObjectURL(result)
      const a = document.createElement('a')
      a.href = url
      a.download = `${isPartner ? 'mes-contacts' : 'leads-partenaires'}-${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(t('common:partner_scans.export_downloaded'))
    } catch {
      toast.error(t('common:partner_scans.export_error'))
    }
  }, [triggerExport, toast])

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
      label: t('common:partner_scans.tab_active'),
      count: activeCountData?.meta?.total || 0,
    },
    {
      id: 'deleted',
      label: t('common:partner_scans.tab_deleted'),
      count: deletedCountData?.meta?.total || 0,
    },
  ]

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <div className="space-y-6">
        <PageHeader
          title={isPartner ? t('common:partner_scans.page_title') : t('common:partner_scans.page_title_admin')}
          description={isPartner ? t('common:partner_scans.page_subtitle') : t('common:partner_scans.page_subtitle_admin')}
          icon={Users}
          actions={
            <Button
              onClick={handleExport}
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
            >
              {t('common:partner_scans.export')}
            </Button>
          }
        />

        {/* Table avec onglets, export, refresh */}
        <PartnerScansTable
          scans={data?.data ?? []}
          isLoading={isLoading}
          showEventColumn={true}
          isDeletedTab={!isActive}
          totalItems={data?.meta?.total}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          onSearchChange={handleSearchChange}
          onExport={handleExport}
          onRefresh={() => refetch()}
          tabsElement={
            <Tabs
              items={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          }
        />
      </div>
    </PageContainer>
  )
}
