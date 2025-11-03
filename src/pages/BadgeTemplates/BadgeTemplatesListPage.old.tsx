import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetBadgeTemplatesQuery,
  useDeleteBadgeTemplateMutation,
} from '@/features/badge-templates/api/badgeTemplatesApi';
import { useToast } from '@/shared/hooks/useToast';
import { 
  CreditCard,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
} from 'lucide-react';
import {
  Button,
  PageContainer,
  PageHeader,
  PageSection,
  LoadingSpinner,
} from '@/shared/ui';

export const BadgeTemplatesListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

  // RTK Query hooks
  const { data: templates = [], isLoading: loading } = useGetBadgeTemplatesQuery({
    ...(filterActive !== undefined && { isActive: filterActive }),
    ...(searchTerm && { search: searchTerm }),
  });
  const [deleteTemplate] = useDeleteBadgeTemplateMutation();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le template "${name}" ?`)) {
      return;
    }

    try {
      await deleteTemplate(id).unwrap();
      toast.success('Template supprimé avec succès');
    } catch (error: any) {
      toast.error('Erreur de suppression', error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleCreate = () => {
    navigate('/admin/badge-templates/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/badge-templates/${id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Templates de Badges</h1>
          <p className="mt-2 text-sm text-gray-600">
            Créez et gérez vos templates de badges personnalisés
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher un template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Active */}
            <select
              value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => {
                const value = e.target.value;
                setFilterActive(value === 'all' ? undefined : value === 'active');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les templates</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Créer un template
          </button>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Aucun template trouvé
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Commencez par créer votre premier template de badge
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5" />
              Créer un template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all hover:shadow-md overflow-hidden"
              >
                {/* Preview */}
                <div className="bg-gray-100 p-4 flex items-center justify-center h-48 relative">
                  <div
                    className="bg-white shadow-lg"
                    style={{
                      width: `${Math.min(template.width / 2, 160)}px`,
                      height: `${Math.min(template.height / 2, 240)}px`,
                      fontSize: '8px',
                    }}
                  >
                    {template.html ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: template.html.substring(0, 500) }}
                        className="overflow-hidden"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                        Aperçu non disponible
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {template.is_default && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CheckCircleIcon className="w-3 h-3" />
                        Défaut
                      </span>
                    )}
                    {!template.is_active && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactif
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{template.width}×{template.height}px</span>
                    <span>{template.usage_count} utilisation{template.usage_count > 1 ? 's' : ''}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(template.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Modifier</span>
                    </button>
                    <button
                      onClick={() => {/* TODO: Preview modal */}}
                      className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id, template.name)}
                      className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
