import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@/shared/hooks/useToast'
import {
  useGetBadgeTemplateByIdQuery,
  useCreateBadgeTemplateMutation,
  useUpdateBadgeTemplateMutation,
  CreateBadgeTemplateDto,
} from '@/features/badge-templates/api/badgeTemplatesApi'
import { BadgeTemplateEditor } from '@/components/BadgeTemplates/BadgeTemplateEditor'
import { useTemplateNameValidation } from '@/features/badge-templates/hooks/useTemplateNameValidation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export const BadgeTemplateFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const toast = useToast();

  // RTK Query hooks
  const { data: template, isLoading: loadingTemplate, error: templateError } = useGetBadgeTemplateByIdQuery(id!, {
    skip: !isEditMode || !id,
  });

  // Debug logs
  useEffect(() => {
    if (isEditMode && id) {
      console.log('🔍 Edit mode - Template ID:', id);
      console.log('🔍 Template loading:', loadingTemplate);
      console.log('🔍 Template data:', template);
      console.log('🔍 Template error:', templateError);
    }
  }, [isEditMode, id, loadingTemplate, template, templateError]);

  // Log détaillé de l'erreur
  useEffect(() => {
    if (templateError) {
      console.error('🚨 Template loading error:', templateError);
      if ('status' in templateError) {
        console.error('🚨 Error status:', templateError.status);
        console.error('🚨 Error data:', templateError.data);
      }
    }
  }, [templateError]);
  const [createTemplate, { isLoading: creating }] = useCreateBadgeTemplateMutation();
  const [updateTemplate, { isLoading: updating }] = useUpdateBadgeTemplateMutation();

  const saving = creating || updating;
  const loading = loadingTemplate;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    width: 96,
    height: 268,
    unit: 'mm' as 'px' | 'mm' | 'cm' | 'in',
    event_id: '',
    is_default: false,
  });
  const [editorData, setEditorData] = useState({
    html: '',
    css: '',
    components: null as any,
  });

  // Validation du nom en temps réel
  const nameValidation = useTemplateNameValidation({
    name: formData.name,
    currentTemplateId: isEditMode && id ? id : undefined,
  });

  // Conversion des unités vers pixels (pour l'éditeur)
  // DPI standard pour impression: 300 DPI
  const convertToPixels = (value: number, unit: string): number => {
    const DPI = 300;
    switch (unit) {
      case 'mm':
        return Math.round((value / 25.4) * DPI);
      case 'cm':
        return Math.round((value / 2.54) * DPI);
      case 'in':
        return Math.round(value * DPI);
      case 'px':
      default:
        return value;
    }
  };

  const widthInPixels = convertToPixels(formData.width, formData.unit);
  const heightInPixels = convertToPixels(formData.height, formData.unit);

  // Presets de dimensions pour badges
  const dimensionPresets = [
    { name: 'Badge personnalisé (96x268mm)', width: 96, height: 268, unit: 'mm' as const },
    { name: 'Badge standard (85x54mm)', width: 85, height: 54, unit: 'mm' as const },
    { name: 'Badge vertical (54x85mm)', width: 54, height: 85, unit: 'mm' as const },
    { name: 'Badge carré (70x70mm)', width: 70, height: 70, unit: 'mm' as const },
    { name: 'Badge large (100x70mm)', width: 100, height: 70, unit: 'mm' as const },
  ];

  const applyPreset = (preset: typeof dimensionPresets[0]) => {
    setFormData(prev => ({
      ...prev,
      width: preset.width,
      height: preset.height,
      unit: preset.unit,
    }));
  };

  // Charger le template si mode édition
  useEffect(() => {
    if (template && isEditMode) {
      console.log('🔍 Loading template data:', template);
      setFormData({
        name: template.name || '',
        description: template.description || '',
        width: template.width || 400,
        height: template.height || 600,
        unit: 'px',
        event_id: template.event_id || '',
        is_default: template.is_default || false,
      });

      setEditorData({
        html: template.html || '',
        css: template.css || '',
        components: template.template_data || null,
      });
    }
  }, [template, isEditMode]);

  const handleEditorChange = (data: { html: string; css: string; components: any }) => {
    setEditorData(data);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Champ requis', 'Le nom du template est requis');
      return;
    }

    // Vérifier la disponibilité du nom
    if (nameValidation.isAvailable === false) {
      toast.error('Nom indisponible', 'Ce nom de template est déjà utilisé');
      return;
    }

    // Vérifier les limites de dimensions
    if (widthInPixels > 5000) {
      toast.error('Dimension invalide', 'La largeur ne peut pas dépasser 5000 pixels');
      return;
    }
    
    if (heightInPixels > 5000) {
      toast.error('Dimension invalide', 'La hauteur ne peut pas dépasser 5000 pixels');
      return;
    }

    const templateData: any = {
      name: formData.name,
      ...(formData.description && { description: formData.description }),
      html: editorData.html,
      css: editorData.css,
      width: widthInPixels,
      height: heightInPixels,
      template_data: editorData.components || {},
      ...(formData.event_id && { event_id: formData.event_id }),
      is_default: formData.is_default,
    };

    try {
      if (isEditMode && id) {
        await updateTemplate({ id, data: templateData }).unwrap();
        toast.success('Template mis à jour avec succès');
      } else {
        await createTemplate(templateData as CreateBadgeTemplateDto).unwrap();
        toast.success('Template créé avec succès');
      }
      navigate('/admin/badge-templates');
    } catch (error: any) {
      toast.error('Erreur de sauvegarde', error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleCancel = () => {
    navigate('/admin/badge-templates');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Modifier le template' : 'Créer un template de badge'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Utilisez l'éditeur visuel pour créer votre template de badge
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors duration-200"
            >
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Formulaire de configuration */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du template *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Badge Participant Standard"
                className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  nameValidation.shouldShowValidation
                    ? nameValidation.isAvailable === false
                      ? 'border-red-300 dark:border-red-600'
                      : nameValidation.isAvailable === true
                      ? 'border-green-300 dark:border-green-600'
                      : 'border-gray-300 dark:border-gray-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {nameValidation.shouldShowValidation && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {nameValidation.isChecking ? (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : nameValidation.isAvailable === true ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : nameValidation.isAvailable === false ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : null}
                </div>
              )}
            </div>
            {nameValidation.shouldShowValidation && nameValidation.isAvailable === false && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Ce nom de template est déjà utilisé
              </p>
            )}
            {nameValidation.shouldShowValidation && nameValidation.isAvailable === true && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                Ce nom est disponible
              </p>
            )}
            {nameValidation.error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {nameValidation.error}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description optionnelle"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>

          {/* Presets de dimensions courantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dimensions prédéfinies
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dimensionPresets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-2 text-xs border rounded-lg transition-colors ${
                    formData.width === preset.width && 
                    formData.height === preset.height && 
                    formData.unit === preset.unit
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {preset.name.split('(')[0]?.trim()}<br />
                  <span className="text-gray-500 dark:text-gray-400">
                    ({preset.width}×{preset.height}{preset.unit})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Largeur
              </label>
              <input
                type="number"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) || 400 })}
                step="0.1"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  widthInPixels > 5000 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {widthInPixels > 5000 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Max 5000px ({widthInPixels}px)
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hauteur
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 600 })}
                step="0.1"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  heightInPixels > 5000 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {heightInPixels > 5000 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Max 5000px ({heightInPixels}px)
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unité
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="px">px</option>
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Template par défaut
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Éditeur */}
      <div className="flex-1 overflow-hidden">
        <BadgeTemplateEditor
          initialHtml={editorData.html}
          initialCss={editorData.css}
          initialComponents={editorData.components}
          width={widthInPixels}
          height={heightInPixels}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
};
