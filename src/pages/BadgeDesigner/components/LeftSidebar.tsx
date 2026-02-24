import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ImageIcon, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { BadgeFormat, BADGE_FORMATS } from '../../../shared/types/badge.types';
import { Button } from '../../../shared/ui/Button';
import { ZoomControls } from './ZoomControls';

interface LeftSidebarProps {
  format: BadgeFormat;
  onFormatChange: (format: BadgeFormat) => void;
  onAddElement: (type: 'text' | 'qrcode' | 'image', content?: string) => void;
  backgroundInputRef: React.RefObject<HTMLInputElement>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  onSaveTemplate: () => void;
  onSaveAndExit?: () => void;
  isSaving?: boolean;
  onGoBack?: () => void;
  onDeleteTemplate?: () => void;
  isDeleting?: boolean;
  isEditMode?: boolean;
  // Zoom controls props
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  format,
  onFormatChange,
  onAddElement,
  backgroundInputRef,
  onImageUpload,
  templateName,
  onTemplateNameChange,
  onSaveTemplate,
  onSaveAndExit,
  isSaving = false,
  onGoBack,
  onDeleteTemplate,
  isDeleting = false,
  isEditMode = false,
  zoom,
  onZoomIn,
  onZoomOut
}) => {
  const { t } = useTranslation('badges')
  return (
    <div className="w-80 bg-white dark:bg-gray-800 shadow-md flex flex-col border-r border-gray-200 dark:border-gray-700 relative">
      {/* Titre */}
      <div className="h-14 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3 shrink-0">
        {onGoBack && (
          <Button
            onClick={onGoBack}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0"
            title="Retour à la liste"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Button>
        )}
        <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
          Éditeur de Badges
        </h1>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
        <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Gestion des Templates</h3>
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
            disabled={!templateName.trim() || isSaving}
            className="w-full flex items-center justify-center gap-2"
            size="sm"
          >
            <Save size={16} />
            {isSaving ? t('designer.saving_template') : t('designer.save')}
          </Button>

          {onSaveAndExit && (
            <Button 
              onClick={onSaveAndExit}
              disabled={!templateName.trim() || isSaving}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              size="sm"
            >
              <Save size={16} />
              Sauvegarder et quitter
            </Button>
          )}

          {isEditMode && onDeleteTemplate && (
            <Button 
              onClick={onDeleteTemplate}
              disabled={isDeleting}
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
              size="sm"
            >
              <Trash2 size={16} />
              {isDeleting ? t('designer.deleting') : t('designer.delete')}
            </Button>
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
            onClick={() => onAddElement('qrcode', '{{registrationId}}')}
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

      {/* Variables */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Variables</h3>
        <div className="space-y-1">
          {[
            { key: 'firstName', label: 'Prénom' },
            { key: 'lastName', label: 'Nom' },
            { key: 'company', label: 'Entreprise' },
            { key: 'email', label: 'Email' },
            { key: 'eventName', label: 'Événement' },
            { key: 'attendeeType', label: 'Type de participant' },
          ].map(variable => (
            <button
              key={variable.key}
              onClick={() => onAddElement('text', `{{${variable.key}}}`)}
              className="w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100 dark:border-gray-600 rounded border"
            >
              {variable.label}
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* Zoom Controls - Fixed en bas */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800 flex justify-center">
        <ZoomControls
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      </div>
    </div>
  );
};