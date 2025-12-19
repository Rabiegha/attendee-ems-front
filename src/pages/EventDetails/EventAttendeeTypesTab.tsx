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
import { Loader2, Check, Plus, Pen } from 'lucide-react'
import { useToast } from '@/shared/hooks/useToast'
import { SearchInput, Button, Modal } from '@/shared/ui'
import { FilterBar, FilterButton } from '@/shared/ui/FilterBar'
import type { FilterValues } from '@/shared/ui/FilterBar/types'
import { CreateAttendeeTypeModal } from '@/features/attendee-types/ui/CreateAttendeeTypeModal'

interface ColorEditorModalProps {
  isOpen: boolean
  onClose: () => void
  typeName: string
  backgroundColor: string
  textColor: string
  onSave: (bgColor: string, textColor: string) => void
}

const ColorEditorModal = ({ 
  isOpen, 
  onClose, 
  typeName, 
  backgroundColor, 
  textColor, 
  onSave 
}: ColorEditorModalProps) => {
  const [bgColor, setBgColor] = useState(backgroundColor)
  const [txtColor, setTxtColor] = useState(textColor)

  // Synchroniser les états locaux quand les props changent ou que le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setBgColor(backgroundColor)
      setTxtColor(textColor)
    }
  }, [backgroundColor, textColor, isOpen])

  const handleSave = () => {
    onSave(bgColor, txtColor)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier les couleurs"
      size="md"
    >
      <div className="space-y-6">
        {/* Preview */}
        <div className="flex justify-center">
          <span
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: bgColor, color: txtColor }}
          >
            {typeName}
          </span>
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Couleur de fond
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Couleur du texte
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={txtColor}
              onChange={(e) => setTxtColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={txtColor}
              onChange={(e) => setTxtColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  )
}

interface AttendeeTypeItemProps {
  type: AttendeeType
  eventType?: EventAttendeeType | undefined
  isSelected: boolean
  onToggle: () => void
  onEditColors: () => void
}

const AttendeeTypeItem = ({
  type,
  eventType,
  isSelected,
  onToggle,
  onEditColors,
}: AttendeeTypeItemProps) => {
  const backgroundColor = eventType?.color_hex || type.color_hex || '#9ca3af'
  const textColor = eventType?.text_color_hex || type.text_color_hex || '#ffffff'

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
      {/* Badge avec couleurs */}
      <div className="flex-1 flex items-center space-x-3">
        <span
          className="px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor, color: textColor }}
        >
          {type.name}
        </span>
        
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEditColors()
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Modifier les couleurs"
          >
            <Pen className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>
      
      {/* Selection Indicator */}
      <div className="ml-2">
        {isSelected ? (
          <div className="bg-blue-500 rounded-full p-1">
            <Check className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-colors" />
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
  const [colorEditorState, setColorEditorState] = useState<{
    isOpen: boolean
    eventTypeId: string | null
    typeName: string
    backgroundColor: string
    textColor: string
  }>({
    isOpen: false,
    eventTypeId: null,
    typeName: '',
    backgroundColor: '#9ca3af',
    textColor: '#ffffff'
  })

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
      // N'afficher que les types actifs globalement
      if (!type.is_active) return false
      
      const eventType = eventTypes?.find((et) => et.attendee_type_id === type.id)
      // Si le type est ajouté à l'événement, vérifier qu'il est actif dans l'événement
      const isSelected = !!eventType && eventType.is_active

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
      const eventType = eventTypes?.find(et => et.id === eventTypeId)
      
      // Si le type existe et est actif, on le désactive
      if (eventTypeId && eventType?.is_active) {
        // Check if used
        if (eventType._count?.registrations && eventType._count.registrations > 0) {
          toast.error("Impossible de désactiver ce type car il est utilisé par des participants.")
          return
        }

        await removeType({ eventId: event.id, eventAttendeeTypeId: eventTypeId }).unwrap()
        toast.success('Type de participant retiré')
      } 
      // Si le type existe mais est inactif, on le réactive
      else if (eventTypeId && !eventType?.is_active) {
        await addType({ eventId: event.id, attendeeTypeId: typeId }).unwrap()
        toast.success('Type de participant réactivé')
      }
      // Si le type n'existe pas, on l'ajoute
      else {
        await addType({ eventId: event.id, attendeeTypeId: typeId }).unwrap()
        toast.success('Type de participant ajouté')
      }
    } catch (error: any) {
      // Extraire le message d'erreur du backend
      const errorMessage = error?.data?.message || error?.message || "Une erreur est survenue"
      toast.error(errorMessage)
    }
  }

  const handleColorChange = async (eventTypeId: string, bgColor: string, txtColor: string) => {
    try {
      await updateType({
        eventId: event.id,
        eventAttendeeTypeId: eventTypeId,
        data: { 
          color_hex: bgColor,
          text_color_hex: txtColor
        }
      }).unwrap()
      toast.success('Couleurs mises à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des couleurs')
    }
  }

  const openColorEditor = (eventType: EventAttendeeType, globalType: AttendeeType) => {
    setColorEditorState({
      isOpen: true,
      eventTypeId: eventType.id,
      typeName: globalType.name,
      backgroundColor: eventType.color_hex || globalType.color_hex || '#9ca3af',
      textColor: eventType.text_color_hex || globalType.text_color_hex || '#ffffff'
    })
  }

  const handleSaveColors = (bgColor: string, txtColor: string) => {
    if (colorEditorState.eventTypeId) {
      handleColorChange(colorEditorState.eventTypeId, bgColor, txtColor)
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
              const isSelected = !!eventType && eventType.is_active

              return (
                <AttendeeTypeItem
                  key={type.id}
                  type={type}
                  eventType={eventType}
                  isSelected={isSelected}
                  onToggle={() => handleToggle(type.id, eventType?.id)}
                  onEditColors={() => eventType && openColorEditor(eventType, type)}
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

      <ColorEditorModal
        isOpen={colorEditorState.isOpen}
        onClose={() => setColorEditorState({ ...colorEditorState, isOpen: false })}
        typeName={colorEditorState.typeName}
        backgroundColor={colorEditorState.backgroundColor}
        textColor={colorEditorState.textColor}
        onSave={handleSaveColors}
      />

      <CreateAttendeeTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateType}
      />
    </div>
  )
}
