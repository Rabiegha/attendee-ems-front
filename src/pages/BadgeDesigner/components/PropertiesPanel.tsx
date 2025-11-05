import React from 'react';import React from 'react';import React from 'react';import React from 'react';import React from 'react';

import { BadgeElement } from '../../../shared/types/badge.types';

import { Button } from '../../../shared/ui/Button';import { BadgeElement } from '../../../shared/types/badge.types';

import { Trash2 } from 'lucide-react';

import { Button } from '../../../shared/ui/Button';import { BadgeElement } from '../../../shared/types/badge.types';

interface PropertiesPanelProps {

  selectedElement: BadgeElement | null;import { Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

  onUpdateElement: (id: string, updates: Partial<BadgeElement>) => void;

  onDeleteElement: (id: string) => void;import { Button } from '../../../shared/ui/Button';import { BadgeElement } from '../../../shared/types/badge.types';import { BadgeElement } from '../../../shared/types/badge.types';

}

interface PropertiesPanelProps {

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({

  selectedElement,  selectedElement: BadgeElement | null;import { Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

  onUpdateElement,

  onDeleteElement,  onUpdateElement: (id: string, updates: Partial<BadgeElement>) => void;

}) => {

  if (!selectedElement) {  onDeleteElement: (id: string) => void;import { Button } from '../../../shared/ui/Button';import { Button } from '../../../shared/ui/Button';

    return (

      <div className="w-80 bg-white border-l border-gray-200 p-4">}

        <div className="text-center text-gray-500 py-8">

          <div className="text-lg font-medium mb-2">Aucun élément sélectionné</div>interface PropertiesPanelProps {

          <div className="text-sm">

            Cliquez sur un élément du canvas pour modifier ses propriétésexport const PropertiesPanel: React.FC<PropertiesPanelProps> = ({

          </div>

        </div>  selectedElement,  selectedElement: BadgeElement | null;import { Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';import { Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

      </div>

    );  onUpdateElement,

  }

  onDeleteElement,  onUpdateElement: (id: string, updates: Partial<BadgeElement>) => void;

  const handleUpdateProperty = (property: string, value: any) => {

    onUpdateElement(selectedElement.id, { [property]: value });}) => {

  };

  if (!selectedElement) {  onDeleteElement: (id: string) => void;

  const handlePropertiesUpdate = (property: string, value: any) => {

    onUpdateElement(selectedElement.id, {    return (

      properties: { ...selectedElement.properties, [property]: value }

    });      <div className="w-80 bg-white border-l border-gray-200 p-4">}

  };

        <div className="text-center text-gray-500 py-8">

  return (

    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">          <div className="text-lg font-medium mb-2">Aucun élément sélectionné</div>interface PropertiesPanelProps {interface PropertiesPanelProps {

      <div className="p-4 border-b border-gray-200">

        <div className="flex items-center justify-between mb-2">          <div className="text-sm">

          <h3 className="text-lg font-semibold text-gray-800">Propriétés</h3>

          <Button            Cliquez sur un élément du canvas pour modifier ses propriétésexport const PropertiesPanel: React.FC<PropertiesPanelProps> = ({

            variant="outline"

            size="sm"          </div>

            onClick={() => onDeleteElement(selectedElement.id)}

            className="text-red-600 hover:text-red-700 hover:bg-red-50"        </div>  selectedElement,  selectedElement: BadgeElement | null;  selectedElement: BadgeElement | null;

          >

            <Trash2 size={16} />      </div>

          </Button>

        </div>    );  onUpdateElement,

        <div className="text-sm text-gray-500 capitalize">

          {selectedElement.type === 'qr' ? 'QR Code' : selectedElement.type}  }

        </div>

      </div>  onDeleteElement,  onUpdateElement: (id: string, updates: Partial<BadgeElement>) => void;  onUpdateElement: (id: string, updates: Partial<BadgeElement>) => void;



      <div className="p-4 space-y-6">  const handleUpdateProperty = (property: string, value: any) => {

        {/* Position et dimensions */}

        <div className="space-y-4">    onUpdateElement(selectedElement.id, { [property]: value });}) => {

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">  };

              Position

            </label>  if (!selectedElement) {  onDeleteElement: (id: string) => void;  onDeleteElement: (id: string) => void;

            <div className="grid grid-cols-2 gap-2">

              <div>  const handlePropertiesUpdate = (property: string, value: any) => {

                <label className="text-xs text-gray-500">X</label>

                <input    onUpdateElement(selectedElement.id, {    return (

                  type="number"

                  value={selectedElement.x}      properties: { ...selectedElement.properties, [property]: value }

                  onChange={(e) => handleUpdateProperty('x', parseInt(e.target.value))}

                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"    });      <div className="w-80 bg-white border-l border-gray-200 p-4">}}

                />

              </div>  };

              <div>

                <label className="text-xs text-gray-500">Y</label>        <div className="text-center text-gray-500 py-8">

                <input

                  type="number"  return (

                  value={selectedElement.y}

                  onChange={(e) => handleUpdateProperty('y', parseInt(e.target.value))}    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">          <div className="text-lg font-medium mb-2">Aucun élément sélectionné</div>

                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"

                />      <div className="p-4 border-b border-gray-200">

              </div>

            </div>        <div className="flex items-center justify-between mb-2">          <div className="text-sm">

          </div>

          <h3 className="text-lg font-semibold text-gray-800">Propriétés</h3>

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">          <Button            Cliquez sur un élément du canvas pour modifier ses propriétésexport const PropertiesPanel: React.FC<PropertiesPanelProps> = ({export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({

              Dimensions

            </label>            variant="outline"

            <div className="grid grid-cols-2 gap-2">

              <div>            size="sm"          </div>

                <label className="text-xs text-gray-500">Largeur</label>

                <input            onClick={() => onDeleteElement(selectedElement.id)}

                  type="number"

                  value={selectedElement.width}            className="text-red-600 hover:text-red-700 hover:bg-red-50"        </div>  selectedElement,  selectedElement,

                  onChange={(e) => handleUpdateProperty('width', parseInt(e.target.value))}

                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"          >

                />

              </div>            <Trash2 size={16} />      </div>

              <div>

                <label className="text-xs text-gray-500">Hauteur</label>          </Button>

                <input

                  type="number"        </div>    );  onUpdateElement,  onUpdateElement,

                  value={selectedElement.height}

                  onChange={(e) => handleUpdateProperty('height', parseInt(e.target.value))}        <div className="text-sm text-gray-500 capitalize">

                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"

                />          {selectedElement.type === 'qr' ? 'QR Code' : selectedElement.type}  }

              </div>

            </div>        </div>

          </div>

      </div>  onDeleteElement,  onDeleteElement,

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">

              Rotation

            </label>      <div className="p-4 space-y-6">  const handleUpdateProperty = (property: string, value: any) => {

            <input

              type="range"        {/* Position et dimensions */}

              min="0"

              max="360"        <div className="space-y-4">    onUpdateElement(selectedElement.id, { [property]: value });}) => {}) => {

              value={selectedElement.rotation || 0}

              onChange={(e) => handleUpdateProperty('rotation', parseInt(e.target.value))}          <div>

              className="w-full"

            />            <label className="block text-sm font-medium text-gray-700 mb-2">  };

            <div className="text-center text-xs text-gray-500 mt-1">

              {selectedElement.rotation || 0}°              Position

            </div>

          </div>            </label>  if (!selectedElement) {  if (!selectedElement) {

        </div>

            <div className="grid grid-cols-2 gap-2">

        <hr className="border-gray-200" />

              <div>  const handlePropertiesUpdate = (property: string, value: any) => {

        {/* Propriétés spécifiques selon le type */}

        {selectedElement.type === 'text' && (                <label className="text-xs text-gray-500">X</label>

          <div className="space-y-4">

            <div>                <input    onUpdateElement(selectedElement.id, {    return (    return (

              <label className="block text-sm font-medium text-gray-700 mb-2">

                Contenu                  type="number"

              </label>

              <textarea                  value={selectedElement.x}      properties: { ...selectedElement.properties, [property]: value }

                value={selectedElement.properties?.content || ''}

                onChange={(e) => handlePropertiesUpdate('content', e.target.value)}                  onChange={(e) => handleUpdateProperty('x', parseInt(e.target.value))}

                className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-sm"

                rows={3}                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"    });      <div className="w-80 bg-white border-l border-gray-200 p-4">      <div className="w-80 bg-white border-l border-gray-200 p-4">

                placeholder="Tapez votre texte"

              />                />

              <div className="text-xs text-gray-500 mt-1">

                Utilisez {`{{firstName}}`}, {`{{lastName}}`} pour les variables              </div>  };

              </div>

            </div>              <div>



            <div>                <label className="text-xs text-gray-500">Y</label>        <div className="text-center text-gray-500 py-8">        <div className="text-center text-gray-500 py-8">

              <label className="block text-sm font-medium text-gray-700 mb-2">

                Taille de police                <input

              </label>

              <input                  type="number"  const renderCommonProperties = () => (

                type="number"

                value={selectedElement.properties?.fontSize || 16}                  value={selectedElement.y}

                onChange={(e) => handlePropertiesUpdate('fontSize', parseInt(e.target.value))}

                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"                  onChange={(e) => handleUpdateProperty('y', parseInt(e.target.value))}    <div className="space-y-4">          <div className="text-lg font-medium mb-2">Aucun élément sélectionné</div>          <div className="text-lg font-medium mb-2">Aucun élément sélectionné</div>

                min="8"

                max="72"                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"

              />

            </div>                />      <div>



            <div>              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">

                Couleur            </div>        <label className="block text-sm font-medium text-gray-700 mb-2">          <div className="text-sm">          <div className="text-sm">

              </label>

              <div className="flex gap-2">          </div>

                <input

                  type="color"          Position

                  value={selectedElement.properties?.color || '#000000'}

                  onChange={(e) => handlePropertiesUpdate('color', e.target.value)}          <div>

                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"

                />            <label className="block text-sm font-medium text-gray-700 mb-2">        </label>            Cliquez sur un élément du canvas pour modifier ses propriétés            Cliquez sur un élément du canvas pour modifier ses propriétés

                <input

                  type="text"              Dimensions

                  value={selectedElement.properties?.color || '#000000'}

                  onChange={(e) => handlePropertiesUpdate('color', e.target.value)}            </label>        <div className="grid grid-cols-2 gap-2">

                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"

                />            <div className="grid grid-cols-2 gap-2">

              </div>

            </div>              <div>          <div>          </div>          </div>

          </div>

        )}                <label className="text-xs text-gray-500">Largeur</label>



        {selectedElement.type === 'image' && (                <input            <label className="text-xs text-gray-500">X</label>

          <div className="space-y-4">

            <div>                  type="number"

              <label className="block text-sm font-medium text-gray-700 mb-2">

                URL de l'image                  value={selectedElement.width}            <input        </div>        </div>

              </label>

              <input                  onChange={(e) => handleUpdateProperty('width', parseInt(e.target.value))}

                type="url"

                value={selectedElement.properties?.src || ''}                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"              type="number"

                onChange={(e) => handlePropertiesUpdate('src', e.target.value)}

                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"                />

                placeholder="https://exemple.com/image.jpg"

              />              </div>              value={selectedElement.x}      </div>      </div>

            </div>

          </div>              <div>

        )}

                <label className="text-xs text-gray-500">Hauteur</label>              onChange={(e) => handleUpdateProperty('x', parseInt(e.target.value))}

        {selectedElement.type === 'qr' && (

          <div className="space-y-4">                <input

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">                  type="number"              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"    );    );

                Contenu du QR Code

              </label>                  value={selectedElement.height}

              <textarea

                value={selectedElement.properties?.content || ''}                  onChange={(e) => handleUpdateProperty('height', parseInt(e.target.value))}            />

                onChange={(e) => handlePropertiesUpdate('content', e.target.value)}

                className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-sm"                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"

                rows={3}

                placeholder="URL ou texte à encoder"                />          </div>  }  }

              />

              <div className="text-xs text-gray-500 mt-1">              </div>

                Utilisez {`{{attendeeId}}`} pour l'ID unique du participant

              </div>            </div>          <div>

            </div>

          </div>          </div>

        )}

        </div>            <label className="text-xs text-gray-500">Y</label>

        {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle') && (

          <div className="space-y-4">

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">        <hr className="border-gray-200" />            <input

                Couleur de fond

              </label>

              <div className="flex gap-2">

                <input        {/* Propriétés spécifiques selon le type */}              type="number"  const handleUpdateProperty = (property: string, value: any) => {  const handleUpdateProperty = (property: string, value: any) => {

                  type="color"

                  value={selectedElement.properties?.backgroundColor || '#ffffff'}        {selectedElement.type === 'text' && (

                  onChange={(e) => handlePropertiesUpdate('backgroundColor', e.target.value)}

                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"          <div className="space-y-4">              value={selectedElement.y}

                />

                <input            <div>

                  type="text"

                  value={selectedElement.properties?.backgroundColor || '#ffffff'}              <label className="block text-sm font-medium text-gray-700 mb-2">              onChange={(e) => handleUpdateProperty('y', parseInt(e.target.value))}    onUpdateElement(selectedElement.id, { [property]: value });    onUpdateElement(selectedElement.id, { [property]: value });

                  onChange={(e) => handlePropertiesUpdate('backgroundColor', e.target.value)}

                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"                Contenu

                />

              </div>              </label>              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"

            </div>

              <textarea

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">                value={selectedElement.properties?.content || ''}            />  };  };

                Couleur de bordure

              </label>                onChange={(e) => handlePropertiesUpdate('content', e.target.value)}

              <div className="flex gap-2">

                <input                className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-sm"          </div>

                  type="color"

                  value={selectedElement.properties?.borderColor || '#000000'}                rows={3}

                  onChange={(e) => handlePropertiesUpdate('borderColor', e.target.value)}

                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"                placeholder="Tapez votre texte"        </div>

                />

                <input              />

                  type="text"

                  value={selectedElement.properties?.borderColor || '#000000'}            </div>      </div>

                  onChange={(e) => handlePropertiesUpdate('borderColor', e.target.value)}

                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"

                />

              </div>            <div>  const handlePropertiesUpdate = (property: string, value: any) => {  const handlePropertiesUpdate = (property: string, value: any) => {

            </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">                Taille de police      <div>

                Épaisseur de bordure

              </label>              </label>

              <input

                type="number"              <input        <label className="block text-sm font-medium text-gray-700 mb-2">    onUpdateElement(selectedElement.id, {    onUpdateElement(selectedElement.id, {

                value={selectedElement.properties?.borderWidth || 1}

                onChange={(e) => handlePropertiesUpdate('borderWidth', parseInt(e.target.value))}                type="number"

                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"

                min="0"                value={selectedElement.properties?.fontSize || 16}          Dimensions

                max="10"

              />                onChange={(e) => handlePropertiesUpdate('fontSize', parseInt(e.target.value))}

            </div>

          </div>                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"        </label>      properties: { ...selectedElement.properties, [property]: value }      properties: { ...selectedElement.properties, [property]: value }

        )}

      </div>                min="8"

    </div>

  );                max="72"        <div className="grid grid-cols-2 gap-2">

};
              />

            </div>          <div>    });    });



            <div>            <label className="text-xs text-gray-500">Largeur</label>

              <label className="block text-sm font-medium text-gray-700 mb-2">

                Couleur            <input  };  };

              </label>

              <div className="flex gap-2">              type="number"

                <input

                  type="color"              value={selectedElement.width}

                  value={selectedElement.properties?.color || '#000000'}

                  onChange={(e) => handlePropertiesUpdate('color', e.target.value)}              onChange={(e) => handleUpdateProperty('width', parseInt(e.target.value))}

                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"

                />              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"  const renderCommonProperties = () => (  const renderCommonProperties = () => (

                <input

                  type="text"            />

                  value={selectedElement.properties?.color || '#000000'}

                  onChange={(e) => handlePropertiesUpdate('color', e.target.value)}          </div>    <div className="space-y-4">    <div className="space-y-4">

                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"

                />          <div>

              </div>

            </div>            <label className="text-xs text-gray-500">Hauteur</label>      <div>      <div>

          </div>

        )}            <input



        {selectedElement.type === 'image' && (              type="number"        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

          <div className="space-y-4">

            <div>              value={selectedElement.height}

              <label className="block text-sm font-medium text-gray-700 mb-2">

                URL de l'image              onChange={(e) => handleUpdateProperty('height', parseInt(e.target.value))}          Position          Position

              </label>

              <input              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"

                type="url"

                value={selectedElement.properties?.src || ''}            />        </label>        </label>

                onChange={(e) => handlePropertiesUpdate('src', e.target.value)}

                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"          </div>

                placeholder="https://exemple.com/image.jpg"

              />        </div>        <div className="grid grid-cols-2 gap-2">        <div className="grid grid-cols-2 gap-2">

            </div>

          </div>      </div>

        )}

          <div>          <div>

        {selectedElement.type === 'qr' && (

          <div className="space-y-4">      <div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">            <label className="text-xs text-gray-500">X</label>            <label className="text-xs text-gray-500">X</label>

                Contenu du QR Code

              </label>          Rotation

              <textarea

                value={selectedElement.properties?.content || ''}        </label>            <input            <input

                onChange={(e) => handlePropertiesUpdate('content', e.target.value)}

                className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-sm"        <input

                rows={3}

                placeholder="URL ou texte à encoder"          type="range"              type="number"              type="number"

              />

            </div>          min="0"

          </div>

        )}          max="360"              value={selectedElement.x}              value={selectedElement.x}



        {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle') && (          value={selectedElement.rotation || 0}

          <div className="space-y-4">

            <div>          onChange={(e) => handleUpdateProperty('rotation', parseInt(e.target.value))}              onChange={(e) => handleUpdateProperty('x', parseInt(e.target.value))}              onChange={(e) => handleUpdateProperty('x', parseInt(e.target.value))}

              <label className="block text-sm font-medium text-gray-700 mb-2">

                Couleur de fond          className="w-full"

              </label>

              <div className="flex gap-2">        />              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"

                <input

                  type="color"        <div className="text-center text-xs text-gray-500 mt-1">

                  value={selectedElement.properties?.backgroundColor || '#ffffff'}

                  onChange={(e) => handlePropertiesUpdate('backgroundColor', e.target.value)}          {selectedElement.rotation || 0}°            />            />

                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"

                />        </div>

                <input

                  type="text"      </div>          </div>          </div>

                  value={selectedElement.properties?.backgroundColor || '#ffffff'}

                  onChange={(e) => handlePropertiesUpdate('backgroundColor', e.target.value)}    </div>

                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"

                />  );          <div>          <div>

              </div>

            </div>



            <div>  const renderTextProperties = () => (            <label className="text-xs text-gray-500">Y</label>            <label className="text-xs text-gray-500">Y</label>

              <label className="block text-sm font-medium text-gray-700 mb-2">

                Couleur de bordure    <div className="space-y-4">

              </label>

              <div className="flex gap-2">      <div>            <input            <input

                <input

                  type="color"        <label className="block text-sm font-medium text-gray-700 mb-2">

                  value={selectedElement.properties?.borderColor || '#000000'}

                  onChange={(e) => handlePropertiesUpdate('borderColor', e.target.value)}          Contenu              type="number"              type="number"

                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"

                />        </label>

                <input

                  type="text"        <textarea              value={selectedElement.y}              value={selectedElement.y}

                  value={selectedElement.properties?.borderColor || '#000000'}

                  onChange={(e) => handlePropertiesUpdate('borderColor', e.target.value)}          value={selectedElement.properties?.content || ''}

                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"

                />          onChange={(e) => handlePropertiesUpdate('content', e.target.value)}              onChange={(e) => handleUpdateProperty('y', parseInt(e.target.value))}              onChange={(e) => handleUpdateProperty('y', parseInt(e.target.value))}

              </div>

            </div>          className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-sm"

          </div>

        )}          rows={3}              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"

      </div>

    </div>          placeholder="Tapez votre texte ou utilisez {{variable}}"

  );

};        />            />            />

        <div className="text-xs text-gray-500 mt-1">

          Utilisez {`{{firstName}}`}, {`{{lastName}}`}, {`{{company}}`} pour les données dynamiques          </div>          </div>

        </div>

      </div>        </div>        </div>



      <div>      </div>      </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">

          Police

        </label>

        <select      <div>      <div>

          value={selectedElement.properties?.fontFamily || 'Arial'}

          onChange={(e) => handlePropertiesUpdate('fontFamily', e.target.value)}        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"

        >          Dimensions          Dimensions

          <option value="Arial">Arial</option>

          <option value="Helvetica">Helvetica</option>        </label>        </label>

          <option value="Times New Roman">Times New Roman</option>

          <option value="Courier New">Courier New</option>        <div className="grid grid-cols-2 gap-2">        <div className="grid grid-cols-2 gap-2">

          <option value="Georgia">Georgia</option>

          <option value="Verdana">Verdana</option>          <div>          <div>

        </select>

      </div>            <label className="text-xs text-gray-500">Largeur</label>            <label className="text-xs text-gray-500">Largeur</label>



      <div>            <input            <input

        <label className="block text-sm font-medium text-gray-700 mb-2">

          Taille de police              type="number"              type="number"

        </label>

        <input              value={selectedElement.width}              value={selectedElement.width}

          type="number"

          value={selectedElement.properties?.fontSize || 16}              onChange={(e) => handleUpdateProperty('width', parseInt(e.target.value))}              onChange={(e) => handleUpdateProperty('width', parseInt(e.target.value))}

          onChange={(e) => handlePropertiesUpdate('fontSize', parseInt(e.target.value))}

          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"

          min="8"

          max="72"            />            />

        />

      </div>          </div>          </div>



      <div>          <div>          <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">

          Style            <label className="text-xs text-gray-500">Hauteur</label>            <label className="text-xs text-gray-500">Hauteur</label>

        </label>

        <div className="flex gap-2">            <input            <input

          <button

            type="button"              type="number"              type="number"

            onClick={() => handlePropertiesUpdate('fontWeight', 

              selectedElement.properties?.fontWeight === 'bold' ? 'normal' : 'bold'              value={selectedElement.height}              value={selectedElement.height}

            )}

            className={`p-2 border rounded ${              onChange={(e) => handleUpdateProperty('height', parseInt(e.target.value))}              onChange={(e) => handleUpdateProperty('height', parseInt(e.target.value))}

              selectedElement.properties?.fontWeight === 'bold'

                ? 'bg-blue-500 text-white border-blue-500'              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"

                : 'bg-white text-gray-700 border-gray-300'

            }`}            />            />

          >

            <Bold size={16} />          </div>          </div>

          </button>

          <button        </div>        </div>

            type="button"

            onClick={() => handlePropertiesUpdate('fontStyle',      </div>      </div>

              selectedElement.properties?.fontStyle === 'italic' ? 'normal' : 'italic'

            )}

            className={`p-2 border rounded ${

              selectedElement.properties?.fontStyle === 'italic'      <div>      <div>

                ? 'bg-blue-500 text-white border-blue-500'

                : 'bg-white text-gray-700 border-gray-300'        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

            }`}

          >          Rotation          Rotation

            <Italic size={16} />

          </button>        </label>        </label>

        </div>

      </div>        <input        <input



      <div>          type="range"          type="range"

        <label className="block text-sm font-medium text-gray-700 mb-2">

          Alignement          min="0"          min="0"

        </label>

        <div className="flex gap-2">          max="360"          max="360"

          {[

            { value: 'left', icon: AlignLeft },          value={selectedElement.rotation || 0}          value={selectedElement.rotation || 0}

            { value: 'center', icon: AlignCenter },

            { value: 'right', icon: AlignRight },          onChange={(e) => handleUpdateProperty('rotation', parseInt(e.target.value))}          onChange={(e) => handleUpdateProperty('rotation', parseInt(e.target.value))}

          ].map(({ value, icon: Icon }) => (

            <button          className="w-full"          className="w-full"

              key={value}

              type="button"        />        />

              onClick={() => handlePropertiesUpdate('textAlign', value)}

              className={`p-2 border rounded ${        <div className="text-center text-xs text-gray-500 mt-1">        <div className="text-center text-xs text-gray-500 mt-1">

                selectedElement.properties?.textAlign === value

                  ? 'bg-blue-500 text-white border-blue-500'          {selectedElement.rotation || 0}°          {selectedElement.rotation || 0}°

                  : 'bg-white text-gray-700 border-gray-300'

              }`}        </div>        </div>

            >

              <Icon size={16} />      </div>      </div>

            </button>

          ))}    </div>    </div>

        </div>

      </div>  );  );



      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">

          Couleur du texte  const renderTextProperties = () => (  const renderTextProperties = () => (

        </label>

        <div className="flex gap-2">    <div className="space-y-4">    <div className="space-y-4">

          <input

            type="color"      <div>      <div>

            value={selectedElement.properties?.color || '#000000'}

            onChange={(e) => handlePropertiesUpdate('color', e.target.value)}        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"

          />          Contenu          Contenu

          <input

            type="text"        </label>        </label>

            value={selectedElement.properties?.color || '#000000'}

            onChange={(e) => handlePropertiesUpdate('color', e.target.value)}        <textarea        <textarea

            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"

            placeholder="#000000"          value={selectedElement.properties?.content || ''}          value={selectedElement.content || ''}

          />

        </div>          onChange={(e) => handlePropertiesUpdate('content', e.target.value)}          onChange={(e) => handleUpdateProperty('content', e.target.value)}

      </div>

    </div>          className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-sm"          className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-sm"

  );

          rows={3}          rows={3}

  const renderImageProperties = () => (

    <div className="space-y-4">          placeholder="Tapez votre texte ou utilisez {{variable}}"          placeholder="Tapez votre texte ou utilisez {{variable}}"

      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">        />        />

          URL de l'image

        </label>        <div className="text-xs text-gray-500 mt-1">        <div className="text-xs text-gray-500 mt-1">

        <input

          type="url"          Utilisez {`{{firstName}}`}, {`{{lastName}}`}, {`{{company}}`} pour les données dynamiques          Utilisez {`{{firstName}}`}, {`{{lastName}}`}, {`{{company}}`} pour les données dynamiques

          value={selectedElement.properties?.src || ''}

          onChange={(e) => handlePropertiesUpdate('src', e.target.value)}        </div>        </div>

          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"

          placeholder="https://exemple.com/image.jpg"      </div>      </div>

        />

      </div>



      <div>      <div>      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">

          Texte alternatif        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

        </label>

        <input          Police          Police

          type="text"

          value={selectedElement.properties?.alt || ''}        </label>        </label>

          onChange={(e) => handlePropertiesUpdate('alt', e.target.value)}

          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"        <select        <select

          placeholder="Description de l'image"

        />          value={selectedElement.properties?.fontFamily || 'Arial'}          value={selectedElement.style?.fontFamily || 'Arial'}

      </div>

          onChange={(e) => handlePropertiesUpdate('fontFamily', e.target.value)}          onChange={(e) => handleStyleUpdate('fontFamily', e.target.value)}

      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"

          Mode d'ajustement

        </label>        >        >

        <select

          value={selectedElement.properties?.objectFit || 'cover'}          <option value="Arial">Arial</option>          <option value="Arial">Arial</option>

          onChange={(e) => handlePropertiesUpdate('objectFit', e.target.value)}

          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"          <option value="Helvetica">Helvetica</option>          <option value="Helvetica">Helvetica</option>

        >

          <option value="cover">Couvrir</option>          <option value="Times New Roman">Times New Roman</option>          <option value="Times New Roman">Times New Roman</option>

          <option value="contain">Contenir</option>

          <option value="fill">Remplir</option>          <option value="Courier New">Courier New</option>          <option value="Courier New">Courier New</option>

          <option value="scale-down">Réduire</option>

        </select>          <option value="Georgia">Georgia</option>          <option value="Georgia">Georgia</option>

      </div>

    </div>          <option value="Verdana">Verdana</option>          <option value="Verdana">Verdana</option>

  );

        </select>        </select>

  const renderQRProperties = () => (

    <div className="space-y-4">      </div>      </div>

      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">

          Contenu du QR Code

        </label>      <div>      <div>

        <textarea

          value={selectedElement.properties?.content || ''}        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

          onChange={(e) => handlePropertiesUpdate('content', e.target.value)}

          className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-sm"          Taille de police          Taille de police

          rows={3}

          placeholder="URL ou texte à encoder"        </label>        </label>

        />

        <div className="text-xs text-gray-500 mt-1">        <input        <input

          Utilisez {`{{attendeeId}}`} pour l'ID unique du participant

        </div>          type="number"          type="number"

      </div>

          value={selectedElement.properties?.fontSize || 16}          value={parseInt(selectedElement.style?.fontSize?.replace('px', '') || '16')}

      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">          onChange={(e) => handlePropertiesUpdate('fontSize', parseInt(e.target.value))}          onChange={(e) => handleStyleUpdate('fontSize', `${e.target.value}px`)}

          Niveau de correction d'erreur

        </label>          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"

        <select

          value={selectedElement.properties?.errorCorrectionLevel || 'M'}          min="8"          min="8"

          onChange={(e) => handlePropertiesUpdate('errorCorrectionLevel', e.target.value)}

          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"          max="72"          max="72"

        >

          <option value="L">Faible (7%)</option>        />        />

          <option value="M">Moyen (15%)</option>

          <option value="Q">Élevé (25%)</option>      </div>      </div>

          <option value="H">Très élevé (30%)</option>

        </select>

      </div>

    </div>      <div>      <div>

  );

        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

  const renderShapeProperties = () => (

    <div className="space-y-4">          Style          Style

      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">        </label>        </label>

          Couleur de fond

        </label>        <div className="flex gap-2">        <div className="flex gap-2">

        <div className="flex gap-2">

          <input          <button          <button

            type="color"

            value={selectedElement.properties?.backgroundColor || '#ffffff'}            type="button"            type="button"

            onChange={(e) => handlePropertiesUpdate('backgroundColor', e.target.value)}

            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"            onClick={() => handlePropertiesUpdate('fontWeight',             onClick={() => handleStyleUpdate('fontWeight', 

          />

          <input              selectedElement.properties?.fontWeight === 'bold' ? 'normal' : 'bold'              selectedElement.style?.fontWeight === 'bold' ? 'normal' : 'bold'

            type="text"

            value={selectedElement.properties?.backgroundColor || '#ffffff'}            )}            )}

            onChange={(e) => handlePropertiesUpdate('backgroundColor', e.target.value)}

            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"            className={`p-2 border rounded ${            className={`p-2 border rounded ${

            placeholder="#ffffff"

          />              selectedElement.properties?.fontWeight === 'bold'              selectedElement.style?.fontWeight === 'bold'

        </div>

      </div>                ? 'bg-blue-500 text-white border-blue-500'                ? 'bg-blue-500 text-white border-blue-500'



      <div>                : 'bg-white text-gray-700 border-gray-300'                : 'bg-white text-gray-700 border-gray-300'

        <label className="block text-sm font-medium text-gray-700 mb-2">

          Bordure            }`}            }`}

