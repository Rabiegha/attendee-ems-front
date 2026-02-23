import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('badges');
  
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
      label: t('filters.status_label'),
      type: 'select' as const,
      options: [
        { value: 'active', label: t('filters.active') },
        { value: 'inactive', label: t('filters.inactive') },
      ],
    },
    isDefault: {
      key: 'isDefault',
      label: t('filters.type_label'),
      type: 'select' as const,
      options: [
        { value: 'default', label: t('filters.default') },
        { value: 'custom', label: t('filters.custom') },
      ],
    },
  };

  // Configuration des options de tri
  const sortOptions: SortOption[] = [
    { value: 'createdAt-desc', label: t('filters.sort_newest') },
    { value: 'createdAt-asc', label: t('filters.sort_oldest') },
    { value: 'name-asc', label: t('filters.sort_name_az') },
    { value: 'name-desc', label: t('filters.sort_name_za') },
    { value: 'usageCount-desc', label: t('filters.sort_most_used') },
    { value: 'usageCount-asc', label: t('filters.sort_least_used') },
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
        title={t('page.title')}
        description={t('page.description')}
        icon={CreditCard}
        actions={
          <Button 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/badges/designer/new')}
          >
            {t('actions.new_template')}
          </Button>
        }
      />

      {/* Barre de recherche et filtres */}
      <FilterBar
        resultCount={totalTemplates}
        resultLabel={t('page.result_label')}
        onReset={handleResetFilters}
        showResetButton={searchQuery !== '' || Object.keys(filterValues).length > 0}
        onRefresh={refetch}
        showRefreshButton={true}
      >
        <SearchInput
          placeholder={t('actions.search_placeholder')}
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
              {t('page.loading_error')}
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
                          {t('template.default_badge')}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {template.is_active ? t('template.active') : t('template.inactive')}
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
                    <span>{t('template.used_count', { count: template.usage_count })}</span>
                    <span>{new Date(template.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/badges/designer/${template.id}`)}
                    >
                      {t('actions.edit')}
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
              {t('empty.title')}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || Object.keys(filterValues).length > 0
                ? t('empty.no_results')
                : t('empty.no_templates')}
            </p>
            <Button 
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/badges/designer/new')}
            >
              {t('actions.create_first')}
            </Button>
          </div>
        )}
      </Card>
      </div>
    </PageContainer>
  );
};
