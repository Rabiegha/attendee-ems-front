/**
 * PartnersPage - Page de gestion des partenaires (admin / non-partner)
 *
 * Onglet 1 : Liste des partenaires (rôle PARTNER) avec CRUD
 * Onglet 2 : Gestion des entreprises (CRUD)
 */

import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Building2,
} from 'lucide-react'
import {
  Button,
  Card,
  PageContainer,
  PageHeader,
  PageSection,
  DataTable,
  createDateColumn,
  createActionsColumn,
  SearchInput,
  FilterBar,
  FilterButton,
  Tabs,
  type TabItem,
  type FilterValues,
} from '@/shared/ui'
import {
  useGetPartnersQuery,
  type PartnersQueryParams,
} from '@/features/partners/api/partnersApi'
import { CreatePartnerModal } from '@/features/partners/ui/CreatePartnerModal'
import { EditUserModal } from '@/features/users/ui/EditUserModal'
import { DeleteUserModal } from '@/features/users/ui/DeleteUserModal'
import { useUpdateUserMutation } from '@/features/users/api/usersApi'
import {
  useGetCompaniesQuery,
  useDeleteCompanyMutation,
  type Company,
} from '@/features/companies/api/companiesApi'
import { CompanyModal } from '@/features/companies/ui/CompanyModal'
import { useToast } from '@/shared/hooks/useToast'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/app/config/constants'
import type { User } from '@/features/users/api/usersApi'

