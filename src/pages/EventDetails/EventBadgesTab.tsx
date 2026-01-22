import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectToken } from '@/features/auth/model/sessionSlice'
import { CreditCard, Plus, Trash2, AlertCircle, ChevronDown, Check, AlertTriangle, Download } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useToast } from '@/shared/ui/useToast'
import { useUpdateEventMutation, useGetEventAttendeeTypesQuery } from '@/features/events/api/eventsApi'
import { useGetBadgeTemplatesQuery } from '@/services/api/badge-templates.api'
import { 
  useGetEventBadgeRulesQuery,
  useCreateEventBadgeRuleMutation,
  useUpdateEventBadgeRuleMutation,
  useDeleteEventBadgeRuleMutation
} from '@/features/events/api/eventBadgeRulesApi'
import type { EventDPO } from '@/features/events/dpo/event.dpo'

interface EventBadgesTabProps {
  event: EventDPO
}

// Composants utilitaires
const FormField = ({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    {description && (
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    )}
    {children}
  </div>
)

const Select = ({ value, onChange, children, className = '' }: any) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  >
    {children}
  </select>
)

const SelectOption = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
)

// Composant de sélection de template avec recherche
interface TemplateSelectProps {
  value: string
  onChange: (value: string) => void
  templates: any[]
  onModify?: (() => void) | undefined
}

const TemplateSelect: React.FC<TemplateSelectProps> = ({ value, onChange, templates, onModify }) => {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Mettre à jour l'input quand la valeur change
  useEffect(() => {
    if (value) {
      const selectedTemplate = templates.find(t => t.id === value)
      if (selectedTemplate) {
        setInputValue(selectedTemplate.name)
      }
    } else {
      setInputValue('')
    }
  }, [value, templates])

  const handleSelectTemplate = (templateId: string) => {
    onChange(templateId)
    setIsOpen(false)
  }

  // Filtrer les templates selon la recherche
  const filteredTemplates = templates.filter((template) => {
    if (inputValue.trim()) {
      return template.name.toLowerCase().includes(inputValue.toLowerCase())
    }
    return true
  })

  const selectedTemplate = templates.find(t => t.id === value)

  return (
    <div className="flex gap-2">
      <div ref={wrapperRef} className="relative flex-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Sélectionnez un template..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Dropdown des templates */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredTemplates.length > 0 ? (
              <>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  {inputValue.trim() ? 'Résultats' : 'Templates disponibles'}
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400 italic">
                    Aucun template
                  </span>
                </button>
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelectTemplate(template.id)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between group ${
                      value === template.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-900 dark:text-gray-100">
                        {template.name}
                      </span>
                      {template.is_default && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          (Par défaut)
                        </span>
                      )}
                    </div>
                    {value === template.id && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Aucun template trouvé
              </div>
            )}
          </div>
        )}
      </div>
      {value && onModify && (
        <Button
          variant="outline"
          size="default"
          onClick={onModify}
          className="h-[42px] px-6"
        >
          Modifier
        </Button>
      )}
    </div>
  )
}

