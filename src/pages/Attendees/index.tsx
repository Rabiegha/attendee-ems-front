import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAttendeesQuery } from '@/features/attendees/api/attendeesApi'
import { useSelector } from 'react-redux'
import { selectAttendeesFilters } from '@/features/attendees/model/attendeesSlice'
import { AttendeeTable } from '@/features/attendees/ui/AttendeeTable'
import { AttendeeFilters } from '@/features/attendees/ui/AttendeeFilters'
import { Can } from '@/shared/acl/guards/Can'
import { Button } from '@/shared/ui/Button'
import { Plus, Download } from 'lucide-react'

export const Attendees: React.FC = () => {
  const { t } = useTranslation(['attendees', 'common'])
  const filters = useSelector(selectAttendeesFilters)
  
  const { data: attendees = [], isLoading, error } = useGetAttendeesQuery(filters)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('attendees.title')}
        </h1>
        <div className="flex items-center space-x-3">
          <Can do="export" on="Attendee">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>{t('attendees.export')}</span>
            </Button>
          </Can>
          <Can do="create" on="Attendee">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{t('attendees.create')}</span>
            </Button>
          </Can>
        </div>
      </div>

      <AttendeeFilters />

      <div className="bg-white rounded-lg border">
        {error ? (
          <div className="p-6 text-center">
            <p className="text-red-600">Erreur lors du chargement des participants</p>
          </div>
        ) : (
          <AttendeeTable attendees={attendees} isLoading={isLoading} />
        )}
      </div>
    </div>
  )
}
