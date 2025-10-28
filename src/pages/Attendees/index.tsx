import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAttendeesQuery } from '@/features/attendees/api/attendeesApi'
import { useSelector, useDispatch } from 'react-redux'
import { 
  selectAttendeesFilters, 
  selectAttendeesActiveTab, 
  setActiveTab 
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
  type TabItem
} from '@/shared/ui'
import { Plus, Download, Users } from 'lucide-react'

export const Attendees: React.FC = () => {
  const { t } = useTranslation(['attendees', 'common'])
  const dispatch = useDispatch()
  const filters = useSelector(selectAttendeesFilters)
  const activeTab = useSelector(selectAttendeesActiveTab)
  
  const { data: attendees = [], isLoading, error } = useGetAttendeesQuery(filters)

  // Configure tabs
  const tabs: TabItem[] = [
    {
      id: 'active',
      label: 'Participants actifs',
      ...(activeTab === 'active' && { count: attendees.length })
    },
    {
      id: 'deleted',
      label: 'Participants supprimés',
      ...(activeTab === 'deleted' && { count: attendees.length })
    }
  ]

  const handleTabChange = (tabId: string) => {
    dispatch(setActiveTab(tabId as 'active' | 'deleted'))
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
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
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
          <Tabs 
            items={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            className="px-6 pt-6"
          />
          <CardContent>
            {error ? (
              <div className="p-6 text-center">
                <p className="text-red-600 dark:text-red-400">Erreur lors du chargement des participants</p>
              </div>
            ) : (
              <AttendeeTable 
                attendees={attendees} 
                isLoading={isLoading}
                isDeletedTab={activeTab === 'deleted'}
              />
            )}
          </CardContent>
        </Card>
      </PageSection>
    </PageContainer>
  )
}