export const PartnersPage: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation('common')

  // Onglet actif
  const [activeTab, setActiveTab] = useState('partners')

  // ── State Partenaires ──
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [companyFilters, setCompanyFilters] = useState<FilterValues>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<User | null>(null)
  const [deletingPartner, setDeletingPartner] = useState<User | null>(null)
  const lastSearchRef = useRef<string>('')

  // ── State Entreprises ──
  const [companySearchQuery, setCompanySearchQuery] = useState('')
  const [debouncedCompanySearch, setDebouncedCompanySearch] = useState('')
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null)
  const companySearchRef = useRef<string>('')

  // Mutations
  const [updateUser] = useUpdateUserMutation()
  const [deleteCompany] = useDeleteCompanyMutation()

  // ── Debounce recherche partenaires ──
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== lastSearchRef.current) {
        lastSearchRef.current = searchQuery
        setDebouncedSearch(searchQuery)
        setPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // ── Debounce recherche entreprises ──
  useEffect(() => {
    const timer = setTimeout(() => {
      if (companySearchQuery !== companySearchRef.current) {
        companySearchRef.current = companySearchQuery
        setDebouncedCompanySearch(companySearchQuery)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [companySearchQuery])

  // ── API Partenaires ──
  const selectedCompanyFilter = companyFilters.company as string | undefined

  const partnersQueryParams: PartnersQueryParams = {
    page,
    limit: pageSize,
  }
  if (debouncedSearch) partnersQueryParams.search = debouncedSearch
  // Filtre par entreprise côté serveur (par company_id)
  if (
    selectedCompanyFilter &&
    selectedCompanyFilter !== 'all' &&
    selectedCompanyFilter !== 'with' &&
    selectedCompanyFilter !== 'without'
  ) {
    partnersQueryParams.companyId = selectedCompanyFilter
  }
  if (selectedCompanyFilter === 'with') {
    partnersQueryParams.hasCompany = true
  }
  if (selectedCompanyFilter === 'without') {
    partnersQueryParams.hasCompany = false
  }

  const { data: partnersData, isLoading: isLoadingPartners } =
    useGetPartnersQuery(partnersQueryParams)

  // ── API Entreprises ──
  const { data: companies = [], isLoading: isLoadingCompanies } =
    useGetCompaniesQuery(debouncedCompanySearch || undefined)

  const filteredPartners = useMemo(
    () => partnersData?.users || [],
    [partnersData?.users]
  )

  // Config des filtres partenaires avec les entreprises de la DB
  const filterConfig = useMemo(() => {
    const companyOptions = [
      { value: 'all', label: t('partners.filter_company_all') },
      { value: 'with', label: t('partner_scans.filter_company_with') },
      { value: 'without', label: t('partner_scans.filter_company_without') },
      ...companies.map((c) => ({ value: c.id, label: c.name })),
    ]

    return {
      company: {
        label: t('partners.filter_company'),
        type: 'radio' as const,
        options: companyOptions,
      },
    }
  }, [t, companies])

  // ── Tabs config ──
  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: 'partners',
        label: t('partners.tab_partners'),
        count: partnersData?.total || 0,
      },
      {
        id: 'companies',
        label: t('companies.tab_title'),
        count: companies.length,
      },
    ],
    [t, partnersData?.total, companies.length]
  )

  // ── Handlers Partenaires ──
  const handleResetFilters = () => {
    setSearchQuery('')
    setCompanyFilters({})
    setDebouncedSearch('')
    setPage(1)
  }

  const handleViewScans = (partner: User) => {
    navigate(`${ROUTES.PARTNERS}/${partner.id}`)
  }

  const handleEditPartner = (partner: User) => {
    setEditingPartner(partner)
  }

  const handleDeletePartner = (partner: User) => {
    setDeletingPartner(partner)
  }

  const handleSavePartner = async (userId: string, data: any) => {
    await updateUser({ id: userId, data }).unwrap()
    setEditingPartner(null)
    toast.success(t('partners.edit_success'))
  }

  const handleConfirmDelete = async (userId: string, data: any) => {
    await updateUser({ id: userId, data }).unwrap()
    setDeletingPartner(null)
    toast.success(t('partners.delete_success'))
  }

  // ── Handlers Entreprises ──
  const handleEditCompany = (company: Company) => {
    setEditingCompany(company)
    setIsCompanyModalOpen(true)
  }

  const handleDeleteCompany = async () => {
    if (!deletingCompany) return
    try {
      await deleteCompany(deletingCompany.id).unwrap()
      toast.success(t('companies.delete_success'))
      setDeletingCompany(null)
    } catch {
      toast.error(t('companies.delete_error'))
    }
  }

  // ── Colonnes Partenaires ──
  const partnerColumns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: 'partner',
        header: t('partners.col_partner'),
        accessorFn: (row) =>
          `${row.first_name || ''} ${row.last_name || ''} ${row.email}`,
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => {
          const user = row.original
          const fullName = [user.first_name, user.last_name]
            .filter(Boolean)
            .join(' ')
          const initials =
            [user.first_name?.[0], user.last_name?.[0]]
              .filter(Boolean)
              .join('')
              .toUpperCase() || '?'
          return (
            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleViewScans(user)}
            >
              <div className="h-10 w-10 flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {initials}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {fullName || user.email}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>
          )
        },
        enableSorting: true,
      },
      {
        id: 'company',
        header: t('partners.col_company'),
        accessorFn: (row) => row.company_name || row.company || '',
        cell: ({ row }) => {
          const companyName = row.original.company_name || row.original.company
          if (!companyName) {
            return (
              <div
                className="cursor-pointer"
                onClick={() => handleViewScans(row.original)}
              >
                <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                  {t('partners.no_company')}
                </span>
              </div>
            )
          }
          return (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleViewScans(row.original)}
            >
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-white">
                {companyName}
              </span>
            </div>
          )
        },
        enableSorting: true,
      },
      {
        id: 'status',
        header: t('partners.col_status'),
        accessorFn: (row) => (row.is_active ? 'active' : 'inactive'),
        cell: ({ row }) => {
          const isActive = row.original.is_active
          return (
            <div
              className="cursor-pointer"
              onClick={() => handleViewScans(row.original)}
            >
              {isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                  <UserCheck className="h-3 w-3 mr-1" />
                  {t('partners.status_active')}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">
                  <UserX className="h-3 w-3 mr-1" />
                  {t('partners.status_inactive')}
                </span>
              )}
            </div>
          )
        },
        enableSorting: true,
      },
      createDateColumn<User>('created_at', t('partners.col_created_at')),
      createActionsColumn<User>((partner) => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEditPartner(partner)
            }}
            title={t('partners.action_edit')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0 min-w-[32px] p-1.5"
          >
            <Edit2 className="h-4 w-4 shrink-0" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeletePartner(partner)
            }}
            title={t('partners.action_delete')}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 min-w-[32px] p-1.5"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
          </Button>
        </>
      )),
    ],
    [t]
  )

  // ── Colonnes Entreprises ──
  const companyColumns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        id: 'name',
        header: t('companies.col_name'),
        accessorKey: 'name',
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {row.original.name}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        id: 'partners_count',
        header: t('companies.col_partners_count'),
        accessorFn: (row) => row._count?.users || 0,
        cell: ({ row }) => {
          const count = row.original._count?.users || 0
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
              {count} {t('companies.partners_label')}
            </span>
          )
        },
        enableSorting: true,
      },
      createDateColumn<Company>('created_at', t('companies.col_created_at')),
      createActionsColumn<Company>((company) => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEditCompany(company)
            }}
            title={t('companies.action_edit')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0 min-w-[32px] p-1.5"
          >
            <Edit2 className="h-4 w-4 shrink-0" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setDeletingCompany(company)
            }}
            title={t('companies.action_delete')}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 min-w-[32px] p-1.5"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
          </Button>
        </>
      )),
    ],
    [t]
  )

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      {/* En-tête */}
      <PageHeader
        title={t('partners.page_title')}
        description={t('partners.page_subtitle')}
        icon={Users}
        actions={
          activeTab === 'partners' ? (
            <Button
              variant="default"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t('partners.create_partner')}
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() => {
                setEditingCompany(null)
                setIsCompanyModalOpen(true)
              }}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t('companies.create_company')}
            </Button>
          )
        }
      />

      {/* Onglets */}
      <PageSection spacing="lg">
        <Tabs items={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </PageSection>

      {/* ── Onglet Partenaires ── */}
      {activeTab === 'partners' && (
        <>
          <PageSection spacing="lg">
            <FilterBar
              resultCount={partnersData?.total || 0}
              resultLabel={t('partners.result_label')}
              onReset={handleResetFilters}
              showResetButton={
                searchQuery !== '' ||
                (selectedCompanyFilter !== undefined &&
                  selectedCompanyFilter !== 'all')
              }
            >
              <SearchInput
                placeholder={t('partners.search_placeholder')}
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <FilterButton
                filters={filterConfig}
                values={companyFilters}
                onChange={setCompanyFilters}
              />
            </FilterBar>
          </PageSection>

          <PageSection spacing="lg">
            <Card variant="default" padding="none">
              <DataTable
                columns={partnerColumns}
                data={filteredPartners}
                isLoading={isLoadingPartners}
                getItemId={(partner) => partner.id}
                itemType={t('partners.result_label')}
                emptyMessage={t('partners.empty_active')}
                enablePagination={true}
                pageSize={pageSize}
                currentPage={page}
                totalItems={partnersData?.total || 0}
                onPageChange={(p: number) => setPage(p)}
                onPageSizeChange={(size: number) => {
                  setPageSize(size)
                  setPage(1)
                }}
              />
            </Card>
          </PageSection>
        </>
      )}

      {/* ── Onglet Entreprises ── */}
      {activeTab === 'companies' && (
        <>
          <PageSection spacing="lg">
            <FilterBar
              resultCount={companies.length}
              resultLabel={t('companies.result_label')}
              onReset={() => setCompanySearchQuery('')}
              showResetButton={companySearchQuery !== ''}
            >
              <SearchInput
                placeholder={t('companies.search_placeholder')}
                value={companySearchQuery}
                onChange={setCompanySearchQuery}
              />
            </FilterBar>
          </PageSection>

          <PageSection spacing="lg">
            <Card variant="default" padding="none">
              <DataTable
                columns={companyColumns}
                data={companies}
                isLoading={isLoadingCompanies}
                getItemId={(company) => company.id}
                itemType={t('companies.result_label')}
                emptyMessage={t('companies.empty')}
              />
            </Card>
          </PageSection>
        </>
      )}

      {/* Modales Partenaires */}
      <CreatePartnerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <EditUserModal
        isOpen={!!editingPartner}
        onClose={() => setEditingPartner(null)}
        user={editingPartner}
        onSave={handleSavePartner}
        useCompanySelect
      />
      <DeleteUserModal
        isOpen={!!deletingPartner}
        onClose={() => setDeletingPartner(null)}
        user={deletingPartner}
        onDelete={handleConfirmDelete}
      />

      {/* Modale Entreprises : Création / Édition */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => {
          setIsCompanyModalOpen(false)
          setEditingCompany(null)
        }}
        company={editingCompany}
      />

      {/* Modale Entreprises : Suppression */}
      {deletingCompany && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setDeletingCompany(null)}
            />
            <div className="relative z-50 w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('companies.delete_title')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('companies.delete_message', { name: deletingCompany.name })}
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingCompany(null)}
                >
                  {t('companies.cancel')}
                </Button>
                <Button variant="destructive" onClick={handleDeleteCompany}>
                  {t('companies.delete_confirm')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
