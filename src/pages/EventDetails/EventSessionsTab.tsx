import React, { useState } from 'react'
import { EventDPO } from '@/features/events/dpo/event.dpo'
import { Plus, Calendar, MapPin, Clock, Users as UsersIcon, Check } from 'lucide-react'
import { Button, Modal } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib/utils'
import type { EventAttendeeType } from '@/features/events/api/eventsApi'

// Mock data type for sessions (will be replaced with real API later)
interface Session {
  id: string
  name: string
  location?: string
  startDate: string
  endDate: string
  allowedAttendeeTypes: string[] // IDs of attendee types that can access
}

interface SessionFormProps {
  eventStartDate: string
  eventEndDate: string
  onSubmit: (session: Omit<Session, 'id'>) => void
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
    initialData?.startDate || eventStartDate
  )
  const [endDate, setEndDate] = useState(initialData?.endDate || eventEndDate)
  const [allowedAttendeeTypes, setAllowedAttendeeTypes] = useState<string[]>(
    initialData?.allowedAttendeeTypes || []
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const sessionData: Omit<Session, 'id'> = {
      name,
      startDate,
      endDate,
      allowedAttendeeTypes,
    }
    if (location) {
      sessionData.location = location
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date et heure de début *
          </label>
          <input
            type="datetime-local"
            value={startDate.slice(0, 16)}
            onChange={(e) => setStartDate(e.target.value)}
            min={eventStartDate.slice(0, 16)}
            max={eventEndDate.slice(0, 16)}
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
            min={startDate.slice(0, 16)}
            max={eventEndDate.slice(0, 16)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Qui peut accéder
        </label>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Sélectionnez les types de participants autorisés à cette session
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
                        backgroundColor: type.attendeeType.color_hex || '#E5E7EB',
                        color: type.attendeeType.text_color_hex || '#1F2937',
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
  const [sessions, setSessions] = useState<Session[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)

  const handleCreateSession = (sessionData: Omit<Session, 'id'>) => {
    const newSession: Session = {
      ...sessionData,
      id: `session_${Date.now()}`,
    }
    setSessions([...sessions, newSession])
    setIsCreateModalOpen(false)
  }

  const handleUpdateSession = (sessionData: Omit<Session, 'id'>) => {
    if (!editingSession) return
    setSessions(
      sessions.map((s) =>
        s.id === editingSession.id ? { ...sessionData, id: s.id } : s
      )
    )
    setEditingSession(null)
  }

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette session ?')) {
      setSessions(sessions.filter((s) => s.id !== sessionId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Sessions de l'événement
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gérez les différentes sessions et activités de votre événement
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Créer une session</span>
        </Button>
      </div>

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune session créée
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {session.name}
              </h3>

              <div className="space-y-2 mb-4">
                {session.location && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{session.location}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {formatDateTime(session.startDate)} →{' '}
                    {formatDateTime(session.endDate)}
                  </span>
                </div>

                {session.allowedAttendeeTypes.length > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <UsersIcon className="h-3 w-3 mr-1" />
                      Accès restreint:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {session.allowedAttendeeTypes.map((typeId) => {
                        const type = eventAttendeeTypes?.find((t) => t.id === typeId)
                        if (!type) return null
                        return (
                          <span
                            key={typeId}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: type.attendeeType.color_hex || '#E5E7EB',
                              color: type.attendeeType.text_color_hex || '#1F2937',
                            }}
                          >
                            {type.attendeeType.name}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <UsersIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="italic">Tous les participants</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSession(session)}
                  className="flex-1"
                >
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSession(session.id)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                >
                  Supprimer
                </Button>
              </div>
            </div>
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
