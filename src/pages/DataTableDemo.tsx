/**
 * DataTable Demo Page
 * 
 * Démo interactive des nouvelles features:
 * - Column Ordering (drag & drop)
 * - Column Visibility (masquer/afficher)
 */

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  PageContainer,
  PageHeader,
  PageSection,
  DataTable,
  createDateColumn,
  createActionsColumn,
  Button,
} from '@/shared/ui'
import { Table, Sparkles, Info } from 'lucide-react'

interface DemoUser {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
}

const demoData: DemoUser[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    role: 'Admin',
    status: 'active',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Marie Martin',
    email: 'marie.martin@example.com',
    role: 'Manager',
    status: 'active',
    created_at: '2024-02-20T14:15:00Z',
  },
  {
    id: '3',
    name: 'Pierre Bernard',
    email: 'pierre.bernard@example.com',
    role: 'User',
    status: 'pending',
    created_at: '2024-03-10T09:00:00Z',
  },
  {
    id: '4',
    name: 'Sophie Dubois',
    email: 'sophie.dubois@example.com',
    role: 'User',
    status: 'active',
    created_at: '2024-03-25T16:45:00Z',
  },
  {
    id: '5',
    name: 'Luc Moreau',
    email: 'luc.moreau@example.com',
    role: 'Manager',
    status: 'inactive',
    created_at: '2024-04-01T11:20:00Z',
  },
]

export function DataTableDemo() {
  const columns = useMemo<ColumnDef<DemoUser>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Nom',
        enableSorting: true,
        enableHiding: true,
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        enableSorting: true,
        enableHiding: true,
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: 'Rôle',
        enableSorting: true,
        enableHiding: true,
        cell: ({ row }) => {
          const roleColors = {
            Admin: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200',
            Manager:
              'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
            User: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
          }

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                roleColors[row.original.role as keyof typeof roleColors]
              }`}
            >
              {row.original.role}
            </span>
          )
        },
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Statut',
        enableSorting: true,
        enableHiding: true,
        cell: ({ row }) => {
          const statusConfig = {
            active: {
              label: 'Actif',
              className:
                'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
            },
            inactive: {
              label: 'Inactif',
              className:
                'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
            },
            pending: {
              label: 'En attente',
              className:
                'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200',
            },
          }

          const config = statusConfig[row.original.status]

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
            >
              {config.label}
            </span>
          )
        },
      },
      createDateColumn<DemoUser>('created_at', 'Date de création'),
      createActionsColumn<DemoUser>(() => (
        <Button variant="ghost" size="sm">
          Modifier
        </Button>
      )),
    ],
    []
  )

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader
        title="DataTable - Démo Interactive"
        description="Testez les nouvelles fonctionnalités : drag & drop des colonnes et gestion de la visibilité"
        icon={Table}
      />

      {/* Instructions */}
      <PageSection spacing="lg">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Nouvelles fonctionnalités disponibles
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">🎯 Column Ordering:</span>
                  <span>
                    Cliquez et glissez sur l'icône ⋮⋮ à gauche de chaque en-tête pour
                    réorganiser les colonnes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">👁️ Column Visibility:</span>
                  <span>
                    Cliquez sur le bouton "Colonnes" en haut à droite pour
                    masquer/afficher des colonnes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">✨ Animations smooth:</span>
                  <span>
                    Transitions fluides avec cubic-bezier + visual feedback pendant le
                    drag
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </PageSection>

      {/* Table avec toutes les features */}
      <PageSection title="Table Interactive" spacing="lg">
        <DataTable
          columns={columns}
          data={demoData}
          enablePagination={false}
          enableColumnOrdering={true}
          enableColumnVisibility={true}
        />
      </PageSection>

      {/* Info supplémentaire */}
      <PageSection spacing="lg">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium mb-2">Configuration par défaut</p>
              <ul className="space-y-1">
                <li>• enableColumnOrdering={'{true}'} - Activer le drag & drop</li>
                <li>• enableColumnVisibility={'{true}'} - Activer le menu colonnes</li>
                <li>• Toutes les colonnes sont triables et masquables par défaut</li>
                <li>
                  • Pour empêcher de masquer une colonne, ajoutez enableHiding: false
                </li>
              </ul>
            </div>
          </div>
        </div>
      </PageSection>
    </PageContainer>
  )
}
