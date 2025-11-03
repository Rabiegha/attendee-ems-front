import { useEffect, useRef, useState } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import presetWebpage from 'grapesjs-preset-webpage';

interface BadgeTemplateEditorProps {
  initialHtml?: string;
  initialCss?: string;
  initialComponents?: any;
  width?: number;
  height?: number;
  onChange?: (data: {
    html: string;
    css: string;
    components: any;
  }) => void;
}

export const BadgeTemplateEditor = ({
  initialHtml = '',
  initialCss = '',
  initialComponents,
  width = 400,
  height = 600,
  onChange,
}: BadgeTemplateEditorProps) => {
  const editorRef = useRef<Editor | null>(null);
  const [isRotated, setIsRotated] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    const newZoom = Math.min(200, zoom + 25);
    setZoom(newZoom);
    if (editorRef.current) {
      editorRef.current.Canvas.setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(25, zoom - 25);
    setZoom(newZoom);
    if (editorRef.current) {
      editorRef.current.Canvas.setZoom(newZoom);
    }
  };

  const handleRotate = () => {
    const newRotated = !isRotated;
    setIsRotated(newRotated);
    const canvas = editorRef.current?.Canvas.getFrameEl();
    if (canvas) {
      const wrapper = canvas.contentDocument?.body;
      if (wrapper) {
        const transforms = [];
        if (newRotated) transforms.push('rotate(180deg)');
        if (isMirrored) transforms.push('scaleX(-1)');
        wrapper.style.transform = transforms.join(' ');
      }
    }
  };

  const handleMirror = () => {
    const newMirrored = !isMirrored;
    setIsMirrored(newMirrored);
    const canvas = editorRef.current?.Canvas.getFrameEl();
    if (canvas) {
      const wrapper = canvas.contentDocument?.body;
      if (wrapper) {
        const transforms = [];
        if (isRotated) transforms.push('rotate(180deg)');
        if (newMirrored) transforms.push('scaleX(-1)');
        wrapper.style.transform = transforms.join(' ');
      }
    }
  };

  useEffect(() => {
    // Initialiser GrapesJS
    const editor = grapesjs.init({
      container: '#gjs-editor',
      height: '100%',
      width: 'auto',
      plugins: [presetWebpage],
      pluginsOpts: {
        [presetWebpage as any]: {
          blocksBasicOpts: {
            blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image'],
            flexGrid: true,
          },
          blocks: ['link-block', 'quote', 'text-basic'],
          modalImportTitle: 'Importer',
          modalImportLabel: '<div>Coller votre HTML/CSS ici</div>',
          modalImportContent: (editor: Editor) => editor.getHtml() + '<style>' + editor.getCss() + '</style>',
        },
      },
      storageManager: false,
      canvas: {
        styles: [],
        scripts: [],
      },
      deviceManager: {
        devices: [
          {
            id: 'badge',
            name: 'Badge',
            width: `${width}px`,
            height: `${height}px`,
          },
        ],
      },
      styleManager: {
        sectors: [
          {
            name: 'Position',
            open: true,
            properties: [
              {
                type: 'select',
                property: 'position',
                default: 'static',
                options: [
                  { id: 'static', value: 'static', name: 'Static' },
                  { id: 'relative', value: 'relative', name: 'Relative' },
                  { id: 'absolute', value: 'absolute', name: 'Absolute' },
                  { id: 'fixed', value: 'fixed', name: 'Fixed' },
                ],
              },
              {
                type: 'integer',
                property: 'top',
                units: ['px', '%', 'em', 'rem'],
                default: 'auto',
              },
              {
                type: 'integer',
                property: 'left',
                units: ['px', '%', 'em', 'rem'],
                default: 'auto',
              },
              {
                type: 'integer',
                property: 'bottom',
                units: ['px', '%', 'em', 'rem'],
                default: 'auto',
              },
              {
                type: 'integer',
                property: 'right',
                units: ['px', '%', 'em', 'rem'],
                default: 'auto',
              },
              {
                type: 'integer',
                property: 'z-index',
                default: 'auto',
              },
            ],
          },
          {
            name: 'Dimension',
            open: true,
            buildProps: ['width', 'height', 'min-height', 'max-width', 'max-height', 'padding', 'margin'],
          },
          {
            name: 'Typographie',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align'],
          },
          {
            name: 'Décorations',
            open: false,
            buildProps: ['background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'border-radius', 'border', 'box-shadow'],
          },
          {
            name: 'Extra',
            open: false,
            buildProps: ['opacity', 'overflow', 'cursor', 'pointer-events'],
          },
        ],
      },
    });

    // Ajouter des blocks personnalisés pour les variables
    editor.BlockManager.add('variable-name', {
      label: '{{Nom}}',
      category: 'Variables',
      content: '<div class="badge-variable" data-variable="full_name">{{full_name}}</div>',
      attributes: { class: 'gjs-block-variable' },
    });

    editor.BlockManager.add('variable-first-name', {
      label: '{{Prénom}}',
      category: 'Variables',
      content: '<div class="badge-variable" data-variable="first_name">{{first_name}}</div>',
      attributes: { class: 'gjs-block-variable' },
    });

    editor.BlockManager.add('variable-last-name', {
      label: '{{Nom de famille}}',
      category: 'Variables',
      content: '<div class="badge-variable" data-variable="last_name">{{last_name}}</div>',
      attributes: { class: 'gjs-block-variable' },
    });

    editor.BlockManager.add('variable-company', {
      label: '{{Entreprise}}',
      category: 'Variables',
      content: '<div class="badge-variable" data-variable="company">{{company}}</div>',
      attributes: { class: 'gjs-block-variable' },
    });

    editor.BlockManager.add('variable-job-title', {
      label: '{{Poste}}',
      category: 'Variables',
      content: '<div class="badge-variable" data-variable="job_title">{{job_title}}</div>',
      attributes: { class: 'gjs-block-variable' },
    });

    editor.BlockManager.add('variable-email', {
      label: '{{Email}}',
      category: 'Variables',
      content: '<div class="badge-variable" data-variable="email">{{email}}</div>',
      attributes: { class: 'gjs-block-variable' },
    });

    editor.BlockManager.add('variable-event-name', {
      label: '{{Événement}}',
      category: 'Variables',
      content: '<div class="badge-variable" data-variable="event_name">{{event_name}}</div>',
      attributes: { class: 'gjs-block-variable' },
    });

    editor.BlockManager.add('variable-attendee-type', {
      label: '{{Type participant}}',
      category: 'Variables',
      content: '<div class="badge-variable" data-variable="attendee_type">{{attendee_type}}</div>',
      attributes: { class: 'gjs-block-variable' },
    });

    // Ajouter un bloc pour les images
    editor.BlockManager.add('image', {
      label: 'Image',
      category: 'Médias',
      content: {
        type: 'image',
        style: {
          'max-width': '100%',
          height: 'auto',
        },
        attributes: {
          src: 'https://via.placeholder.com/200x150?text=Image',
          alt: 'Image',
        },
      },
      attributes: { class: 'fa fa-image' },
    });

    // Charger le contenu initial si fourni
    if (initialComponents) {
      editor.setComponents(initialComponents);
    } else if (initialHtml) {
      editor.setComponents(initialHtml);
    }

    if (initialCss) {
      editor.setStyle(initialCss);
    }

    // Définir les dimensions du canvas
    editor.setDevice('badge');

    // Ajouter des styles CSS de base pour le badge
    const canvasStyles = `
      * { box-sizing: border-box; }
      body { 
        margin: 0; 
        padding: 0; 
        width: ${width}px; 
        height: ${height}px;
        overflow: hidden;
      }
      .badge-variable {
        padding: 4px 8px;
        background: #f3f4f6;
        border: 1px dashed #d1d5db;
        border-radius: 4px;
        display: inline-block;
        font-family: monospace;
        color: #6b7280;
      }
    `;

    // Ajouter les styles au canvas une fois qu'il est prêt
    const canvasDoc = editor.Canvas.getDocument();
    if (canvasDoc && canvasDoc.head) {
      canvasDoc.head.insertAdjacentHTML(
        'beforeend',
        `<style>${canvasStyles}</style>`
      );
    }

    // Forcer l'affichage des spinners sur les inputs number
    // GrapesJS les cache par défaut, on doit override leur CSS
    setTimeout(() => {
      const style = document.createElement('style');
      style.id = 'force-number-spinners';
      style.textContent = `
        /* FORCE SPINNERS - APPROCHE RADICALE */
        * input[type="number"],
        body input[type="number"],
        html input[type="number"],
        #gjs-editor input[type="number"],
        .gjs-field[type="number"],
        .gjs-sm-property input[type="number"] {
          -webkit-appearance: auto !important;
          -moz-appearance: number-input !important;
        }
        
        * input[type="number"]::-webkit-inner-spin-button,
        * input[type="number"]::-webkit-outer-spin-button,
        body input[type="number"]::-webkit-inner-spin-button,
        body input[type="number"]::-webkit-outer-spin-button,
        html input[type="number"]::-webkit-inner-spin-button,
        html input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: auto !important;
          opacity: 1 !important;
          display: inline-block !important;
          position: relative !important;
          width: auto !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Annuler TOUS les styles GrapesJS */
        .gjs-field::-webkit-inner-spin-button,
        .gjs-field::-webkit-outer-spin-button {
          all: unset !important;
          -webkit-appearance: auto !important;
          opacity: 1 !important;
          display: inline-block !important;
        }
      `;
      
      // Supprimer l'ancien s'il existe
      const oldStyle = document.getElementById('force-number-spinners');
      if (oldStyle) oldStyle.remove();
      
      document.head.appendChild(style);
    }, 100);

    // Commandes personnalisées pour zoom et rotation - pas besoin, on utilise les boutons React

    // Écouter les changements
    editor.on('component:update', () => {
      if (onChange) {
        onChange({
          html: editor.getHtml(),
          css: editor.getCss() || '',
          components: editor.getComponents().toJSON(),
        });
      }
    });

    editor.on('style:update', () => {
      if (onChange) {
        onChange({
          html: editor.getHtml(),
          css: editor.getCss() || '',
          components: editor.getComponents().toJSON(),
        });
      }
    });

    editorRef.current = editor;

    // Cleanup
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]); // Recréer l'éditeur quand les dimensions changent

  return (
    <div className="badge-template-editor h-full flex flex-col">
      {/* Toolbar personnalisée */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleZoomOut}
          className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
          title="Zoom arrière (25%)"
        >
          🔍-
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[3.5rem] text-center">
          {zoom}%
        </span>
        <button
          onClick={handleZoomIn}
          className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
          title="Zoom avant (25%)"
        >
          🔍+
        </button>

        <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

        <button
          onClick={handleRotate}
          className={`px-3 py-1.5 text-sm rounded border transition-colors ${
            isRotated
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
          title="Rotation 180° (vue badge porté au cou)"
        >
          🔄 Rotation
        </button>

        <button
          onClick={handleMirror}
          className={`px-3 py-1.5 text-sm rounded border transition-colors ${
            isMirrored
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
          title="Effet miroir horizontal"
        >
          ⇄ Miroir
        </button>
      </div>

      {/* Indicateur d'état */}
      {(isRotated || isMirrored || zoom !== 100) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Vue: {zoom}% {isRotated && '• Rotation 180°'} {isMirrored && '• Miroir'}
          </span>
        </div>
      )}

      {/* Éditeur GrapesJS */}
      <div className="flex-1 overflow-auto">
        <div id="gjs-editor" className="h-full"></div>
      </div>
      
      <style>{`
        /* GrapesJS Editor */
        #gjs-editor {
          border-radius: 8px;
          overflow: hidden;
        }
        
        /* Élargir les panneaux latéraux - largeur optimale */
        .gjs-pn-views-container {
          width: 320px !important;
          min-width: 320px !important;
        }
        
        .gjs-pn-views {
          width: 320px !important;
          min-width: 320px !important;
        }
        
        /* Panel de gauche (blocs) */
        .gjs-blocks-cs {
          width: 260px !important;
          min-width: 260px !important;
        }
        
        /* BEAUCOUP plus d'espace pour les inputs */
        .gjs-sm-property .gjs-field,
        .gjs-sm-property .gjs-select {
          min-width: 150px !important;
          width: 100% !important;
        }
        
        /* Force les inputs à prendre toute la largeur disponible */
        .gjs-sm-property__field {
          flex: 1 !important;
          min-width: 150px !important;
        }
        
        /* Inputs number doivent ABSOLUMENT avoir des spinners */
        input[type="number"] {
          -webkit-appearance: auto !important;
          -moz-appearance: auto !important;
        }
        
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: auto !important;
          display: block !important;
          opacity: 1 !important;
          margin: 0 !important;
          height: 100% !important;
        }
        
        /* Force scroll on canvas */
        .gjs-cv-canvas {
          background-color: #f9fafb !important;
          overflow: auto !important;
        }
        
        .gjs-frame-wrapper {
          overflow: auto !important;
        }
        
        .gjs-block {
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px;
          margin: 8px 4px;
        }
        
        .gjs-block:hover {
          border-color: #3b82f6;
          box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
        }
        
        .gjs-block__media {
          color: #6b7280;
        }
        
        .gjs-pn-panel {
          background-color: #ffffff;
        }
        
        .gjs-pn-btn {
          color: #6b7280;
        }
        
        .gjs-pn-btn:hover {
          color: #3b82f6;
        }
        
        .gjs-pn-btn.gjs-pn-active {
          color: #3b82f6;
          box-shadow: inset 0 0 0 2px #3b82f6;
        }
        
        .gjs-sm-sector-title {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          color: #111827;
          font-weight: 600;
        }
        
        .gjs-sm-property {
          border-bottom: 1px solid #f3f4f6;
        }
        
        .gjs-field,
        .gjs-select {
          background-color: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          color: #111827;
        }
        
        .gjs-field:focus,
        .gjs-select:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        /* Fix input number arrows - ULTRA FORCE */
        #gjs-editor input[type="number"],
        #gjs-editor .gjs-field[type="number"],
        #gjs-editor .gjs-field-integer,
        #gjs-editor .gjs-field-number {
          /* NE PAS mettre -moz-appearance: textfield car ça cache les spinners! */
        }
        
        #gjs-editor input[type="number"]::-webkit-inner-spin-button,
        #gjs-editor input[type="number"]::-webkit-outer-spin-button,
        #gjs-editor .gjs-field[type="number"]::-webkit-inner-spin-button,
        #gjs-editor .gjs-field[type="number"]::-webkit-outer-spin-button,
        #gjs-editor .gjs-field-integer::-webkit-inner-spin-button,
        #gjs-editor .gjs-field-integer::-webkit-outer-spin-button,
        #gjs-editor .gjs-field-number::-webkit-inner-spin-button,
        #gjs-editor .gjs-field-number::-webkit-outer-spin-button {
          -webkit-appearance: auto !important;
          opacity: 1 !important;
          width: auto !important;
          height: auto !important;
          margin: 0 !important;
        }
        
        /* Fix text color visibility */
        .gjs-sm-property .gjs-field,
        .gjs-sm-property .gjs-select,
        .gjs-sm-property input,
        .gjs-sm-property select {
          color: #1f2937 !important;
          background-color: #ffffff !important;
        }
        
        .gjs-sm-property input::placeholder {
          color: #9ca3af !important;
        }
      `}</style>
    </div>
  );
};
