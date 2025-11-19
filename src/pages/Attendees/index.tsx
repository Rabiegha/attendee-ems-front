import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAttendeesQuery } from '@/features/attendees/api/attendeesApi'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectAttendeesFilters,
  selectAttendeesActiveTab,
  setActiveTab,
  setFilters,
} from '@/features/attendees/model/attendeesSlice'
import { AttendeeTable } from '@/features/attendees/ui/AttendeeTable'
import { AttendeeFilters } from '@/features/attendees/ui/AttendeeFilters'
import { Can } from '@/shared/acl/guards/Can'
import {
  Button,
  PageContainer,
  PageHeader,
  PageSection,
  Card,
  CardContent,
  ActionGroup,
  Tabs,
  Pagination,
  type TabItem,
} from '@/shared/ui'
import { Plus, Download, Users } from 'lucide-react'

export const Attendees: React.FC = () => {
  const { t } = useTranslation(['attendees', 'common'])
  const dispatch = useDispatch()
  const filters = useSelector(selectAttendeesFilters)
  const activeTab = useSelector(selectAttendeesActiveTab)

  const {
    data: attendeesResponse,
    isLoading,
    error,
  } = useGetAttendeesQuery(filters)

  // Query for stats (active attendees count)
  const { data: activeStatsResponse } = useGetAttendeesQuery({
    page: 1,
    pageSize: 1,
    isActive: true,
  })

  // Query for stats (deleted attendees count)
  const { data: deletedStatsResponse } = useGetAttendeesQuery({
    page: 1,
    pageSize: 1,
    isActive: false,
  })

  const attendees = attendeesResponse?.data || []
  const meta = attendeesResponse?.meta || {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  }

  // Calculate stats from separate queries
  const stats = {
    active: activeStatsResponse?.meta?.total || 0,
    deleted: deletedStatsResponse?.meta?.total || 0,
  }

  // Configure tabs
  const tabs: TabItem[] = [
    {
      id: 'active',
      label: 'Participants actifs',
      count: stats.active,
    },
    {
      id: 'deleted',
      label: 'Participants supprimés',
      count: stats.deleted,
    },
  ]

  const handleTabChange = (tabId: string) => {
    dispatch(setActiveTab(tabId as 'active' | 'deleted'))
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    dispatch(setFilters({ pageSize, page: 1 }))
  }

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader
        title={t('attendees.title')}
        description="Gérez les participants inscrits à vos événements"
        icon={Users}
        actions={
          <ActionGroup align="right" spacing="md">
            <Can do="export" on="Attendee">
              <Button
                variant="outline"
                leftIcon={<Download className="h-4 w-4" />}
              >
                {t('attendees.export')}
              </Button>
            </Can>
            <Can do="create" on="Attendee">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                {t('attendees.create')}
              </Button>
            </Can>
          </ActionGroup>
        }
      />

      <PageSection spacing="lg">
        <AttendeeFilters />
      </PageSection>

      <PageSection spacing="lg">
        <Card variant="default" padding="none">
          {error ? (
            <div className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400">
                Erreur lors du chargement des participants
              </p>
            </div>
          ) : (
            <AttendeeTable
              attendees={attendees}
              isLoading={isLoading}
              isDeletedTab={activeTab === 'deleted'}
              tabsElement={
                <Tabs
                  items={tabs}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              }
              // Server-side pagination
              currentPage={meta.page}
              pageSize={meta.pageSize}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </Card>
      </PageSection>
    </PageContainer>
  )
}
