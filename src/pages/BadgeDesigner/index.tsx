import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { CreditCard, Plus, Clock, Hash, Layers } from 'lucide-react';
import { 
  PageHeader,
  PageContainer,
  PageSection,
  Card,
  CardContent,
  LoadingState,
  BadgeTemplatesGridSkeleton,
  Button,
  SearchInput,
  FilterBar,
  FilterButton,
  FilterSort,
  type FilterValues,
  type SortOption
} from '@/shared/ui';
import { useGetBadgeTemplatesQuery, badgeTemplatesApi } from '@/services/api/badge-templates.api';

export const BadgeDesigner: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation(['badges', 'common']);
  
  // États de recherche et filtrage
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [sortValue, setSortValue] = useState<string>('createdAt-desc');
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Reset page on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterValues, sortValue]);
  
  // Extraction des valeurs de filtres et tri
  const statusFilter = filterValues.status as string | undefined;
  const isDefaultFilter = filterValues.isDefault as string | undefined;
  const [sortBy, sortOrder] = sortValue.split('-') as [string, 'asc' | 'desc'];
  
  const { 
    data: badgeTemplatesData = [], 
    isLoading, 
    error,
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

  const handleRefresh = () => {
    dispatch(badgeTemplatesApi.util.invalidateTags(['BadgeTemplates']));
  };

  // Configuration des filtres
  const filterConfig: Record<string, any> = {
    status: {
      key: 'status',
      label: t('badges:filters.status_label'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: t('badges:filters.all') },
        { value: 'active', label: t('badges:filters.active') },
        { value: 'inactive', label: t('badges:filters.inactive') },
      ],
    },
    isDefault: {
      key: 'isDefault',
      label: t('badges:filters.type_label'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: t('badges:filters.all') },
        { value: 'default', label: t('badges:filters.default') },
        { value: 'custom', label: t('badges:filters.custom') },
      ],
    },
  };

  // Configuration des options de tri
  const sortOptions: SortOption[] = [
    { value: 'createdAt-desc', label: t('badges:filters.sort_newest') },
    { value: 'createdAt-asc', label: t('badges:filters.sort_oldest') },
    { value: 'name-asc', label: t('badges:filters.sort_name_az') },
    { value: 'name-desc', label: t('badges:filters.sort_name_za') },
    { value: 'usageCount-desc', label: t('badges:filters.sort_most_used') },
    { value: 'usageCount-asc', label: t('badges:filters.sort_least_used') },
  ];

  // Fonction pour réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterValues({});
    setSortValue('createdAt-desc');
    setCurrentPage(1);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <PageHeader 
          title={t('badges:page.title')}
          description={t('badges:page.description')}
          icon={CreditCard}
          actions={
            <Button 
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/badges/designer/new')}
            >
              {t('badges:actions.new_template')}
            </Button>
          }
        />

        <PageSection spacing="lg">
          <FilterBar
            resultCount={0}
            resultLabel={t('badges:page.result_label')}
            onReset={handleResetFilters}
            showResetButton={false}
          >
            <SearchInput
              placeholder={t('badges:actions.search_placeholder')}
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
        </PageSection>

        <PageSection spacing="lg">
          <BadgeTemplatesGridSkeleton count={6} />
        </PageSection>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-red-600 dark:text-red-400">
            {t('badges:page.loading_error')}
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader 
        title={t('badges:page.title')}
        description={totalTemplates > 1
          ? `${totalTemplates} templates de badges`
          : totalTemplates === 1
            ? '1 template de badge'
            : t('badges:page.description')}
        icon={CreditCard}
        actions={
          <Button 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/badges/designer/new')}
          >
            {t('badges:actions.new_template')}
          </Button>
        }
      />

      {/* Barre de recherche et filtres */}
      <PageSection spacing="lg">
        <FilterBar
          resultCount={totalTemplates}
          resultLabel={t('badges:page.result_label')}
          onReset={handleResetFilters}
          showResetButton={searchQuery !== '' || Object.keys(filterValues).length > 0}
          onRefresh={handleRefresh}
          showRefreshButton={true}
        >
          <SearchInput
            placeholder={t('badges:actions.search_placeholder')}
            value={searchQuery}
            onChange={setSearchQuery}
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
      </PageSection>

      {/* Liste des templates */}
      <PageSection spacing="lg">
        {templates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('badges:empty.title')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || Object.keys(filterValues).length > 0
                ? t('badges:empty.no_results')
                : t('badges:empty.no_templates')}
            </p>
            <Button 
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/badges/designer/new')}
            >
              {t('badges:actions.create_first')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Link
                key={template.id}
                to={`/badges/designer/${template.id}`}
                className="block group"
              >
                <Card
                  variant="elevated"
                  padding="none"
                  className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                >
                  <CardContent className="p-6 flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-heading-sm line-clamp-2">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        {template.is_default && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {t('badges:template.default_badge')}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(template.is_active)}`}>
                          {template.is_active ? t('badges:template.active') : t('badges:template.inactive')}
                        </span>
                      </div>
                    </div>

                    {template.description && (
                      <p className="text-body-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <div className="space-y-2 text-body-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Layers className="h-4 w-4 mr-2 shrink-0" />
                        <span>{template.width} × {template.height}px</span>
                      </div>

                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Hash className="h-4 w-4 mr-2 shrink-0" />
                        <span>{t('badges:template.used_count', { count: template.usage_count })}</span>
                      </div>

                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2 shrink-0" />
                        <span>{new Date(template.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    {template.variables && template.variables.length > 0 && (
                      <div className="flex items-center flex-wrap gap-2 mt-3">
                        {template.variables.slice(0, 3).map((variable, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                          >
                            {variable}
                          </span>
                        ))}
                        {template.variables.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{template.variables.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {templates.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            {/* Info pagination et sélecteur de taille */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>
                {t('common:pagination.showing', { from: (currentPage - 1) * pageSize + 1, to: Math.min(currentPage * pageSize, totalTemplates), total: totalTemplates })}
              </span>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap">{t('common:pagination.per_page')}</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[12, 24, 48, 100].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Contrôles pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  title={t('common:pagination.first_page')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages: (number | string)[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push('...');
                      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                        pages.push(i);
                      }
                      if (currentPage < totalPages - 2) pages.push('...');
                      pages.push(totalPages);
                    }
                    return pages.map((page, idx) =>
                      typeof page === 'number' ? (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                            currentPage === page
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">...</span>
                      )
                    );
                  })()}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  title={t('common:pagination.last_page')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </PageSection>
    </PageContainer>
  );
};
