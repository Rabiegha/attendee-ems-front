import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, Calendar, Hash, Plus, X } from 'lucide-react';

interface VariableItem {
  key: string;
  label: string;
  example: string;
}

interface VariableCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  variables: VariableItem[];
}

const SYSTEM_CATEGORIES: VariableCategory[] = [
  {
    id: 'attendee',
    label: 'Participant',
    icon: <User size={13} />,
    variables: [
      { key: 'firstName', label: 'Prénom', example: 'Jean' },
      { key: 'lastName', label: 'Nom', example: 'Dupont' },
      { key: 'fullName', label: 'Nom complet', example: 'Jean Dupont' },
      { key: 'email', label: 'Email', example: 'jean@exemple.com' },
      { key: 'phone', label: 'Téléphone', example: '+33 6 12 34 56 78' },
      { key: 'company', label: 'Entreprise', example: 'Acme Corp' },
      { key: 'jobTitle', label: 'Poste', example: 'Développeur' },
      { key: 'country', label: 'Pays', example: 'France' },
      { key: 'attendeeType', label: 'Type de participant', example: 'VIP' },
    ],
  },
  {
    id: 'event',
    label: 'Événement',
    icon: <Calendar size={13} />,
    variables: [
      { key: 'eventName', label: 'Nom', example: 'Conférence 2026' },
      { key: 'eventCode', label: 'Code', example: 'CONF-2026' },
      { key: 'tableName', label: 'Table / Placement', example: 'Table 5' },
    ],
  },
  {
    id: 'technical',
    label: 'Technique',
    icon: <Hash size={13} />,
    variables: [
      { key: 'registrationId', label: 'ID inscription', example: 'abc-123' },
    ],
  },
];

interface VariablesSectionProps {
  onAddElement: (type: 'text' | 'qrcode' | 'image', content?: string) => void;
}

export const VariablesSection: React.FC<VariablesSectionProps> = ({ onAddElement }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['attendee']));
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customVarName, setCustomVarName] = useState('');

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddCustomVariable = () => {
    const name = customVarName.trim();
    if (!name) return;
    // Remove any existing braces the user might have typed
    const cleanName = name.replace(/[{}]/g, '').trim();
    if (!cleanName) return;
    onAddElement('text', `{{${cleanName}}}`);
    setCustomVarName('');
    setShowCustomInput(false);
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomVariable();
    } else if (e.key === 'Escape') {
      setCustomVarName('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400"
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          Variables
        </button>
      </div>

      {isOpen && (
        <div className="space-y-2">
          {/* System variables */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold px-0.5">
              Système
            </span>
            <div className="mt-1 space-y-0.5">
              {SYSTEM_CATEGORIES.map(category => (
                <div key={category.id}>
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-1.5 px-1.5 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {openCategories.has(category.id) ? (
                      <ChevronDown size={12} className="text-gray-400 shrink-0" />
                    ) : (
                      <ChevronRight size={12} className="text-gray-400 shrink-0" />
                    )}
                    <span className="shrink-0 text-gray-400">{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{category.variables.length}</span>
                  </button>

                  {/* Variable list */}
                  {openCategories.has(category.id) && (
                    <div className="ml-3 space-y-px">
                      {category.variables.map(variable => (
                        <button
                          key={variable.key}
                          onClick={() => onAddElement('text', `{{${variable.key}}}`)}
                          className="w-full flex items-center justify-between gap-2 px-2 py-1 text-xs rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 group/var transition-colors"
                          title={`Ajouter {{${variable.key}}} — ex: ${variable.example}`}
                        >
                          <span className="text-gray-700 dark:text-gray-200 truncate">
                            {variable.label}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover/var:text-blue-500 font-mono truncate shrink-0">
                            {variable.example}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom variables */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold px-0.5">
              Personnalisées
            </span>
            <div className="mt-1">
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-dashed border-blue-300 dark:border-blue-700 transition-colors"
                >
                  <Plus size={12} />
                  <span>Ajouter une variable</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <span className="text-xs text-gray-400 pl-1 select-none">{'{{'}</span>
                  <input
                    type="text"
                    value={customVarName}
                    onChange={e => setCustomVarName(e.target.value)}
                    onKeyDown={handleCustomKeyDown}
                    placeholder="nom_variable"
                    autoFocus
                    className="flex-1 min-w-0 bg-transparent text-xs text-gray-800 dark:text-gray-200 outline-none font-mono placeholder:text-gray-400"
                  />
                  <span className="text-xs text-gray-400 select-none">{'}}'}</span>
                  <button
                    onClick={handleAddCustomVariable}
                    disabled={!customVarName.trim()}
                    className="p-0.5 text-blue-500 hover:text-blue-700 disabled:text-gray-300 dark:disabled:text-gray-600 shrink-0"
                    title="Ajouter"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => { setCustomVarName(''); setShowCustomInput(false); }}
                    className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
                    title="Annuler"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-0.5 leading-tight">
                Correspond aux colonnes personnalisées de vos inscriptions (champs custom, import Excel…)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
