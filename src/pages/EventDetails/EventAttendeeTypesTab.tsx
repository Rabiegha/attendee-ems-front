import { useGetAttendeeTypesQuery } from '@/features/attendee-types/api/attendeeTypesApi'
import {
  useGetEventAttendeeTypesQuery,
  useAddEventAttendeeTypeMutation,
  useRemoveEventAttendeeTypeMutation,
} from '@/features/events/api/eventsApi'
import { EventDPO } from '@/features/events/dpo/event.dpo'
import { Loader2, Check } from 'lucide-react'
import { useToast } from '@/shared/hooks/useToast'

interface EventAttendeeTypesTabProps {
  event: EventDPO
}

export const EventAttendeeTypesTab = ({ event }: EventAttendeeTypesTabProps) => {
  const toast = useToast()
  const orgId = event.orgId

  const { data: globalTypes, isLoading: isLoadingGlobal } = useGetAttendeeTypesQuery(orgId, {
    skip: !orgId,
  })

  const { data: eventTypes, isLoading: isLoadingEvent } = useGetEventAttendeeTypesQuery(event.id)

  const [addType] = useAddEventAttendeeTypeMutation()
  const [removeType] = useRemoveEventAttendeeTypeMutation()

  if (isLoadingGlobal || isLoadingEvent) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const handleToggle = async (typeId: string, eventTypeId?: string) => {
    try {
      if (eventTypeId) {
        await removeType({ eventId: event.id, eventAttendeeTypeId: eventTypeId }).unwrap()
        toast.success('Type de participant retiré')
      } else {
        await addType({ eventId: event.id, attendeeTypeId: typeId }).unwrap()
        toast.success('Type de participant ajouté')
      }
    } catch (error) {
      toast.error("Une erreur est survenue")
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Types de participants
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Sélectionnez les types de participants disponibles pour cet événement.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalTypes?.map((type) => {
            const eventType = eventTypes?.find((et) => et.attendee_type_id === type.id)
            const isSelected = !!eventType

            return (
              <div
                key={type.id}
                onClick={() => handleToggle(type.id, eventType?.id)}
                className={`
                  relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div
                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: type.color_hex || '#9ca3af' }}
                />
                <span className="font-medium text-gray-900 dark:text-white flex-1">
                  {type.name}
                </span>
                
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-blue-500" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
