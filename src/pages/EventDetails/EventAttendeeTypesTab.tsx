import React, { useState, useMemo, useEffect } from 'react'
import { 
  useGetAttendeeTypesQuery,
  useCreateAttendeeTypeMutation,
  type CreateAttendeeTypeDto,
  type AttendeeType
} from '@/features/attendee-types/api/attendeeTypesApi'
import {
  useGetEventAttendeeTypesQuery,
  useAddEventAttendeeTypeMutation,
  useRemoveEventAttendeeTypeMutation,
  useUpdateEventAttendeeTypeMutation,
  type EventAttendeeType
} from '@/features/events/api/eventsApi'
import { EventDPO } from '@/features/events/dpo/event.dpo'
import { Loader2, Check, Plus, Palette, Edit2 } from 'lucide-react'
import { useToast } from '@/shared/hooks/useToast'
import { SearchInput, Button } from '@/shared/ui'
import { FilterBar, FilterButton } from '@/shared/ui/FilterBar'
import type { FilterValues } from '@/shared/ui/FilterBar/types'
import { CreateAttendeeTypeModal } from '@/features/attendee-types/ui/CreateAttendeeTypeModal'

interface AttendeeTypeItemProps {
  type: AttendeeType
  eventType?: EventAttendeeType | undefined
  isSelected: boolean
  onToggle: () => void
  onColorChange: (color: string) => void
  onTextColorChange: (color: string) => void
}

