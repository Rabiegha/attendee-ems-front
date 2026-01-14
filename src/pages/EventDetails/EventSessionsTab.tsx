import React, { useState } from 'react'
import { EventDPO } from '@/features/events/dpo/event.dpo'
import { Plus, Calendar, MapPin, Clock, Users as UsersIcon, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Button, Modal } from '@/shared/ui'
import { Skeleton } from '@/shared/ui/Skeleton'
import {
  useGetEventSessionsQuery,
  useGetEventSessionHistoryQuery,
  useCreateEventSessionMutation,
  useUpdateEventSessionMutation,
  useDeleteEventSessionMutation,
  type Session,
  type CreateSessionDto,
  type EventAttendeeType
} from '@/features/events/api/eventsApi'
import { useToast } from '@/shared/ui/useToast'

const formatSessionDates = (start: string | Date, end: string | Date) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const isSameDay = startDate.toDateString() === endDate.toDateString();

  const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

  if (isSameDay) {
    return `${startDate.toLocaleDateString('fr-FR', optionsDate)} • ${startDate.toLocaleTimeString('fr-FR', optionsTime)} - ${endDate.toLocaleTimeString('fr-FR', optionsTime)}`;
  } else {
    return `${startDate.toLocaleString('fr-FR', { ...optionsDate, ...optionsTime })} - ${endDate.toLocaleString('fr-FR', { ...optionsDate, ...optionsTime })}`;
  }
};

interface SessionFormProps {
  eventStartDate: string
  eventEndDate: string
  onSubmit: (data: CreateSessionDto) => void
  onCancel: () => void
  initialData?: Session
  eventAttendeeTypes?: EventAttendeeType[]
  isLoadingAttendeeTypes?: boolean
}

