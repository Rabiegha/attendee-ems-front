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

export const BadgeTemplateFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const toast = useToast();

  // RTK Query hooks
  const { data: template, isLoading: loadingTemplate } = useGetBadgeTemplateByIdQuery(id!, {
    skip: !isEditMode || !id,
  });
  const [createTemplate, { isLoading: creating }] = useCreateBadgeTemplateMutation();
  const [updateTemplate, { isLoading: updating }] = useUpdateBadgeTemplateMutation();

  const saving = creating || updating;
  const loading = loadingTemplate;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    width: 400,
    height: 600,
    event_id: '',
    is_default: false,
  });
  const [editorData, setEditorData] = useState({
    html: '',
    css: '',
    components: null as any,
  });

  // Charger le template si mode édition
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        width: template.width,
        height: template.height,
        event_id: template.event_id || '',
        is_default: template.is_default,
      });

      setEditorData({
        html: template.html || '',
        css: template.css || '',
        components: template.template_data,
      });
    }
  }, [template]);

  const handleEditorChange = (data: { html: string; css: string; components: any }) => {
    setEditorData(data);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Champ requis', 'Le nom du template est requis');
      return;
    }

    const templateData: any = {
      name: formData.name,
      ...(formData.description && { description: formData.description }),
      html: editorData.html,
      css: editorData.css,
      width: formData.width,
      height: formData.height,
      template_data: editorData.components,
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
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Badge Participant Standard"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Largeur (px)
              </label>
              <input
                type="number"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 400 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hauteur (px)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 600 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
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
          width={formData.width}
          height={formData.height}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
};