        </label>

        <div className="space-y-2">          >          >

          <div className="flex gap-2">

            <input            <Bold size={16} />            <Bold size={16} />

              type="color"

              value={selectedElement.properties?.borderColor || '#000000'}          </button>          </button>

              onChange={(e) => handlePropertiesUpdate('borderColor', e.target.value)}

              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"          <button          <button

            />

            <input            type="button"            type="button"

              type="text"

              value={selectedElement.properties?.borderColor || '#000000'}            onClick={() => handlePropertiesUpdate('fontStyle',            onClick={() => handleStyleUpdate('fontStyle',

              onChange={(e) => handlePropertiesUpdate('borderColor', e.target.value)}

              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"              selectedElement.properties?.fontStyle === 'italic' ? 'normal' : 'italic'              selectedElement.style?.fontStyle === 'italic' ? 'normal' : 'italic'

              placeholder="#000000"

            />            )}            )}

          </div>

          <div>            className={`p-2 border rounded ${            className={`p-2 border rounded ${

            <label className="text-xs text-gray-500">Épaisseur (px)</label>

            <input              selectedElement.properties?.fontStyle === 'italic'              selectedElement.style?.fontStyle === 'italic'

              type="number"

              value={selectedElement.properties?.borderWidth || 1}                ? 'bg-blue-500 text-white border-blue-500'                ? 'bg-blue-500 text-white border-blue-500'

              onChange={(e) => handlePropertiesUpdate('borderWidth', parseInt(e.target.value))}

              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"                : 'bg-white text-gray-700 border-gray-300'                : 'bg-white text-gray-700 border-gray-300'

              min="0"

              max="10"            }`}            }`}

