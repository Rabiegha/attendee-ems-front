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
  XCircle,
} from 'lucide-react';
import {
  Button,
  PageContainer,
  PageHeader,
  PageSection,
  LoadingSpinner,
  Card,
  CardContent,
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

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="Templates de badges"
        description="Créez et gérez vos templates de badges pour vos événements"
        icon={CreditCard}
        actions={
          <Button onClick={handleCreate} variant="primary">
            <Plus className="w-5 h-5 mr-2" />
            Créer un template
          </Button>
        }
      />

      <PageSection>
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterActive(
                    value === 'all' ? undefined : value === 'active'
                  );
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">{templates.length}</span>
              <span className="ml-1">template{templates.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || filterActive !== undefined
                  ? 'Aucun template trouvé avec ces critères'
                  : 'Aucun template de badge pour le moment'}
              </p>
              <Button onClick={handleCreate} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Créer votre premier template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-2">
                      {template.is_active ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  <div 
                    className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
                    style={{ height: '200px' }}
                  >
                    {template.html ? (
                      <iframe
                        srcDoc={`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <style>${template.css || ''}</style>
                              <style>
                                body { 
                                  margin: 0; 
                                  transform: scale(0.3); 
                                  transform-origin: top left;
                                  width: ${template.width}px;
                                  height: ${template.height}px;
                                }
                              </style>
                            </head>
                            <body>${template.html}</body>
                          </html>
                        `}
                        className="w-full h-full border-0"
                        style={{ 
                          width: `${template.width * 0.3}px`,
                          height: `${template.height * 0.3}px`
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 dark:text-gray-600 text-sm">
                        Pas d'aperçu disponible
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span>
                      {template.width} × {template.height} px
                    </span>
                    {template.is_default && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                        Par défaut
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleEdit(template.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      onClick={() => handleDelete(template.id, template.name)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageSection>
    </PageContainer>
  );
};
