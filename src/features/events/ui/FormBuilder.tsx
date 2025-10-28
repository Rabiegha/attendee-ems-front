import React, { useEffect, useCallback } from 'react'
import { Plus, Trash2, GripVertical, Undo2, Redo2 } from 'lucide-react'
import { Button } from '@/shared/ui/Button'

export interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea'
  required: boolean
  placeholder?: string
  options?: string[] // Pour les selects
}

interface FormBuilderProps {
  fields: FormField[]
  onChange: (fields: FormField[]) => void
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texte' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Téléphone' },
  { value: 'select', label: 'Liste déroulante' },
  { value: 'textarea', label: 'Texte long' },
]

const DEFAULT_FIELDS: FormField[] = [
  {
    id: 'firstName',
    name: 'firstName',
    label: 'Prénom',
    type: 'text',
    required: true,
  },
  {
    id: 'lastName',
    name: 'lastName',
    label: 'Nom',
    type: 'text',
    required: true,
  },
  { id: 'email', name: 'email', label: 'Email', type: 'email', required: true },
]

export const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  onChange,
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)

  // Undo/Redo History
  const [history, setHistory] = React.useState<FormField[][]>([fields])
  const [historyIndex, setHistoryIndex] = React.useState(0)
  const [isUpdatingFromHistory, setIsUpdatingFromHistory] =
    React.useState(false)

  // Initialize history when fields prop changes externally (not from undo/redo)
  useEffect(() => {
    if (!isUpdatingFromHistory && fields.length > 0) {
      const lastHistoryEntry = history[historyIndex]
      const fieldsChanged =
        JSON.stringify(lastHistoryEntry) !== JSON.stringify(fields)

      if (fieldsChanged && lastHistoryEntry) {
        // Only update if fields actually changed
        setHistory((prev) => {
          const newHistory = prev.slice(0, historyIndex + 1)
          newHistory.push(fields)
          return newHistory.slice(-50) // Keep last 50 entries
        })
        setHistoryIndex((prev) => Math.min(prev + 1, 49))
      }
    }
    setIsUpdatingFromHistory(false)
  }, [fields])

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setIsUpdatingFromHistory(true)
      const historyEntry = history[newIndex]
      if (historyEntry) {
        onChange(historyEntry)
      }
    }
  }, [historyIndex, history, onChange])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setIsUpdatingFromHistory(true)
      const historyEntry = history[newIndex]
      if (historyEntry) {
        onChange(historyEntry)
      }
    }
  }, [historyIndex, history, onChange])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      name: `field_${fields.length + 1}`,
      label: 'Nouveau champ',
      type: 'text',
      required: false,
    }
    const newFields = [...fields, newField]
    onChange(newFields)
    // History will be updated automatically via useEffect
  }

  const removeField = (id: string) => {
    const newFields = fields.filter((f) => f.id !== id)
    onChange(newFields)
    // History will be updated automatically via useEffect
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    const newFields = fields.map((f) =>
      f.id === id ? { ...f, ...updates } : f
    )
    onChange(newFields)
    // History will be updated automatically via useEffect
  }

  const resetToDefaults = () => {
    onChange(DEFAULT_FIELDS)
    // History will be updated automatically via useEffect
  }

  // Drag & Drop handlers
  const handleDragStart = (index: number, e: React.DragEvent) => {
    setDraggedIndex(index)

    // Create a custom drag image showing the entire field card
    const dragTarget = e.currentTarget.closest('.field-card') as HTMLElement
    if (dragTarget) {
      const clone = dragTarget.cloneNode(true) as HTMLElement
      clone.style.position = 'absolute'
      clone.style.top = '-9999px'
      clone.style.width = dragTarget.offsetWidth + 'px'
      clone.style.opacity = '0.8'
      document.body.appendChild(clone)
      e.dataTransfer.setDragImage(clone, 0, 0)
      setTimeout(() => document.body.removeChild(clone), 0)
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === index) return

    const newFields = [...fields]
    const draggedItem = newFields[draggedIndex]

    if (!draggedItem) return

    // Remove from old position
    newFields.splice(draggedIndex, 1)
    // Insert at new position
    newFields.splice(index, 0, draggedItem)

    onChange(newFields)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    // History will be updated automatically via useEffect
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Configuration des champs
        </h3>
        <div className="flex items-center space-x-2">
          {/* Undo/Redo Buttons */}
          <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Annuler (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Rétablir (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            Réinitialiser
          </Button>
          <Button size="sm" onClick={addField}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter un champ
          </Button>
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Aucun champ configuré
            </p>
            <Button onClick={resetToDefaults}>
              Charger les champs par défaut
            </Button>
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              onDragOver={(e) => handleDragOver(e, index)}
              className={`field-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all duration-200 ${
                draggedIndex === index ? 'opacity-50 scale-95' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Drag handle - Only this area is draggable */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(index, e)}
                  onDragEnd={handleDragEnd}
                  className="pt-2 cursor-move text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Field Configuration */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Label */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        updateField(field.id, { label: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(field.id, {
                          type: e.target.value as FormField['type'],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    >
                      {FIELD_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Placeholder */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) =>
                        updateField(field.id, { placeholder: e.target.value })
                      }
                      placeholder="Ex: Entrez votre nom"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    />
                  </div>

                  {/* Options (si select) */}
                  {field.type === 'select' && (
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Options (séparées par des virgules)
                      </label>
                      <input
                        type="text"
                        value={field.options?.join(', ') || ''}
                        onChange={(e) =>
                          updateField(field.id, {
                            options: e.target.value
                              .split(',')
                              .map((o) => o.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        updateField(field.id, { required: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Requis
                    </span>
                  </label>
                  <button
                    onClick={() => removeField(field.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Supprimer le champ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Info :</strong> Les champs Prénom, Nom et Email sont
            recommandés pour identifier les participants. Vous pouvez ajouter
            des champs personnalisés selon vos besoins.
          </p>
        </div>

        {/* History Status */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <span>Historique:</span>
            <span className="font-mono font-semibold text-gray-900 dark:text-white">
              {historyIndex + 1} / {history.length}
            </span>
          </div>
          <div className="text-[10px] mt-1 text-gray-500 dark:text-gray-500">
            Ctrl+Z / Ctrl+Y
          </div>
        </div>
      </div>
    </div>
  )
}