            />

          </div>          >          >

        </div>

      </div>            <Italic size={16} />            <Italic size={16} />



      {selectedElement.type === 'rectangle' && (          </button>          </button>

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">        </div>        </div>

            Coins arrondis (px)

          </label>      </div>      </div>

          <input

            type="number"

            value={selectedElement.properties?.borderRadius || 0}

            onChange={(e) => handlePropertiesUpdate('borderRadius', parseInt(e.target.value))}      <div>      <div>

            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"

            min="0"        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

            max="50"

          />          Alignement          Alignement

        </div>

      )}        </label>        </label>

    </div>

  );        <div className="flex gap-2">        <div className="flex gap-2">



  const renderTypeSpecificProperties = () => {          {[          {[

    switch (selectedElement.type) {

      case 'text':            { value: 'left', icon: AlignLeft },            { value: 'left', icon: AlignLeft },

        return renderTextProperties();

      case 'image':            { value: 'center', icon: AlignCenter },            { value: 'center', icon: AlignCenter },

        return renderImageProperties();

      case 'qr':            { value: 'right', icon: AlignRight },            { value: 'right', icon: AlignRight },

        return renderQRProperties();

      case 'rectangle':          ].map(({ value, icon: Icon }) => (          ].map(({ value, icon: Icon }) => (

      case 'circle':

        return renderShapeProperties();            <button            <button

      default:

        return null;              key={value}              key={value}

    }

  };              type="button"              type="button"



  return (              onClick={() => handlePropertiesUpdate('textAlign', value)}              onClick={() => handleStyleUpdate('textAlign', value)}

    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">

      <div className="p-4 border-b border-gray-200">              className={`p-2 border rounded ${              className={`p-2 border rounded ${

        <div className="flex items-center justify-between mb-2">

          <h3 className="text-lg font-semibold text-gray-800">Propriétés</h3>                selectedElement.properties?.textAlign === value                selectedElement.style?.textAlign === value

          <Button

            variant="outline"                  ? 'bg-blue-500 text-white border-blue-500'                  ? 'bg-blue-500 text-white border-blue-500'

            size="sm"

            onClick={() => onDeleteElement(selectedElement.id)}                  : 'bg-white text-gray-700 border-gray-300'                  : 'bg-white text-gray-700 border-gray-300'

            className="text-red-600 hover:text-red-700 hover:bg-red-50"

          >              }`}              }`}

            <Trash2 size={16} />

          </Button>            >            >

        </div>

        <div className="text-sm text-gray-500 capitalize">              <Icon size={16} />              <Icon size={16} />

          {selectedElement.type === 'qr' ? 'QR Code' : selectedElement.type}

        </div>            </button>            </button>

      </div>

          ))}          ))}

      <div className="p-4 space-y-6">

        {renderCommonProperties()}        </div>        </div>

        <hr className="border-gray-200" />

        {renderTypeSpecificProperties()}      </div>      </div>

      </div>

    </div>

  );

};      <div>      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

          Couleur du texte          Couleur du texte

        </label>        </label>

        <div className="flex gap-2">        <div className="flex gap-2">

          <input          <input

            type="color"            type="color"

            value={selectedElement.properties?.color || '#000000'}            value={selectedElement.style?.color || '#000000'}

            onChange={(e) => handlePropertiesUpdate('color', e.target.value)}            onChange={(e) => handleStyleUpdate('color', e.target.value)}

            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"

          />          />

          <input          <input

            type="text"            type="text"

            value={selectedElement.properties?.color || '#000000'}            value={selectedElement.style?.color || '#000000'}

            onChange={(e) => handlePropertiesUpdate('color', e.target.value)}            onChange={(e) => handleStyleUpdate('color', e.target.value)}

            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"

            placeholder="#000000"            placeholder="#000000"

          />          />

        </div>        </div>

      </div>      </div>

    </div>    </div>

  );  );



  const renderImageProperties = () => (  const renderImageProperties = () => (

    <div className="space-y-4">    <div className="space-y-4">

      <div>      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

          URL de l'image          URL de l'image

        </label>        </label>

        <input        <input

          type="url"          type="url"

          value={selectedElement.properties?.src || ''}          value={selectedElement.src || ''}

          onChange={(e) => handlePropertiesUpdate('src', e.target.value)}          onChange={(e) => handleUpdateProperty('src', e.target.value)}

          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"

          placeholder="https://exemple.com/image.jpg"          placeholder="https://exemple.com/image.jpg"

        />        />

      </div>      </div>



      <div>      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

          Texte alternatif          Texte alternatif

        </label>        </label>

        <input        <input

          type="text"          type="text"

          value={selectedElement.properties?.alt || ''}          value={selectedElement.alt || ''}

          onChange={(e) => handlePropertiesUpdate('alt', e.target.value)}          onChange={(e) => handleUpdateProperty('alt', e.target.value)}

          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"

          placeholder="Description de l'image"          placeholder="Description de l'image"

        />        />

      </div>      </div>



      <div>      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

          Mode d'ajustement          Mode d'ajustement

        </label>        </label>

        <select        <select

          value={selectedElement.properties?.objectFit || 'cover'}          value={selectedElement.style?.objectFit || 'cover'}

          onChange={(e) => handlePropertiesUpdate('objectFit', e.target.value)}          onChange={(e) => handleStyleUpdate('objectFit', e.target.value)}

          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"

        >        >

          <option value="cover">Couvrir</option>          <option value="cover">Couvrir</option>

          <option value="contain">Contenir</option>          <option value="contain">Contenir</option>

          <option value="fill">Remplir</option>          <option value="fill">Remplir</option>

          <option value="scale-down">Réduire</option>          <option value="scale-down">Réduire</option>

        </select>        </select>

      </div>      </div>

    </div>

      <div>  );

        <label className="block text-sm font-medium text-gray-700 mb-2">

          Bordure  const renderQRProperties = () => (

        </label>    <div className="space-y-4">

        <div className="space-y-2">      <div>

          <div className="flex gap-2">        <label className="block text-sm font-medium text-gray-700 mb-2">

            <input          Contenu du QR Code

              type="color"        </label>

              value={selectedElement.properties?.borderColor || '#000000'}        <textarea

              onChange={(e) => handlePropertiesUpdate('borderColor', e.target.value)}          value={selectedElement.content || ''}

              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"          onChange={(e) => handleUpdateProperty('content', e.target.value)}

            />          className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-sm"

            <input          rows={3}

              type="text"          placeholder="URL ou texte à encoder"

              value={selectedElement.properties?.borderColor || '#000000'}        />

              onChange={(e) => handlePropertiesUpdate('borderColor', e.target.value)}        <div className="text-xs text-gray-500 mt-1">

              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"          Utilisez {`{{attendeeId}}`} pour l'ID unique du participant

              placeholder="#000000"        </div>

            />      </div>

          </div>

          <div>      <div>

            <label className="text-xs text-gray-500">Épaisseur (px)</label>        <label className="block text-sm font-medium text-gray-700 mb-2">

            <input          Niveau de correction d'erreur

              type="number"        </label>

              value={selectedElement.properties?.borderWidth || 0}        <select

              onChange={(e) => handlePropertiesUpdate('borderWidth', parseInt(e.target.value))}          value={selectedElement.errorCorrectionLevel || 'M'}

              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"          onChange={(e) => handleUpdateProperty('errorCorrectionLevel', e.target.value)}

              min="0"          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"

              max="10"        >

            />          <option value="L">Faible (7%)</option>

          </div>          <option value="M">Moyen (15%)</option>

        </div>          <option value="Q">Élevé (25%)</option>

      </div>          <option value="H">Très élevé (30%)</option>

    </div>        </select>

  );      </div>

    </div>

  const renderQRProperties = () => (  );

    <div className="space-y-4">

      <div>  const renderShapeProperties = () => (

        <label className="block text-sm font-medium text-gray-700 mb-2">    <div className="space-y-4">

          Contenu du QR Code      <div>

        </label>        <label className="block text-sm font-medium text-gray-700 mb-2">

        <textarea          Couleur de fond

          value={selectedElement.properties?.content || ''}        </label>

          onChange={(e) => handlePropertiesUpdate('content', e.target.value)}        <div className="flex gap-2">

          className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-sm"          <input

          rows={3}            type="color"

          placeholder="URL ou texte à encoder"            value={selectedElement.style?.backgroundColor || '#ffffff'}

        />            onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}

        <div className="text-xs text-gray-500 mt-1">            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"

          Utilisez {`{{attendeeId}}`} pour l'ID unique du participant          />

        </div>          <input

      </div>            type="text"

            value={selectedElement.style?.backgroundColor || '#ffffff'}

      <div>            onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}

        <label className="block text-sm font-medium text-gray-700 mb-2">            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"

          Niveau de correction d'erreur            placeholder="#ffffff"

        </label>          />

        <select        </div>

          value={selectedElement.properties?.errorCorrectionLevel || 'M'}      </div>

          onChange={(e) => handlePropertiesUpdate('errorCorrectionLevel', e.target.value)}

          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"      <div>

        >        <label className="block text-sm font-medium text-gray-700 mb-2">

          <option value="L">Faible (7%)</option>          Bordure

          <option value="M">Moyen (15%)</option>        </label>

          <option value="Q">Élevé (25%)</option>        <div className="space-y-2">

          <option value="H">Très élevé (30%)</option>          <div className="flex gap-2">

        </select>            <input

      </div>              type="color"

    </div>              value={selectedElement.style?.borderColor || '#000000'}

  );              onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}

              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"

  const renderShapeProperties = () => (            />

    <div className="space-y-4">            <input

      <div>              type="text"

        <label className="block text-sm font-medium text-gray-700 mb-2">              value={selectedElement.style?.borderColor || '#000000'}

          Couleur de fond              onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}

        </label>              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"

        <div className="flex gap-2">              placeholder="#000000"

          <input            />

            type="color"          </div>

            value={selectedElement.properties?.backgroundColor || '#ffffff'}          <div>

            onChange={(e) => handlePropertiesUpdate('backgroundColor', e.target.value)}            <label className="text-xs text-gray-500">Épaisseur</label>

            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"            <input

          />              type="number"

          <input              value={parseInt(selectedElement.style?.borderWidth?.replace('px', '') || '1')}

            type="text"              onChange={(e) => handleStyleUpdate('borderWidth', `${e.target.value}px`)}

            value={selectedElement.properties?.backgroundColor || '#ffffff'}              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"

            onChange={(e) => handlePropertiesUpdate('backgroundColor', e.target.value)}              min="0"

            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"              max="10"

            placeholder="#ffffff"            />

          />          </div>

        </div>        </div>

      </div>      </div>



      <div>      {selectedElement.type === 'rectangle' && (

        <label className="block text-sm font-medium text-gray-700 mb-2">        <div>

          Bordure          <label className="block text-sm font-medium text-gray-700 mb-2">

        </label>            Coins arrondis

        <div className="space-y-2">          </label>

          <div className="flex gap-2">          <input

            <input            type="number"

              type="color"            value={parseInt(selectedElement.style?.borderRadius?.replace('px', '') || '0')}

              value={selectedElement.properties?.borderColor || '#000000'}            onChange={(e) => handleStyleUpdate('borderRadius', `${e.target.value}px`)}

              onChange={(e) => handlePropertiesUpdate('borderColor', e.target.value)}            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"

              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"            min="0"

            />            max="50"

            <input          />

              type="text"        </div>

              value={selectedElement.properties?.borderColor || '#000000'}      )}

              onChange={(e) => handlePropertiesUpdate('borderColor', e.target.value)}    </div>

              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"  );

              placeholder="#000000"

            />  const renderTypeSpecificProperties = () => {

          </div>    switch (selectedElement.type) {

          <div>      case 'text':

            <label className="text-xs text-gray-500">Épaisseur (px)</label>        return renderTextProperties();

            <input      case 'image':

              type="number"        return renderImageProperties();

              value={selectedElement.properties?.borderWidth || 1}      case 'qr':

              onChange={(e) => handlePropertiesUpdate('borderWidth', parseInt(e.target.value))}        return renderQRProperties();

              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"      case 'rectangle':

              min="0"      case 'circle':

              max="10"        return renderShapeProperties();

            />      default:

          </div>        return null;

        </div>    }

      </div>  };



      {selectedElement.type === 'rectangle' && (  return (

        <div>    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">

          <label className="block text-sm font-medium text-gray-700 mb-2">      <div className="p-4 border-b border-gray-200">

            Coins arrondis (px)        <div className="flex items-center justify-between mb-2">

          </label>          <h3 className="text-lg font-semibold text-gray-800">Propriétés</h3>

          <input          <Button

            type="number"            variant="outline"

            value={selectedElement.properties?.borderRadius || 0}            size="sm"

            onChange={(e) => handlePropertiesUpdate('borderRadius', parseInt(e.target.value))}            onClick={() => onDeleteElement(selectedElement.id)}

            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"            className="text-red-600 hover:text-red-700 hover:bg-red-50"

            min="0"          >

            max="50"            <Trash2 size={16} />

          />          </Button>

        </div>        </div>

      )}        <div className="text-sm text-gray-500 capitalize">

    </div>          {selectedElement.type === 'qr' ? 'QR Code' : selectedElement.type}

  );        </div>

      </div>

  const renderTypeSpecificProperties = () => {

    switch (selectedElement.type) {      <div className="p-4 space-y-6">

      case 'text':        {renderCommonProperties()}

        return renderTextProperties();        <hr className="border-gray-200" />

      case 'image':        {renderTypeSpecificProperties()}

        return renderImageProperties();      </div>

      case 'qr':    </div>

        return renderQRProperties();  );

      case 'rectangle':};
      case 'circle':
        return renderShapeProperties();
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Propriétés</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteElement(selectedElement.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
        <div className="text-sm text-gray-500 capitalize">
          {selectedElement.type === 'qr' ? 'QR Code' : selectedElement.type}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {renderCommonProperties()}
        <hr className="border-gray-200" />
        {renderTypeSpecificProperties()}
      </div>
    </div>
  );
};