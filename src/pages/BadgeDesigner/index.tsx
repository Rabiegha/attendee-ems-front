import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus } from 'lucide-react';
import { 
  PageHeader,
  PageContainer,
  Card,
  LoadingState,
  BadgeTemplatesGridSkeleton,
  Button,
  SearchInput,
  FilterBar,
  FilterButton,
  FilterSort,
  Pagination,
  type FilterValues,
  type SortOption
} from '@/shared/ui';
import { useGetBadgeTemplatesQuery } from '@/services/api/badge-templates.api';

export const BadgeDesigner: React.FC = () => {
  const navigate = useNavigate();
  
  // États de recherche et filtrage
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [sortValue, setSortValue] = useState<string>('createdAt-desc');
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // Extraction des valeurs de filtres et tri
  const statusFilter = filterValues.status as string | undefined;
  const isDefaultFilter = filterValues.isDefault as string | undefined;
  const [sortBy, sortOrder] = sortValue.split('-') as [string, 'asc' | 'desc'];
  
  const { 
    data: badgeTemplatesData = [], 
    isLoading, 
    error,
    refetch 
  } = useGetBadgeTemplatesQuery({ 
    page: currentPage, 
    limit: pageSize,
    ...(searchQuery ? { search: String(searchQuery) } : {}),
    ...(statusFilter === 'active' || statusFilter === 'inactive' ? { isActive: statusFilter === 'active' } : {}),
    ...(isDefaultFilter === 'default' || isDefaultFilter === 'custom' ? { isDefault: isDefaultFilter === 'default' } : {}),
    sortBy: sortBy,
    sortOrder: sortOrder
  });

  const templates = badgeTemplatesData || [];
  const totalTemplates = templates.length;
  const totalPages = Math.ceil(totalTemplates / pageSize);

  // Configuration des filtres
  const filterConfig: Record<string, any> = {
    status: {
      key: 'status',
      label: 'Statut',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Actif' },
        { value: 'inactive', label: 'Inactif' },
      ],
    },
    isDefault: {
      key: 'isDefault',
      label: 'Type',
      type: 'select' as const,
      options: [
        { value: 'default', label: 'Par défaut' },
        { value: 'custom', label: 'Personnalisé' },
      ],
    },
  };

  // Configuration des options de tri
  const sortOptions: SortOption[] = [
    { value: 'createdAt-desc', label: 'Plus récent' },
    { value: 'createdAt-asc', label: 'Plus ancien' },
    { value: 'name-asc', label: 'Nom (A-Z)' },
    { value: 'name-desc', label: 'Nom (Z-A)' },
    { value: 'usageCount-desc', label: 'Plus utilisé' },
    { value: 'usageCount-asc', label: 'Moins utilisé' },
  ];

  // Fonction pour réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterValues({});
    setSortValue('createdAt-desc');
    setCurrentPage(1);
  };

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <div className="space-y-6">
      <PageHeader 
        title="Templates de badges"
        description="Créez et gérez vos templates de badges d'événements"
        icon={CreditCard}
        actions={
          <Button 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/badges/designer/new')}
          >
            Nouveau template
          </Button>
        }
      />

      {/* Barre de recherche et filtres */}
      <FilterBar
        resultCount={totalTemplates}
        resultLabel="template"
        onReset={handleResetFilters}
        showResetButton={searchQuery !== '' || Object.keys(filterValues).length > 0}
        onRefresh={refetch}
        showRefreshButton={true}
      >
        <SearchInput
          placeholder="Rechercher un template..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1"
        />

        <FilterButton
          filters={filterConfig}
          values={filterValues}
          onChange={setFilterValues}
        />

        <FilterSort
          value={sortValue}
          onChange={setSortValue}
          options={sortOptions}
        />
      </FilterBar>
      
      <Card>
        {isLoading && (
          <div className="p-6">
            <BadgeTemplatesGridSkeleton count={6} />
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <p className="text-red-500">
              Erreur lors du chargement des templates
            </p>
          </div>
        )}

        {!isLoading && !error && templates && templates.length > 0 && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                    </div>
                    <div className="flex space-x-1">
                      {template.is_default && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Par défaut
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {template.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  
                  {template.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-3">
                    {template.width} × {template.height}px
                  </div>
                  
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.variables.slice(0, 3).map((variable, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {variable}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          +{template.variables.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Utilisé {template.usage_count} fois</span>
                    <span>{new Date(template.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/badges/designer/${template.id}`)}
                    >
                      Modifier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              total={totalTemplates}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[12, 24, 48, 96]}
            />
          </div>
        )}

        {!isLoading && !error && (!templates || templates.length === 0) && (
          <div className="p-8 text-center">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              Aucun template trouvé
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || Object.keys(filterValues).length > 0
                ? 'Aucun template ne correspond à vos critères de recherche'
                : 'Vous n\'avez pas encore créé de template de badge'}
            </p>
            <Button 
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/badges/designer/new')}
            >
              Créer votre premier template
            </Button>
          </div>
        )}
      </Card>
      </div>
    </PageContainer>
  );
};
