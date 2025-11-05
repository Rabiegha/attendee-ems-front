import React from 'react';
import { Type, Image, QrCode, Square, Circle, Minus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import type { BadgeElement } from '@/shared/types/badge.types';

interface DesignerToolboxProps {
  onElementAdd: (element: BadgeElement) => void;
}

export const DesignerToolbox: React.FC<DesignerToolboxProps> = ({ onElementAdd }) => {
  const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addTextElement = () => {
    const element: BadgeElement = {
      id: generateId(),
      type: 'text',
      x: 50,
      y: 50,
      width: 150,
      height: 40,
      rotation: 0,
      properties: {
        content: 'Nouveau texte',
        fontSize: 16,
        color: '#000000',
        fontWeight: 'normal',
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif'
      }
    };
    onElementAdd(element);
  };

  const addImageElement = () => {
    const element: BadgeElement = {
      id: generateId(),
      type: 'image',
      x: 50,
      y: 100,
      width: 100,
      height: 100,
      rotation: 0,
      properties: {
        src: '',
        alt: 'Image',
        borderRadius: 0
      }
    };
    onElementAdd(element);
  };

  const addQRElement = () => {
    const element: BadgeElement = {
      id: generateId(),
      type: 'qr',
      x: 200,
      y: 50,
      width: 80,
      height: 80,
      rotation: 0,
      properties: {
        data: '{{attendeeId}}',
        errorCorrectionLevel: 'M'
      }
    };
    onElementAdd(element);
  };

  const addRectangleElement = () => {
    const element: BadgeElement = {
      id: generateId(),
      type: 'shape',
      x: 50,
      y: 200,
      width: 120,
      height: 60,
      rotation: 0,
      properties: {
        backgroundColor: '#3B82F6',
        borderRadius: 0,
        borderWidth: 0,
        borderColor: '#000000'
      }
    };
    onElementAdd(element);
  };

  const addCircleElement = () => {
    const element: BadgeElement = {
      id: generateId(),
      type: 'shape',
      x: 200,
      y: 200,
      width: 80,
      height: 80,
      rotation: 0,
      properties: {
        backgroundColor: '#10B981',
        borderRadius: 50, // 50% for circle
        borderWidth: 0,
        borderColor: '#000000'
      }
    };
    onElementAdd(element);
  };

  const addLineElement = () => {
    const element: BadgeElement = {
      id: generateId(),
      type: 'shape',
      x: 50,
      y: 300,
      width: 200,
      height: 2,
      rotation: 0,
      properties: {
        backgroundColor: '#6B7280',
        borderRadius: 0
      }
    };
    onElementAdd(element);
  };

  const toolGroups = [
    {
      title: 'Texte & Contenu',
      tools: [
        {
          icon: Type,
          label: 'Texte',
          description: 'Ajouter du texte',
          onClick: addTextElement
        },
        {
          icon: Image,
          label: 'Image',
          description: 'Ajouter une image',
          onClick: addImageElement
        },
        {
          icon: QrCode,
          label: 'QR Code',
          description: 'Ajouter un QR code',
          onClick: addQRElement
        }
      ]
    },
    {
      title: 'Formes',
      tools: [
        {
          icon: Square,
          label: 'Rectangle',
          description: 'Ajouter un rectangle',
          onClick: addRectangleElement
        },
        {
          icon: Circle,
          label: 'Cercle',
          description: 'Ajouter un cercle',
          onClick: addCircleElement
        },
        {
          icon: Minus,
          label: 'Ligne',
          description: 'Ajouter une ligne',
          onClick: addLineElement
        }
      ]
    }
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Outils
        </h3>
        
        {toolGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {group.title}
            </h4>
            
            <div className="grid gap-2">
              {group.tools.map((tool, toolIndex) => (
                <Button
                  key={toolIndex}
                  variant="outline"
                  size="sm"
                  leftIcon={<tool.icon className="h-4 w-4" />}
                  onClick={tool.onClick}
                  className="justify-start text-left"
                >
                  <div>
                    <div className="font-medium">{tool.label}</div>
                    <div className="text-xs text-gray-500">{tool.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Tips */}
      <Card className="p-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          💡 Conseils
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Cliquez sur un élément pour le sélectionner</li>
          <li>• Glissez-déposez pour déplacer</li>
          <li>• Utilisez la poignée bleue pour redimensionner</li>
          <li>• Variables: {`{{firstName}}`}, {`{{company}}`} etc.</li>
        </ul>
      </Card>
    </div>
  );
};