const SessionForm: React.FC<SessionFormProps> = ({
  eventStartDate,
  eventEndDate,
  onSubmit,
  onCancel,
  initialData,
  eventAttendeeTypes = [],
  isLoadingAttendeeTypes = false,
}) => {
  const [name, setName] = useState(initialData?.name || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [startDate, setStartDate] = useState(
    initialData?.start_at || eventStartDate
  )
  const [endDate, setEndDate] = useState(initialData?.end_at || eventEndDate)
  const [allowedAttendeeTypes, setAllowedAttendeeTypes] = useState<string[]>(
    initialData?.allowedAttendeeTypes || []
  )
  const [isPrivate, setIsPrivate] = useState(
    (initialData?.allowedAttendeeTypes?.length ?? 0) > 0
  )
  const [capacity, setCapacity] = useState<string>(initialData?.capacity ? String(initialData.capacity) : '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const sessionData: CreateSessionDto = {
      name,
      start_at: startDate,
      end_at: endDate,
      allowedAttendeeTypes: isPrivate ? allowedAttendeeTypes : [],
    }
    if (location) {
      sessionData.location = location
    }
    if (capacity) {
        sessionData.capacity = parseInt(capacity, 10)
    }
    onSubmit(sessionData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nom de la session *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Ex: Conférence d'ouverture"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Lieu (optionnel)
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Ex: Salle A, Bâtiment 1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Capacité (optionnel)
        </label>
        <input
          type="number"
          min="1"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Ex: 50"
        />
        <p className="text-xs text-gray-500 mt-1">Laissez vide pour illimité</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date et heure de début *
          </label>
          <input
            type="datetime-local"
            value={startDate.slice(0, 16)}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date et heure de fin *
          </label>
          <input
            type="datetime-local"
            value={endDate.slice(0, 16)}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Session privée ?
            </label>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Si activé, seuls les types de participants sélectionnés pourront accéder à cette session
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {isPrivate && (
          <>
            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sélectionnez les participants autorisés
            </div>
            {isLoadingAttendeeTypes ? (
              <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-md text-center text-gray-500 dark:text-gray-400">
                Chargement des types...
              </div>
            ) : eventAttendeeTypes.length === 0 ? (
              <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-md text-center text-gray-500 dark:text-gray-400">
                Aucun type de participant configuré pour cet événement
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3">
                {eventAttendeeTypes.map((type) => {
                  const isSelected = allowedAttendeeTypes.includes(type.id)
                  return (
                    <label
                      key={type.id}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAllowedAttendeeTypes([...allowedAttendeeTypes, type.id])
                            } else {
                              setAllowedAttendeeTypes(
                                allowedAttendeeTypes.filter((id) => id !== type.id)
                              )
                            }
                          }}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <div className="flex-1 flex items-center space-x-2">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: type.color_hex || type.attendeeType.color_hex || '#E5E7EB',
                            color: type.text_color_hex || type.attendeeType.text_color_hex || '#1F2937',
                          }}
                        >
                          {type.attendeeType.name}
                        </span>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {initialData ? 'Mettre à jour' : 'Créer la session'}
        </Button>
      </div>
    </form>
  )
}

const SessionItem = ({ 
  session, 
  eventId, 
  onEdit, 
  onDelete, 
  eventAttendeeTypes 
}: { 
  session: Session, 
  eventId: string, 
  onEdit: (s: Session) => void, 
  onDelete: (id: string) => void,
  eventAttendeeTypes: EventAttendeeType[]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: history = [], isLoading } = useGetEventSessionHistoryQuery(
    { eventId, sessionId: session.id },
    { skip: !isOpen }
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {session.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {session._count?.scans || 0} scans
                    </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                     <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatSessionDates(session.start_at, session.end_at)}
                     </span>
                     {session.location && (
                        <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {session.location}
                        </span>
                     )}
                     {session.capacity && (
                        <span className="flex items-center">
                            <UsersIcon className="h-3 w-3 mr-1" />
                            {session.capacity} pers.
                        </span>
                     )}
                </div>
                {session.allowedAttendeeTypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {session.allowedAttendeeTypes.map((typeId) => {
                          const type = eventAttendeeTypes?.find((t) => t.id === typeId)
                          if (!type) return null
                          return (
                            <span
                              key={typeId}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-gray-200 dark:border-gray-600"
                              style={{
                                backgroundColor: type.color_hex || type.attendeeType.color_hex || '#E5E7EB',
                                color: type.text_color_hex || type.attendeeType.text_color_hex || '#1F2937',
                              }}
                            >
                              {type.attendeeType.name}
                            </span>
                          )
                        })}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(session); }}>Modifier</Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 dark:hover:text-red-400" onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}>Supprimer</Button>
                <div className="p-1">
                  {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
            </div>
        </div>

        {isOpen && (
            <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Historique des passages</h4>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : history.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Aucun scan enregistré pour cette session.</p>
                ) : (
                    <div className="space-y-2">
                        {history.map(scan => (
                            <div key={scan.id} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${scan.scan_type === 'IN' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {scan.registration.attendee.first_name} {scan.registration.attendee.last_name}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {scan.registration.attendee.company && ` - ${scan.registration.attendee.company}`}
                                    </span>
                                </div>
                                <span className="text-gray-400 dark:text-gray-500 text-xs font-mono">
                                    {new Date(scan.scanned_at).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
    </div>
  )
}

interface EventSessionsTabProps {
  event: EventDPO
  eventAttendeeTypes?: EventAttendeeType[]
  isLoadingAttendeeTypes?: boolean
}

export const EventSessionsTab: React.FC<EventSessionsTabProps> = ({ 
  event,
  eventAttendeeTypes = [],
  isLoadingAttendeeTypes = false,
}) => {
  const { data: sessions = [], isLoading, error } = useGetEventSessionsQuery(event.id)
  const [createEventSession] = useCreateEventSessionMutation()
  const [updateEventSession] = useUpdateEventSessionMutation()
  const [deleteEventSession] = useDeleteEventSessionMutation()
  
  const { toast: addToast } = useToast()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)

  const handleCreateSession = async (sessionData: CreateSessionDto) => {
    try {
      await createEventSession({
        eventId: event.id,
        data: sessionData
      }).unwrap()
      setIsCreateModalOpen(false)
      addToast({
        title: 'Session créée',
        type: 'success'
      })
    } catch (err) {
      console.error(err)
      addToast({
        title: 'Erreur lors de la création',
        type: 'error'
      })
    }
  }

  const handleUpdateSession = async (sessionData: CreateSessionDto) => {
    if (!editingSession) return
    try {
      await updateEventSession({
        eventId: event.id,
        sessionId: editingSession.id,
        data: sessionData
      }).unwrap()
      setEditingSession(null)
      addToast({
        title: 'Session mise à jour',
        type: 'success'
      })
    } catch (err) {
      console.error(err)
      addToast({
        title: 'Erreur lors de la mise à jour',
        type: 'error'
      })
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette session ?')) {
      try {
        await deleteEventSession({
          eventId: event.id,
          sessionId
        }).unwrap()
        addToast({
          title: 'Session supprimée',
          type: 'success'
        })
      } catch (err) {
        console.error(err)
        addToast({
          title: 'Erreur lors de la suppression',
          type: 'error'
        })
      }
    }
  }

  if (error) {
    return <div className="text-red-500">Une erreur est survenue lors du chargement des sessions.</div>
  }

  return (
    <div className="space-y-4">
      {/* Header with create button */}
      <div className="flex items-center justify-end space-x-3">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Créer une session</span>
        </Button>
      </div>

      {/* Sessions list */}
      {isLoading || isLoadingAttendeeTypes ? (
        <div className="space-y-4">
           {Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
               <Skeleton className="h-6 w-1/3" />
               <div className="space-y-2">
                 <Skeleton className="h-4 w-1/4" />
                 <Skeleton className="h-4 w-1/2" />
               </div>
             </div>
           ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <h3 className="text-gray-500 dark:text-gray-400">
            Aucune session créée
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-6">
            Créez votre première session pour organiser votre événement en
            plusieurs activités
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Créer la première session</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionItem
                key={session.id}
                session={session}
                eventId={event.id}
                onEdit={setEditingSession}
                onDelete={handleDeleteSession}
                eventAttendeeTypes={eventAttendeeTypes}
            />
          ))}
        </div>
      )}

      {/* Create session modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Créer une nouvelle session"
        maxWidth="2xl"
      >
        <SessionForm
          eventStartDate={event.startDate}
          eventEndDate={event.endDate}
          onSubmit={handleCreateSession}
          onCancel={() => setIsCreateModalOpen(false)}
          eventAttendeeTypes={eventAttendeeTypes}
          isLoadingAttendeeTypes={isLoadingAttendeeTypes}
        />
      </Modal>

      {/* Edit session modal */}
      <Modal
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        title="Modifier la session"
        maxWidth="2xl"
      >
        {editingSession && (
          <SessionForm
            eventStartDate={event.startDate}
            eventEndDate={event.endDate}
            onSubmit={handleUpdateSession}
            onCancel={() => setEditingSession(null)}
            initialData={editingSession}
            eventAttendeeTypes={eventAttendeeTypes}
            isLoadingAttendeeTypes={isLoadingAttendeeTypes}
          />
        )}
      </Modal>
    </div>
  )
}