export const EventBadgesTab: React.FC<EventBadgesTabProps> = ({ event }) => {
  const navigate = useNavigate()
  const { success: toastSuccess, error: toastError } = useToast()
  const token = useSelector(selectToken)
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation()

  // API pour les règles de badge
  const { data: badgeRulesData, isLoading: isLoadingRules } = useGetEventBadgeRulesQuery(event.id)
  const [createBadgeRule] = useCreateEventBadgeRuleMutation()
  const [updateBadgeRule] = useUpdateEventBadgeRuleMutation()
  const [deleteBadgeRule] = useDeleteEventBadgeRuleMutation()

  // Récupérer les templates de badges disponibles
const { data: badgeTemplatesData } = useGetBadgeTemplatesQuery({})

  // Récupérer les attendee types de l'événement
  const { data: eventAttendeeTypesData = [] } = useGetEventAttendeeTypesQuery(event.id)
  
  // État local pour la gestion de l'UI
  const badgeRules = badgeRulesData || []
  
  // Mapper vers un format compatible avec l'UI existante
  const attendeeTypes = useMemo(() => {
    return eventAttendeeTypesData
      .filter(eat => {
        // Garder TOUS les types actifs (événement ET global)
        if (eat.is_active && eat.attendeeType.is_active) return true
        
        // Garder les types inactifs SI utilisés dans les registrations
        // Note: on ne peut pas vérifier ici, donc on garde tous les inactifs pour l'instant
        // et on affichera un message différent selon le cas
        if (!eat.is_active || !eat.attendeeType.is_active) {
          // Si le type a un count de registrations > 0, on le garde
          if (eat._count?.registrations && eat._count.registrations > 0) return true
          
          // Si le type est utilisé dans une règle de badge, on le garde aussi
          const usedInRules = badgeRules.some(rule => 
            rule.attendeeTypeIds.includes(eat.id) // Utiliser eat.id (event_attendee_type_id)
          )
          if (usedInRules) return true
        }
        
        return false
      })
      .map(eat => ({
        id: eat.id, // Utiliser l'ID de event_attendee_type, pas l'ID du type global
        name: eat.attendeeType.name,
        color_hex: eat.color_hex || eat.attendeeType.color_hex,
        text_color_hex: eat.text_color_hex || eat.attendeeType.text_color_hex,
        is_active: eat.is_active && eat.attendeeType.is_active,
        // Infos pour les messages
        eventInactive: !eat.is_active,
        globalInactive: !eat.attendeeType.is_active,
        hasRegistrations: (eat._count?.registrations || 0) > 0,
      }))
  }, [eventAttendeeTypesData, badgeRules])

  const [formData, setFormData] = useState({
    badgeTemplateId: event.badgeTemplateId || '',
  })

  const [openRuleId, setOpenRuleId] = useState<string | null>(null)
  const [isCreatingRule, setIsCreatingRule] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null)
  
  // État temporaire pour la création d'une nouvelle règle
  const [newRule, setNewRule] = useState<{ name: string; badgeTemplateId: string; attendeeTypeIds: string[] } | null>(null)

  // Mettre à jour le formulaire quand l'événement change
  useEffect(() => {
    setFormData({
      badgeTemplateId: event.badgeTemplateId || '',
    })
  }, [event])

  // Sauvegarde automatique du badge par défaut
  useEffect(() => {
    const saveDefaultBadge = async () => {
      if (formData.badgeTemplateId === event.badgeTemplateId) return
      if (!formData.badgeTemplateId) return

      try {
        await updateEvent({
          id: event.id,
          data: {
            badgeTemplateId: formData.badgeTemplateId,
          },
        }).unwrap()
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error)
        toastError('Erreur', 'Impossible de mettre à jour le badge par défaut')
      }
    }

    const timeout = setTimeout(saveDefaultBadge, 500)
    return () => clearTimeout(timeout)
  }, [formData.badgeTemplateId])

  // Ajouter une nouvelle règle
  const handleAddRule = () => {
    setNewRule({
      name: '',
      badgeTemplateId: '',
      attendeeTypeIds: [],
    })
    setOpenRuleId('new')
    setIsCreatingRule(true)
  }

  // Supprimer une règle
  const handleRemoveRule = async (ruleId: string) => {
    try {
      await deleteBadgeRule({ eventId: event.id, ruleId }).unwrap()
      toastSuccess('Règle supprimée', 'La règle a été supprimée avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toastError('Erreur', 'Impossible de supprimer la règle')
    } finally {
      setDeleteModalOpen(false)
      setRuleToDelete(null)
    }
  }

  // Télécharger le PDF des badges
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true)
      
      if (!token) {
        toastError('Erreur', 'Vous devez être connecté')
        return
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const response = await fetch(
        `${apiUrl}/events/${event.id}/badges/pdf`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF')
      }

      // Télécharger le PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `badges-${event.name.replace(/[^a-z0-9]/gi, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toastSuccess('PDF généré', 'Le fichier PDF a été téléchargé avec succès')
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      toastError('Erreur', 'Impossible de générer le PDF des badges')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Ouvrir le modal de confirmation de suppression
  const handleDeleteClick = (ruleId: string) => {
    setRuleToDelete(ruleId)
    setDeleteModalOpen(true)
  }

  // Confirmer la suppression
  const handleConfirmDelete = () => {
    if (ruleToDelete) {
      handleRemoveRule(ruleToDelete)
    }
  }

  // Mettre à jour le template d'une règle
  const handleUpdateRuleBadge = async (ruleId: string, badgeTemplateId: string) => {
    if (ruleId === 'new' && newRule) {
      setNewRule({ ...newRule, badgeTemplateId })
      return
    }
    
    try {
      await updateBadgeRule({
        eventId: event.id,
        ruleId,
        data: { badgeTemplateId }
      }).unwrap()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toastError('Erreur', 'Impossible de mettre à jour la règle')
    }
  }

  // Mettre à jour le nom d'une règle
  const handleUpdateRuleName = async (ruleId: string, name: string) => {
    if (ruleId === 'new' && newRule) {
      setNewRule({ ...newRule, name })
      return
    }
    
    try {
      await updateBadgeRule({
        eventId: event.id,
        ruleId,
        data: { name }
      }).unwrap()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toastError('Erreur', 'Impossible de mettre à jour le nom de la règle')
    }
  }

  // Mettre à jour les attendee types d'une règle
  const handleUpdateRuleAttendeeTypes = async (ruleId: string, attendeeTypeId: string, checked: boolean) => {
    if (ruleId === 'new' && newRule) {
      const newAttendeeTypeIds = checked
        ? [...newRule.attendeeTypeIds, attendeeTypeId]
        : newRule.attendeeTypeIds.filter(id => id !== attendeeTypeId)
      setNewRule({ ...newRule, attendeeTypeIds: newAttendeeTypeIds })
      return
    }

    const rule = badgeRules.find(r => r.id === ruleId)
    if (!rule) return

    const newAttendeeTypeIds = checked
      ? [...rule.attendeeTypeIds, attendeeTypeId]
      : rule.attendeeTypeIds.filter(id => id !== attendeeTypeId)

    try {
      await updateBadgeRule({
        eventId: event.id,
        ruleId,
        data: { attendeeTypeIds: newAttendeeTypeIds }
      }).unwrap()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toastError('Erreur', 'Impossible de mettre à jour la règle')
    }
  }

  // Valider et sauvegarder une règle
  const handleSaveRule = async (ruleId: string) => {
    if (ruleId === 'new' && newRule) {
      if (!newRule.name || !newRule.badgeTemplateId || newRule.attendeeTypeIds.length === 0) {
        toastError('Règle incomplète', 'Veuillez renseigner le nom, sélectionner un template et au moins un type')
        return
      }

      if (isSaving) return // Éviter les clics multiples

      setIsSaving(true)
      try {
        await createBadgeRule({
          eventId: event.id,
          data: newRule
        }).unwrap()
        toastSuccess('Règle créée', 'La règle a été créée avec succès')
        // Réinitialiser l'état du formulaire
        setNewRule(null)
        setIsCreatingRule(false)
        setOpenRuleId(null)
      } catch (error) {
        console.error('Erreur lors de la création:', error)
        toastError('Erreur', 'Impossible de créer la règle')
      } finally {
        setIsSaving(false)
      }
    } else {
      const rule = badgeRules.find(r => r.id === ruleId)
      if (!rule?.badgeTemplateId || rule.attendeeTypeIds.length === 0) {
        toastError('Règle incomplète', 'Veuillez sélectionner un template et au moins un type')
        return
      }
      setOpenRuleId(null)
      setIsCreatingRule(false)
      toastSuccess('Règle enregistrée', 'La règle a été configurée avec succès')
    }
  }

  // Annuler l'édition d'une règle
  const handleCancelEdit = (ruleId: string) => {
    if (ruleId === 'new') {
      setNewRule(null)
    }
    setOpenRuleId(null)
    setIsCreatingRule(false)
  }

  // Toggle l'ouverture/fermeture d'une règle
  const toggleRule = (ruleId: string) => {
    if (openRuleId === ruleId) {
      setOpenRuleId(null)
    } else {
      setOpenRuleId(ruleId)
      setIsCreatingRule(false)
    }
  }

  // Obtenir les attendee types déjà utilisés dans d'autres règles
  const getUsedAttendeeTypeIds = (excludeRuleId?: string) => {
    return badgeRules
      .filter(rule => rule.id !== excludeRuleId)
      .flatMap(rule => rule.attendeeTypeIds)
  }

  // Obtenir le nom d'un template
  const getTemplateName = (templateId: string) => {
    return badgeTemplatesData?.data?.find(t => t.id === templateId)?.name || 'Template inconnu'
  }

  // Obtenir la règle à supprimer pour l'affichage
  const getRuleToDeleteInfo = () => {
    if (!ruleToDelete) return null
    const rule = badgeRules.find(r => r.id === ruleToDelete)
    if (!rule) return null
    const selectedTypes = attendeeTypes.filter(t => rule.attendeeTypeIds.includes(t.id))
    return {
      templateName: rule.badgeTemplateId ? getTemplateName(rule.badgeTemplateId) : 'Aucun template',
      typesCount: selectedTypes.length,
      typesNames: selectedTypes.map(t => t.name).join(', ')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Configuration des badges
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gérez les templates de badges pour cet événement et définissez des badges spécifiques par type de participant
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPDF}
          leftIcon={<Download className="h-4 w-4" />}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? 'Génération...' : 'Télécharger PDF'}
        </Button>
      </div>

      {/* Badge par défaut */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Badge par défaut
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Ce template sera utilisé pour tous les participants qui ne correspondent à aucune règle spécifique
            </p>
            
            <TemplateSelect
              value={formData.badgeTemplateId}
              onChange={(value) => setFormData((prev) => ({ ...prev, badgeTemplateId: value }))}
              templates={badgeTemplatesData?.data?.filter(t => t.is_active) || []}
              onModify={formData.badgeTemplateId ? () => navigate(`/badges/designer/${formData.badgeTemplateId}`) : undefined}
            />
          </div>
        </div>
      </div>

      {/* Règles de badge par attendee type */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Badges par type de participant
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Assignez des templates différents selon le type
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRule}
            leftIcon={<Plus className="h-4 w-4" />}
            disabled={isCreatingRule}
          >
            Nouvelle règle
          </Button>
        </div>

        {badgeRules.length === 0 && !newRule ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Aucune règle définie
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Créez des règles pour assigner des badges différents par type
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Règles existantes */}
            {badgeRules.map((rule) => {
              const isOpen = openRuleId === rule.id
              const usedAttendeeTypeIds = getUsedAttendeeTypeIds(rule.id)
              const availableAttendeeTypes = attendeeTypes.filter(
                type => !usedAttendeeTypeIds.includes(type.id) || rule.attendeeTypeIds.includes(type.id)
              )
              const selectedTypes = attendeeTypes.filter(t => rule.attendeeTypeIds.includes(t.id))
              const isIncomplete = !rule.badgeTemplateId || rule.attendeeTypeIds.length === 0
              const hasRemovedTypes = selectedTypes.some(t => t.eventInactive || t.globalInactive)

              return (
                <div
                  key={rule.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  {/* Header - toujours visible */}
                  <div className="relative">
                    <button
                      onClick={() => !isCreatingRule && toggleRule(rule.id)}
                      disabled={isCreatingRule && !isOpen}
                      className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed pr-20"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard className="h-5 w-5 text-purple-600 flex-shrink-0" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {rule.name || 'Sans nom'}
                          </span>
                          {isIncomplete && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                              <AlertCircle className="h-3 w-3" />
                              Incomplète
                            </span>
                          )}
                          {!isIncomplete && hasRemovedTypes && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                              <AlertTriangle className="h-3 w-3" />
                              Un ou plusieurs types ont été retirés de cet événement
                            </span>
                          )}
                        </div>
                        {selectedTypes.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedTypes.slice(0, 5).map((type) => (
                              <span
                                key={type.id}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                {type.color_hex && (
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: type.color_hex }}
                                  />
                                )}
                                {type.name}
                              </span>
                            ))}
                            {selectedTypes.length > 5 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5">
                                +{selectedTypes.length - 5} autres
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Aucun type sélectionné
                          </p>
                        )}
                      </div>
                    </button>
                    
                    {/* Bouton suppression - position absolute */}
                    {!isCreatingRule && (
                      <div className="absolute right-12 top-1/2 -translate-y-1/2 z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(rule.id)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Chevron - position absolute */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Contenu - avec transition smooth */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                    style={{ overflow: isOpen ? 'visible' : 'hidden' }}
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      {/* Nom de la règle */}
                      <FormField label="Nom de la règle">
                        <input
                          type="text"
                          value={rule.name}
                          onChange={(e) => handleUpdateRuleName(rule.id, e.target.value)}
                          placeholder="Ex: Badge VIP, Badge Exposant..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </FormField>

                      {/* Sélection du template */}
                      <FormField label="Template de badge">
                        <TemplateSelect
                          value={rule.badgeTemplateId}
                          onChange={(value) => handleUpdateRuleBadge(rule.id, value)}
                          templates={badgeTemplatesData?.data?.filter(t => t.is_active) || []}
                          onModify={rule.badgeTemplateId ? () => navigate(`/badges/designer/${rule.badgeTemplateId}`) : undefined}
                        />
                      </FormField>

                      {/* Sélection des attendee types */}
                      <FormField label="Types de participants">
                        <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          {availableAttendeeTypes.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              Aucun type disponible
                            </p>
                          ) : (
                            availableAttendeeTypes.map((type) => (
                              <label
                                key={type.id}
                                className="flex items-center gap-3 p-2 rounded hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={rule.attendeeTypeIds.includes(type.id)}
                                  onChange={(e) => handleUpdateRuleAttendeeTypes(rule.id, type.id, e.target.checked)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex items-center gap-2 flex-1">
                                  {type.color_hex && (
                                    <div
                                      className="w-3 h-3 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: type.color_hex }}
                                    />
                                  )}
                                  <span className="text-sm text-gray-900 dark:text-white flex-shrink-0">
                                    {type.name}
                                  </span>
                                  {!type.is_active && type.hasRegistrations && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400 italic ml-2">
                                      Ce type de participant est désactivé, mais il est utilisé par au moins un participant.
                                    </span>
                                  )}
                                  {!type.is_active && !type.hasRegistrations && (
                                    <span className="text-xs text-orange-600 dark:text-orange-400 italic ml-2">
                                      Ce type a été retiré de l'événement
                                    </span>
                                  )}
                                </div>
                              </label>
                            ))
                          )}
                        </div>
                      </FormField>

                      {/* Validation */}
                      {isIncomplete && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          <p className="text-sm text-amber-800 dark:text-amber-300">
                            {!rule.badgeTemplateId && rule.attendeeTypeIds.length === 0
                              ? 'Sélectionnez un template et au moins un type'
                              : !rule.badgeTemplateId
                              ? 'Sélectionnez un template de badge'
                              : 'Sélectionnez au moins un type de participant'}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      {isCreatingRule && isOpen && (
                        <div className="flex gap-2 justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelEdit(rule.id)}
                          >
                            Annuler
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSaveRule(rule.id)}
                            leftIcon={<Check className="h-4 w-4" />}
                            disabled={isIncomplete}
                          >
                            Valider
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Nouvelle règle en cours de création */}
            {newRule && (
              <div
                className="bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-500 dark:border-blue-600 overflow-hidden shadow-lg"
              >
                {/* Header */}
                <div className="w-full px-6 py-4 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      Nouvelle règle
                    </span>
                    {(!newRule.name || !newRule.badgeTemplateId || newRule.attendeeTypeIds.length === 0) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                        <AlertCircle className="h-3 w-3" />
                        Incomplète
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6 space-y-4">
                  <FormField label="Nom de la règle">
                    <input
                      type="text"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      placeholder="Ex: Badge VIP, Badge Exposant..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </FormField>

                  <FormField label="Template de badge">
                    <TemplateSelect
                      value={newRule.badgeTemplateId}
                      onChange={(value) => handleUpdateRuleBadge('new', value)}
                      templates={badgeTemplatesData?.data?.filter(t => t.is_active) || []}
                      onModify={newRule.badgeTemplateId ? () => navigate(`/badges/designer/${newRule.badgeTemplateId}`) : undefined}
                    />
                  </FormField>

                  <FormField label="Types de participants concernés">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {attendeeTypes.filter(t => !getUsedAttendeeTypeIds('new').includes(t.id)).map((type) => (
                        <label
                          key={type.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={newRule.attendeeTypeIds.includes(type.id)}
                            onChange={(e) => handleUpdateRuleAttendeeTypes('new', type.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            {type.color_hex && (
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: type.color_hex }}
                              />
                            )}
                            <span className="text-sm text-gray-900 dark:text-white flex-shrink-0">
                              {type.name}
                            </span>
                            {!type.is_active && type.hasRegistrations && (
                              <span className="text-xs text-amber-600 dark:text-amber-400 italic ml-2">
                                Ce type de participant est désactivé, mais il est utilisé par au moins un participant.
                              </span>
                            )}
                            {!type.is_active && !type.hasRegistrations && (
                              <span className="text-xs text-orange-600 dark:text-orange-400 italic ml-2">
                                Ce type a été retiré de l'événement
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </FormField>

                  {/* Validation */}
                  {(!newRule.name || !newRule.badgeTemplateId || newRule.attendeeTypeIds.length === 0) && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        {!newRule.name && !newRule.badgeTemplateId && newRule.attendeeTypeIds.length === 0
                          ? 'Renseignez le nom, sélectionnez un template et au moins un type'
                          : !newRule.name
                          ? 'Renseignez le nom de la règle'
                          : !newRule.badgeTemplateId && newRule.attendeeTypeIds.length === 0
                          ? 'Sélectionnez un template et au moins un type'
                          : !newRule.badgeTemplateId
                          ? 'Sélectionnez un template de badge'
                          : 'Sélectionnez au moins un type de participant'}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelEdit('new')}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSaveRule('new')}
                      leftIcon={<Check className="h-4 w-4" />}
                      disabled={!newRule.name || !newRule.badgeTemplateId || newRule.attendeeTypeIds.length === 0 || isSaving}
                    >
                      {isSaving ? 'Enregistrement...' : 'Valider'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Aide */}
      {badgeRules.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Fonctionnement</p>
              <p className="text-xs">
                Les participants seront assignés au premier badge correspondant à leur type. 
                Si aucune règle ne correspond, le badge par défaut sera utilisé.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="md"
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Supprimer la règle
          </h3>

          {getRuleToDeleteInfo() && (
            <div className="text-gray-600 dark:text-gray-400 mb-6">
              <p className="mb-2">
                Êtes-vous sûr de vouloir supprimer cette règle ?
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {getRuleToDeleteInfo()!.templateName}
                </p>
                <p className="text-xs">
                  {getRuleToDeleteInfo()!.typesCount} type{getRuleToDeleteInfo()!.typesCount > 1 ? 's' : ''} assigné{getRuleToDeleteInfo()!.typesCount > 1 ? 's' : ''}
                  {getRuleToDeleteInfo()!.typesNames && (
                    <span className="block mt-1 text-gray-500 dark:text-gray-400">
                      {getRuleToDeleteInfo()!.typesNames}
                    </span>
                  )}
                </p>
              </div>
              <p className="text-sm mt-3">
                Cette action est irréversible.
              </p>
            </div>
          )}

          <div className="flex justify-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
