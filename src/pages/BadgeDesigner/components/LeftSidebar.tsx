import React from 'react';
import { Plus, ImageIcon, Save, Link } from 'lucide-react';
import { BadgeFormat, BADGE_FORMATS } from '../../../shared/types/badge.types';
import { Button } from '../../../shared/ui/Button';

interface LeftSidebarProps {
  format: BadgeFormat;
  onFormatChange: (format: BadgeFormat) => void;
  onAddElement: (type: 'text' | 'qrcode' | 'image', content?: string) => void;
  backgroundInputRef: React.RefObject<HTMLInputElement>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  availableTemplates: string[];
  onSaveTemplate: () => void;
  onLoadTemplate: (templateName: string) => void;
  copiedUrl: string;
  onCopyUrl: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  format,
  onFormatChange,
  onAddElement,
  backgroundInputRef,
  onImageUpload,
  templateName,
  onTemplateNameChange,
  availableTemplates,
  onSaveTemplate,
  onLoadTemplate,
  copiedUrl,
  onCopyUrl
}) => {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col space-y-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
        <select 
          className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          value={format.name}
          onChange={(e) => {
            const selectedFormat = Object.values(BADGE_FORMATS).find(f => f.name === e.target.value);
            if (selectedFormat) {
              onFormatChange(selectedFormat);
            }
          }}
        >
          <option value="96x268mm">Large - 96x268mm</option>
          <option value="96x164mm">Petit - 96x164mm</option>
        </select>
      </div>

      {/* Template Management */}
      <div className="border-t pt-4">
        <h3 className="font-medium mb-2 text-gray-800">Gestion des Templates</h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nom du template"
            value={templateName}
            onChange={(e) => onTemplateNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          
          <Button 
            onClick={onSaveTemplate}
            disabled={!templateName.trim()}
            className="w-full flex items-center justify-center gap-2"
            size="sm"
          >
            <Save size={16} />
            Sauvegarder
          </Button>

          {availableTemplates.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Templates disponibles
              </label>
              <select 
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onChange={(e) => {
                  if (e.target.value) {
                    onLoadTemplate(e.target.value);
                  }
                }}
                defaultValue=""
              >
                <option value="">Sélectionner un template</option>
                {availableTemplates.map(template => (
                  <option key={template} value={template}>{template}</option>
                ))}
              </select>
            </div>
          )}

          <Button 
            onClick={onCopyUrl}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            size="sm"
          >
            <Link size={16} />
            Copier URL
          </Button>
          
          {copiedUrl && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
              URL copiée !
            </div>
          )}
        </div>
      </div>

      {/* Elements */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Éléments</h3>
        <div className="space-y-2">
          <Button
            onClick={() => onAddElement('text', 'Nouveau texte')}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            size="sm"
          >
            <Plus size={16} />
            Ajouter Texte
          </Button>

          <Button
            onClick={() => onAddElement('qrcode', 'https://example.com')}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            size="sm"
          >
            <Plus size={16} />
            Ajouter QR Code
          </Button>

          <Button
            onClick={() => backgroundInputRef.current?.click()}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            size="sm"
          >
            <ImageIcon size={16} />
            Ajouter Image
          </Button>
          
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            multiple
          />
        </div>
      </div>

      {/* Variables EMS */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Variables EMS</h3>
        <div className="space-y-1">
          {[
            { key: 'firstName', label: 'Prénom' },
            { key: 'lastName', label: 'Nom' },
            { key: 'company', label: 'Entreprise' },
            { key: 'email', label: 'Email' },
            { key: 'eventName', label: 'Événement' },
            { key: 'attendeeId', label: 'ID Participant' }
          ].map(variable => (
            <button
              key={variable.key}
              onClick={() => onAddElement('text', `{{${variable.key}}}}`)}
              className="w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100 dark:border-gray-600 rounded border"
            >
              {`{{${variable.key}}}`} - {variable.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};