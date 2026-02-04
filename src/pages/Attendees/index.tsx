import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetAttendeesQuery,
  useBulkExportAttendeesMutation,
} from '@/features/attendees/api/attendeesApi'
import { useSelector, useDispatch } from 'react-redux'
import { useToast } from '@/shared/hooks/useToast'
import {
  selectAttendeesFilters,
  selectAttendeesActiveTab,
  setActiveTab,
  setFilters,
} from '@/features/attendees/model/attendeesSlice'
import { AttendeeTable } from '@/features/attendees/ui/AttendeeTable'
import { AttendeeFilters } from '@/features/attendees/ui/AttendeeFilters'
import { Can } from '@/shared/acl/guards/Can'
import { ProtectedPage } from '@/shared/acl/guards/ProtectedPage'
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

const AttendeesPage: React.FC = () => {
  const { t } = useTranslation(['attendees', 'common'])
  const dispatch = useDispatch()
  const toast = useToast()
  const filters = useSelector(selectAttendeesFilters)
  const activeTab = useSelector(selectAttendeesActiveTab)

  const {
    data: attendeesResponse,
    isLoading,
    error,
  } = useGetAttendeesQuery(filters)

  // Hook pour récupérer tous les IDs lors de l'export global
  const { data: allAttendeesForExport } = useGetAttendeesQuery({
    page: 1,
    pageSize: 10000,
    isActive: activeTab === 'active',
  })

  const [bulkExportAttendees] = useBulkExportAttendeesMutation()

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

  // Fonction pour exporter tous les attendees
  const handleExportAll = async () => {
    console.log('🔵 handleExportAll appelé (Attendees)', {
      hasData: !!allAttendeesForExport?.data,
    })

    if (!allAttendeesForExport?.data) {
      console.warn('⚠️ Pas de données à exporter')
      toast.error('Aucun participant à exporter')
      return
    }

    try {
      const allIds = allAttendeesForExport.data.map((att) => att.id)
      console.log('📊 IDs à exporter:', allIds.length)

      if (allIds.length === 0) {
        toast.info('Aucun participant à exporter')
        return
      }

      toast.info(`Export de ${allIds.length} participant(s) en cours...`)

      const response = await bulkExportAttendees({
        ids: allIds,
        format: 'xlsx',
      }).unwrap()

      console.log('✅ Réponse export reçue:', response)

      // Télécharger le fichier
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = response.downloadUrl
      a.download = response.filename || 'participants.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(response.downloadUrl)

      toast.success(`${allIds.length} participant(s) exporté(s) avec succès`)
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'export:', error)
      console.error('❌ Détails erreur:', {
        status: error?.status,
        data: error?.data,
        message: error?.data?.message,
      })
      toast.error(
        error?.data?.message || 'Erreur lors de l\'export des participants'
      )
    }
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
                onClick={() => {
                  console.log('🖱️ Bouton Export (Attendees) cliqué')
                  handleExportAll()
                }}
              >
                {t('attendees.export')}
              </Button>
            </Can>
          </ActionGroup>
        }
      />

      <PageSection spacing="lg">
        <AttendeeFilters resultCount={meta.total} />
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
              currentPage={filters.page || 1}
              pageSize={filters.pageSize || 50}
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

export const Attendees: React.FC = () => (
  <ProtectedPage
    action="read"
    subject="Attendee"
    deniedTitle="Accès aux participants refusé"
    deniedMessage="Vous n'avez pas les permissions nécessaires pour consulter les participants."
  >
    <AttendeesPage />
  </ProtectedPage>
)
