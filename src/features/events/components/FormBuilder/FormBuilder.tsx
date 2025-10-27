import React, { useState } from 'react'
import { GripVertical, Trash2, Lock, Plus, X } from 'lucide-react'
import { PredefinedFieldTemplate, PREDEFINED_FIELDS } from './FormFieldLibrary'

export interface FormField extends Omit<PredefinedFieldTemplate, 'id'> {
  id: string
  order: number
}

export interface FormConfig {
  fields: FormField[]
  submitButtonText?: string
  submitButtonColor?: string
  showTitle?: boolean
  showDescription?: boolean
}

interface FormBuilderProps {
  fields: FormField[]
  onChange: (fields: FormField[]) => void
  submitButtonText?: string
  submitButtonColor?: string
  showTitle?: boolean
  showDescription?: boolean
  onConfigChange?: (config: { 
    submitButtonText?: string
    submitButtonColor?: string
    showTitle?: boolean
    showDescription?: boolean
  }) => void
  className?: string
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  onChange,
  submitButtonText = 'S\'inscrire',
  submitButtonColor = '#4F46E5',
  showTitle = true,
  showDescription = true,
  onConfigChange,
  className = '',
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [newOptions, setNewOptions] = useState<Record<string, string>>({})
  const [customColor, setCustomColor] = useState<string>(submitButtonColor)
  const [isDragEnabled, setIsDragEnabled] = useState<boolean>(false)

  const handleAddField = (fieldKey: string) => {
    const template = PREDEFINED_FIELDS.find(f => f.key === fieldKey)
    if (!template) return

    const newField: FormField = {
      ...template,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: fields.length,
      placeholder: '', // Vide par défaut
    }
    onChange([...fields, newField])
  }

  const handleRemoveField = (fieldId: string) => {
    const updatedFields = fields
      .filter(f => f.id !== fieldId)
      .map((f, index) => ({ ...f, order: index }))
    onChange(updatedFields)
  }

