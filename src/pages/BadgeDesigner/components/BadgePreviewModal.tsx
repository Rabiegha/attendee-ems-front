import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { BadgeCanvas } from './BadgeCanvas';
import type { BadgeDesignData } from '../../../shared/types/badge.types';

interface BadgePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeData: BadgeDesignData;
  previewData: Record<string, string>;
  templateName?: string;
}

export const BadgePreviewModal: React.FC<BadgePreviewModalProps> = ({
  isOpen,
  onClose,
  badgeData,
  previewData,
  templateName = 'Badge Template'
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    // TODO: Implement badge download as PNG/PDF
    console.log('Download badge');
  };

  const handlePrint = () => {
    // TODO: Implement badge printing
    window.print();
  };

  // Replace variables in element content with preview data
  const processedElements = badgeData.elements.map(element => {
    if (element.type === 'text' && element.properties?.content) {
      let processedContent = element.properties.content;
      
      // Replace all variables {{key}} with preview data
      Object.entries(previewData).forEach(([key, value]) => {
        const variableRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedContent = processedContent.replace(variableRegex, value);
      });

      return {
        ...element,
        properties: {
          ...element.properties,
          content: processedContent
        }
      };
    }

    if (element.type === 'qr' && element.properties?.content) {
      let processedContent = element.properties.content;
      
      // Replace variables in QR code content
      Object.entries(previewData).forEach(([key, value]) => {
        const variableRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedContent = processedContent.replace(variableRegex, value);
      });

      return {
        ...element,
        properties: {
          ...element.properties,
          content: processedContent
        }
      };
    }

    return element;
  });



  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Aperçu du badge - {templateName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Prévisualisation avec données d'exemple
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex gap-8">
              {/* Badge Preview */}
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg p-8 min-h-[400px]">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <BadgeCanvas
                    dimensions={badgeData.dimensions}
                    elements={processedElements}
                    selectedElementId={null}
                    isPreviewMode={true}
                    onElementSelect={() => {}}
                    onElementUpdate={() => {}}
                    onElementDelete={() => {}}
                  />
                </div>
              </div>

              {/* Preview Data */}
              <div className="w-80">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Données utilisées
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {Object.entries(previewData).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <div className="text-sm font-medium text-gray-600">
                          {`{{${key}}}`}
                        </div>
                        <div className="text-sm text-gray-900 bg-white px-2 py-1 rounded border">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Télécharger PNG
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Printer size={16} />
                    Imprimer
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={handleDownload}>
              Télécharger
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};