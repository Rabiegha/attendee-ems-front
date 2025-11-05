import React, { useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Plus, Eye, User, Building, Mail, Hash, Calendar, Tag } from 'lucide-react';

interface Variable {
  key: string;
  label: string;
  description: string;
  category: 'attendee' | 'event' | 'organization' | 'system';
  icon: React.ReactNode;
  example: string;
}

interface VariablesPanelProps {
  onInsertVariable: (variableKey: string) => void;
  onPreviewVariables: (variables: Record<string, string>) => void;
}

const AVAILABLE_VARIABLES: Variable[] = [
  // Variables participant
  {
    key: 'firstName',
    label: 'Prénom',
    description: 'Prénom du participant',
    category: 'attendee',
    icon: <User size={16} />,
    example: 'Jean'
  },
  {
    key: 'lastName',
    label: 'Nom',
    description: 'Nom de famille du participant',
    category: 'attendee',
    icon: <User size={16} />,
    example: 'Dupont'
  },
  {
    key: 'email',
    label: 'Email',
    description: 'Adresse email du participant',
    category: 'attendee',
    icon: <Mail size={16} />,
    example: 'jean.dupont@exemple.com'
  },
  {
    key: 'company',
    label: 'Entreprise',
    description: 'Nom de l\'entreprise',
    category: 'attendee',
    icon: <Building size={16} />,
    example: 'Acme Corp'
  },
  {
    key: 'jobTitle',
    label: 'Poste',
    description: 'Titre du poste',
    category: 'attendee',
    icon: <Tag size={16} />,
    example: 'Développeur Senior'
  },
  {
    key: 'attendeeId',
    label: 'ID Participant',
    description: 'Identifiant unique du participant',
    category: 'attendee',
    icon: <Hash size={16} />,
    example: 'ATT-001'
  },

  // Variables événement
  {
    key: 'eventName',
    label: 'Nom de l\'événement',
    description: 'Titre de l\'événement',
    category: 'event',
    icon: <Calendar size={16} />,
    example: 'Conférence Tech 2024'
  },
  {
    key: 'eventDate',
    label: 'Date événement',
    description: 'Date de l\'événement',
    category: 'event',
    icon: <Calendar size={16} />,
    example: '15-16 Nov 2024'
  },
  {
    key: 'eventLocation',
    label: 'Lieu événement',
    description: 'Lieu de l\'événement',
    category: 'event',
    icon: <Building size={16} />,
    example: 'Paris, France'
  },

  // Variables organisation
  {
    key: 'orgName',
    label: 'Organisation',
    description: 'Nom de l\'organisation',
    category: 'organization',
    icon: <Building size={16} />,
    example: 'EventCorp'
  },
];

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  onInsertVariable,
  onPreviewVariables,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewMode, setPreviewMode] = useState(false);

  const categories = [
    { key: 'all', label: 'Toutes', icon: <Tag size={16} /> },
    { key: 'attendee', label: 'Participant', icon: <User size={16} /> },
    { key: 'event', label: 'Événement', icon: <Calendar size={16} /> },
    { key: 'organization', label: 'Organisation', icon: <Building size={16} /> },
  ];

  const filteredVariables = selectedCategory === 'all' 
    ? AVAILABLE_VARIABLES 
    : AVAILABLE_VARIABLES.filter(v => v.category === selectedCategory);

  const handlePreviewToggle = () => {
    if (!previewMode) {
      // Générer des exemples de données pour la prévisualisation
      const previewData = AVAILABLE_VARIABLES.reduce((acc, variable) => {
        acc[variable.key] = variable.example;
        return acc;
      }, {} as Record<string, string>);
      
      onPreviewVariables(previewData);
    } else {
      // Revenir à l'affichage normal
      onPreviewVariables({});
    }
    
    setPreviewMode(!previewMode);
  };

  const handleInsertVariable = (variableKey: string) => {
    onInsertVariable(`{{${variableKey}}}`);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Variables</h3>
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            onClick={handlePreviewToggle}
            className="flex items-center gap-2"
          >
            <Eye size={16} />
            {previewMode ? 'Mode normal' : 'Prévisualiser'}
          </Button>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedCategory === category.key
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {previewMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
              <Eye size={16} />
              Mode prévisualisation
            </div>
            <div className="text-blue-600 text-xs">
              Les variables sont remplacées par des exemples de données dans le canvas
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filteredVariables.map((variable) => (
            <div
              key={variable.key}
              className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500">{variable.icon}</span>
                    <span className="font-medium text-gray-800">{variable.label}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {`{{${variable.key}}}`}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{variable.description}</p>
                  
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Exemple:</span> {variable.example}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsertVariable(variable.key)}
                  className="ml-2 shrink-0"
                  title={`Insérer {{${variable.key}}}`}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredVariables.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-lg font-medium mb-2">Aucune variable trouvée</div>
            <div className="text-sm">
              Essayez de changer de catégorie
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Comment utiliser</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Cliquez sur <Plus size={12} className="inline mx-1" /> pour insérer une variable</div>
            <div>• Les variables sont automatiquement remplacées lors de la génération</div>
            <div>• Utilisez le mode prévisualisation pour tester l'apparence</div>
          </div>
        </div>
      </div>
    </div>
  );
};