import React from 'react'
import { CheckCircle, Clock, XCircle, Edit, Trash2 } from 'lucide-react'
import type { AttendeeDPO } from '../dpo/attendee.dpo'
import { formatDate } from '@/shared/lib/utils'
import { Can } from '@/shared/acl/guards/Can'
import { Button } from '@/shared/ui/Button'

interface AttendeeTableProps {
  attendees: AttendeeDPO[]
  isLoading: boolean
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'checked_in':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'confirmed':
      return <CheckCircle className="h-4 w-4 text-blue-600" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 'cancelled':
    case 'no_show':
      return <XCircle className="h-4 w-4 text-red-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

const getStatusBadge = (status: string) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  switch (status) {
    case 'checked_in':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'confirmed':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'cancelled':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'no_show':
      return `${baseClasses} bg-gray-100 text-gray-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

export const AttendeeTable: React.FC<AttendeeTableProps> = ({ attendees, isLoading }) => {
  // const { t } = useTranslation('attendees')

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (attendees.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>Aucun participant trouvé</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Participant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Entreprise
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Inscription
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
          {attendees.map((attendee) => (
            <tr key={attendee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {attendee.displayName}
                    </div>
                    {attendee.jobTitle && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {attendee.jobTitle}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">{attendee.email}</div>
                {attendee.phone && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{attendee.phone}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {attendee.company || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getStatusIcon(attendee.status)}
                  <span className={`ml-2 ${getStatusBadge(attendee.status)}`}>
                    {attendee.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatDate(attendee.registrationDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {attendee.canCheckIn && (
                    <Can do="checkin" on="Attendee" data={attendee}>
                      <Button size="sm" variant="outline">
                        Check-in
                      </Button>
                    </Can>
                  )}
                  <Can do="update" on="Attendee" data={attendee}>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Can>
                  <Can do="delete" on="Attendee" data={attendee}>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Can>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