const AttendeeTypeItem = ({
  type,
  eventType,
  isSelected,
  onToggle,
  onColorChange,
  onTextColorChange,
}: AttendeeTypeItemProps) => {
  const [color, setColor] = useState(eventType?.color_hex || type.color_hex || '#9ca3af')
  const [textColor, setTextColor] = useState(eventType?.text_color_hex || type.text_color_hex || '#ffffff')

  useEffect(() => {
    setColor(eventType?.color_hex || type.color_hex || '#9ca3af')
    setTextColor(eventType?.text_color_hex || type.text_color_hex || '#ffffff')
  }, [eventType?.color_hex, eventType?.text_color_hex, type.color_hex, type.text_color_hex])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextColor(e.target.value)
  }

  const handleBlur = () => {
    if (eventType && color !== eventType.color_hex) {
      onColorChange(color)
    }
  }

  const handleTextBlur = () => {
    if (eventType && textColor !== eventType.text_color_hex) {
      onTextColorChange(textColor)
    }
  }

  return (
    <div
      onClick={onToggle}
      className={`
        group relative flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
    >
      {/* Color Indicator / Picker */}
      <div 
        className="mr-4 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {isSelected && eventType ? (
          <div className="relative">
            <div
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center transition-transform group-hover:scale-105 cursor-pointer"
              style={{ backgroundColor: color }}
            >
              <Palette className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
            </div>
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              onBlur={handleBlur}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Modifier la couleur pour cet événement"
            />
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
            style={{ backgroundColor: type.color_hex || '#9ca3af' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1" onClick={(e) => e.stopPropagation()}>
        {isSelected && eventType ? (
          <div className="relative inline-block group">
            <span 
              className="font-medium block cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: textColor }}
              title="Cliquer pour modifier la couleur du texte"
            >
              {type.name}
            </span>
            <Edit2 className="absolute -right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none" style={{ color: textColor }} />
            <input
              type="color"
              value={textColor}
              onChange={handleTextColorChange}
              onBlur={handleTextBlur}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Modifier la couleur du texte pour cet événement"
            />
          </div>
        ) : (
          <span 
            className="font-medium text-gray-900 dark:text-white block"
            style={type.text_color_hex ? { color: type.text_color_hex } : undefined}
          >
            {type.name}
          </span>
        )}
      </div>
      
      {/* Selection Indicator */}
      <div className="ml-2">
        {isSelected ? (
          <div className="bg-blue-500 rounded-full p-1">
            <Check className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />
        )}
      </div>
    </div>
  )
}

interface EventAttendeeTypesTabProps {
  event: EventDPO
}

export const EventAttendeeTypesTab = ({ event }: EventAttendeeTypesTabProps) => {
  const toast = useToast()
  const orgId = event.orgId
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { 
    data: globalTypes, 
    isLoading: isLoadingGlobal,
    refetch: refetchGlobal 
  } = useGetAttendeeTypesQuery(orgId, {
    skip: !orgId,
  })

  const { 
    data: eventTypes, 
    isLoading: isLoadingEvent,
    refetch: refetchEvent 
  } = useGetEventAttendeeTypesQuery(event.id)

  const handleRefresh = () => {
    refetchGlobal()
    refetchEvent()
  }

  const [addType] = useAddEventAttendeeTypeMutation()
  const [removeType] = useRemoveEventAttendeeTypeMutation()
  const [updateType] = useUpdateEventAttendeeTypeMutation()
  const [createAttendeeType] = useCreateAttendeeTypeMutation()

  const filterConfig = {
    status: {
      label: 'Statut',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous' },
        { value: 'selected', label: 'Sélectionnés' },
        { value: 'not_selected', label: 'Non sélectionnés' },
      ],
    },
  }

  const filteredTypes = useMemo(() => {
    if (!globalTypes) return []

    return globalTypes.filter((type) => {
      const eventType = eventTypes?.find((et) => et.attendee_type_id === type.id)
      const isSelected = !!eventType

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!type.name.toLowerCase().includes(query)) {
          return false
        }
      }

      // Filter by status
      const statusFilter = filterValues.status as string
      if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'selected' && !isSelected) return false
        if (statusFilter === 'not_selected' && isSelected) return false
      }

      return true
    })
  }, [globalTypes, eventTypes, searchQuery, filterValues])

  const handleCreateType = async (data: CreateAttendeeTypeDto) => {
    try {
      await createAttendeeType({ orgId, data }).unwrap()
      toast.success('Type de participant créé')
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error creating type:', error)
      toast.error("Erreur lors de la création du type")
    }
  }

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
        // Check if used
        const eventType = eventTypes?.find(et => et.id === eventTypeId)
        if (eventType?._count?.registrations && eventType._count.registrations > 0) {
          toast.error("Impossible de désactiver ce type car il est utilisé par des participants.")
          return
        }

        await removeType({ eventId: event.id, eventAttendeeTypeId: eventTypeId }).unwrap()
        toast.success('Type de participant retiré')
      } else {
        await addType({ eventId: event.id, attendeeTypeId: typeId }).unwrap()
        toast.success('Type de participant ajouté')
      }
    } catch (error: any) {
      // Extraire le message d'erreur du backend
      const errorMessage = error?.data?.message || error?.message || "Une erreur est survenue"
      toast.error(errorMessage)
    }
  }

  const handleColorChange = async (eventTypeId: string, color: string) => {
    try {
      await updateType({
        eventId: event.id,
        eventAttendeeTypeId: eventTypeId,
        data: { color_hex: color }
      }).unwrap()
      toast.success('Couleur mise à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la couleur')
    }
  }

  const handleTextColorChange = async (eventTypeId: string, color: string) => {
    try {
      await updateType({
        eventId: event.id,
        eventAttendeeTypeId: eventTypeId,
        data: { text_color_hex: color }
      }).unwrap()
      toast.success('Couleur du texte mise à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la couleur du texte')
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Actions */}
      <div className="flex items-center justify-end space-x-3">
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Ajouter un type</span>
        </Button>
      </div>

      <div className="space-y-4">
        {/* Search & Filters */}
        <FilterBar
          resultCount={filteredTypes.length}
          resultLabel="type"
          onReset={() => {
            setSearchQuery('')
            setFilterValues({})
          }}
          showResetButton={searchQuery !== '' || Object.keys(filterValues).length > 0}
          onRefresh={handleRefresh}
          showRefreshButton={true}
        >
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher un type..."
          />
          <FilterButton
            filters={filterConfig}
            values={filterValues}
            onChange={setFilterValues}
          />
        </FilterBar>

        {/* List Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Types de participants
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Sélectionnez les types de participants disponibles pour cet événement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTypes.map((type) => {
              const eventType = eventTypes?.find((et) => et.attendee_type_id === type.id)
              const isSelected = !!eventType

              return (
                <AttendeeTypeItem
                  key={type.id}
                  type={type}
                  eventType={eventType}
                  isSelected={isSelected}
                  onToggle={() => handleToggle(type.id, eventType?.id)}
                  onColorChange={(color) => eventType && handleColorChange(eventType.id, color)}
                  onTextColorChange={(color) => eventType && handleTextColorChange(eventType.id, color)}
                />
              )
            })}
            
            {filteredTypes.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                Aucun type de participant trouvé
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateAttendeeTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateType}
      />
    </div>
  )
}