  const handleToggleRequired = (fieldId: string) => {
    const updatedFields = fields.map(f =>
      f.id === fieldId ? { ...f, required: !f.required } : f
    )
    onChange(updatedFields)
  }

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map(f =>
      f.id === fieldId ? { ...f, ...updates } : f
    )
    onChange(updatedFields)
  }

  const handleAddOption = (fieldId: string) => {
    const optionValue = newOptions[fieldId]?.trim()
    if (!optionValue) return
    
    const field = fields.find(f => f.id === fieldId)
    if (!field || field.type !== 'select') return
    
    const currentOptions = field.options || []
    const newOption = { value: optionValue, label: optionValue }
    
    handleUpdateField(fieldId, {
      options: [...currentOptions, newOption]
    })
    
    setNewOptions(prev => ({ ...prev, [fieldId]: '' }))
  }

  const handleRemoveOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId)
    if (!field || field.type !== 'select' || !field.options) return
    
    const newOptions = field.options.filter((_, idx) => idx !== optionIndex)
    handleUpdateField(fieldId, { options: newOptions })
  }

  const handleUpdateOption = (fieldId: string, optionIndex: number, newLabel: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (!field || field.type !== 'select' || !field.options) return
    
    const updatedOptions = field.options.map((opt, idx) =>
      idx === optionIndex ? { value: newLabel, label: newLabel } : opt
    )
    handleUpdateField(fieldId, { options: updatedOptions })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const updatedFields = [...fields]
    const [draggedItem] = updatedFields.splice(draggedIndex, 1)
    if (!draggedItem) return
    
    updatedFields.splice(index, 0, draggedItem)
    
    const reorderedFields = updatedFields.map((f, idx) => ({ ...f, order: idx }))
    onChange(reorderedFields)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setIsDragEnabled(false)
  }

  const getFieldIcon = (field: FormField) => {
    // Si l'icône est un composant, l'utiliser directement
    if (typeof field.icon === 'function') {
      const Icon = field.icon
      return <Icon className="w-4 h-4" />
    }
    
    // Sinon, chercher le champ dans PREDEFINED_FIELDS par sa clé
    const predefinedField = PREDEFINED_FIELDS.find(f => f.key === field.key)
    if (predefinedField?.icon) {
      const Icon = predefinedField.icon
      return <Icon className="w-4 h-4" />
    }
    
    // Fallback: pas d'icône
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Champs du formulaire
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {fields.length} champ{fields.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Add Field Dropdown */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
        <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">
          ➕ Ajouter un champ
        </label>
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleAddField(e.target.value)
              e.target.value = ''
            }
          }}
          className="w-full px-3 py-2 border border-indigo-300 dark:border-indigo-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Choisir un type de champ --</option>
          {PREDEFINED_FIELDS
            .filter(field => field.key !== 'attendee_type')
            .map((field) => (
              <option key={field.key} value={field.key}>
                {field.label} ({field.type})
              </option>
            ))}
        </select>
      </div>

      {/* Field List */}
      {fields.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Aucun champ</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Ajoutez des champs ci-dessus
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              draggable={isDragEnabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                bg-white dark:bg-gray-800 border-2 rounded-xl p-4 transition-all
                ${draggedIndex === index ? 'opacity-50 border-indigo-400 shadow-lg' : 'border-gray-200 dark:border-gray-700'}
                hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md
              `}
            >
              <div className="flex items-start gap-4">
                {/* Drag Handle + Icon */}
                <div className="flex items-center gap-2">
                  <div
                    onMouseDown={() => setIsDragEnabled(true)}
                    onMouseUp={() => setIsDragEnabled(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="text-indigo-600 dark:text-indigo-400">
                    {getFieldIcon(field)}
                  </div>
                </div>

                {/* Field Content */}
                <div className="flex-1 space-y-3">
                  {/* Label & Placeholder */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Label <span className="text-gray-400">(optionnel)</span>
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                        placeholder="Laisser vide si non utilisé"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                        placeholder="Ex: Votre nom"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize font-medium">{field.type}</span>
                    <span>•</span>
                    <span className="font-mono">{field.key}</span>
                    {field.required && (
                      <>
                        <span>•</span>
                        <span className="text-red-600 dark:text-red-400 font-medium">Obligatoire</span>
                      </>
                    )}
                  </div>

                  {/* Options for Select Fields */}
                  {field.type === 'select' && (
                    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Options de choix
                      </label>
                      {field.options && field.options.length > 0 && (
                        <div className="space-y-1.5">
                          {field.options.map((option, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{optIdx + 1}.</span>
                              <input
                                type="text"
                                value={option.label}
                                onChange={(e) => handleUpdateOption(field.id, optIdx, e.target.value)}
                                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                onClick={() => handleRemoveOption(field.id, optIdx)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newOptions[field.id] || ''}
                          onChange={(e) => setNewOptions(prev => ({ ...prev, [field.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddOption(field.id)}
                          placeholder="Ajouter une option..."
                          className="flex-1 px-3 py-1.5 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleAddOption(field.id)}
                          className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                          title="Ajouter"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRequired(field.id)}
                    className={`
                      p-2 rounded-lg transition-all
                      ${field.required
                        ? 'text-white bg-red-500 hover:bg-red-600 shadow-sm'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }
                    `}
                    title={field.required ? 'Rendre optionnel' : 'Rendre obligatoire'}
                  >
                    <Lock className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleRemoveField(field.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Controls */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Affichage du formulaire
        </h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={showTitle}
              onChange={(e) => onConfigChange?.({ submitButtonText, submitButtonColor, showTitle: e.target.checked, showDescription })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Afficher le titre de l'événement
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={showDescription}
              onChange={(e) => onConfigChange?.({ submitButtonText, submitButtonColor, showTitle, showDescription: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Afficher la description de l'événement
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button Configuration */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          🎨 Personnalisation du bouton
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Texte du bouton
            </label>
            <input
              type="text"
              value={submitButtonText}
              onChange={(e) => onConfigChange?.({ submitButtonText: e.target.value, submitButtonColor })}
              placeholder="Ex: S'inscrire maintenant"
              className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Couleur
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value)
                  onConfigChange?.({ submitButtonText, submitButtonColor: e.target.value })
                }}
                className="w-12 h-9 rounded-lg border border-purple-300 dark:border-purple-600 cursor-pointer"
                title="Choisir une couleur"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const value = e.target.value
                  setCustomColor(value)
                  // Valider que c'est un code hexa valide avant de sauvegarder
                  if (/^#[0-9A-F]{6}$/i.test(value)) {
                    onConfigChange?.({ submitButtonText, submitButtonColor: value })
                  }
                }}
                placeholder="#4F46E5"
                className="flex-1 px-3 py-2 text-sm font-mono border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
