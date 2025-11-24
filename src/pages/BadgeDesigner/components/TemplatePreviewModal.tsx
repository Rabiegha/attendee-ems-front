import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import type { BadgeTemplate } from '@/shared/types/badge.types';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: BadgeTemplate;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template
}) => {
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  // Générer des données d'exemple pour les variables du template
  useEffect(() => {
    if (!template.variables || template.variables.length === 0) {
      setPreviewData({});
      return;
    }

    const exampleData: Record<string, string> = {};
    
    template.variables.forEach((variable) => {
      const lowerVar = variable.toLowerCase();
      
      // Générer des données d'exemple basées sur le nom de la variable
      if (lowerVar.includes('nom') || lowerVar.includes('name') || lowerVar.includes('lastname')) {
        exampleData[variable] = 'Dupont';
      } else if (lowerVar.includes('prenom') || lowerVar.includes('firstname')) {
        exampleData[variable] = 'Jean';
      } else if (lowerVar.includes('email')) {
        exampleData[variable] = 'jean.dupont@example.com';
      } else if (lowerVar.includes('entreprise') || lowerVar.includes('company')) {
        exampleData[variable] = 'TechCorp Inc.';
      } else if (lowerVar.includes('poste') || lowerVar.includes('position') || lowerVar.includes('job')) {
        exampleData[variable] = 'Développeur Senior';
      } else if (lowerVar.includes('telephone') || lowerVar.includes('phone')) {
        exampleData[variable] = '+33 6 12 34 56 78';
      } else if (lowerVar.includes('ville') || lowerVar.includes('city')) {
        exampleData[variable] = 'Paris';
      } else if (lowerVar.includes('pays') || lowerVar.includes('country')) {
        exampleData[variable] = 'France';
      } else if (lowerVar.includes('event')) {
        exampleData[variable] = 'Conférence Tech 2025';
      } else if (lowerVar.includes('date')) {
        exampleData[variable] = new Date().toLocaleDateString('fr-FR');
      } else if (lowerVar.includes('qr') || lowerVar.includes('code')) {
        exampleData[variable] = 'https://example.com/participant/12345';
      } else {
        exampleData[variable] = `Exemple ${variable}`;
      }
    });

    setPreviewData(exampleData);
  }, [template.variables]);

  // Remplacer les variables dans le HTML
  const processedHtml = React.useMemo(() => {
    if (!template.html) return '';
    
    let html = template.html;
    Object.entries(previewData).forEach(([key, value]) => {
      const variableRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(variableRegex, value);
    });
    
    return html;
  }, [template.html, previewData]);

  // Créer le HTML complet avec les styles
  const fullHtml = React.useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 0;
              width: ${template.width}px;
              height: ${template.height}px;
            }
            ${template.css || ''}
          </style>
        </head>
        <body>
          ${processedHtml}
        </body>
      </html>
    `;
  }, [processedHtml, template.css, template.width, template.height]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Aperçu du template - ${template.name}`}
      maxWidth="4xl"
    >
      <div className="flex flex-col space-y-6">
        {/* Description */}
        {template.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {template.description}
          </p>
        )}

        {/* Informations du template */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Dimensions :</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {template.width} × {template.height}px
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Variables :</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {template.variables?.length || 0}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Utilisation :</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {template.usage_count} fois
              </span>
            </div>
            <div className="flex gap-2">
              {template.is_default && (
                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                  Par défaut
                </span>
              )}
              <span className={`px-2 py-1 text-xs rounded-full ${
                template.is_active 
                  ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                  : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
              }`}>
                {template.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        {/* Aperçu du badge */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Rendu du badge */}
          <div className="flex-1 flex justify-center items-center bg-gray-50 dark:bg-gray-900 rounded-lg p-8 min-h-[600px]">
            <div 
              className="bg-white shadow-lg"
              style={{
                width: `${template.width}px`,
                height: `${template.height}px`,
                maxWidth: '100%',
                maxHeight: '100%',
                transform: 'scale(1)',
                transformOrigin: 'center center'
              }}
            >
              <iframe
                srcDoc={fullHtml}
                title="Badge Preview"
                className="w-full h-full border-2 border-gray-300 dark:border-gray-600 rounded"
                style={{
                  width: `${template.width}px`,
                  height: `${template.height}px`,
                }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>

          {/* Variables utilisées */}
          {template.variables && template.variables.length > 0 && (
            <div className="w-full lg:w-80">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Données d'exemple
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {Object.entries(previewData).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {`{{${key}}}`}
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-3 py-2 rounded border border-gray-200 dark:border-gray-600">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Ces données sont des exemples générés automatiquement pour prévisualiser le template.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};
