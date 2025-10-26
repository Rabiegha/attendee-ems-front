import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAttendeesQuery } from '@/features/attendees/api/attendeesApi'
import { useSelector } from 'react-redux'
import { selectAttendeesFilters } from '@/features/attendees/model/attendeesSlice'
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
  ActionGroup
} from '@/shared/ui'
import { Plus, Download, Users } from 'lucide-react'

export const Attendees: React.FC = () => {
  const { t } = useTranslation(['attendees', 'common'])
  const filters = useSelector(selectAttendeesFilters)
  
  const { data: attendees = [], isLoading, error } = useGetAttendeesQuery(filters)

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
          <CardContent>
            {error ? (
              <div className="p-6 text-center">
                <p className="text-red-600 dark:text-red-400">Erreur lors du chargement des participants</p>
              </div>
            ) : (
              <AttendeeTable attendees={attendees} isLoading={isLoading} />
            )}
          </CardContent>
        </Card>
      </PageSection>
    </PageContainer>
  )
}
