import React, { useMemo } from 'react'
import { Printer, RefreshCw, Wifi, WifiOff, Monitor } from 'lucide-react'
import {
  useGetExposedPrintersQuery,
  useGetEmsClientStatusQuery,
} from '@/features/print-queue/api/printQueueApi'
import { 
  Button, 
  PageHeader, 
  PageContainer, 
  PageSection,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  LoadingSpinner
} from '@/shared/ui'

interface PrinterGroup {
  deviceId: string
  printers: Array<{
    name: string
    displayName: string
    status: number
    isDefault: boolean
    deviceId?: string
  }>
}

export const PrintingPage: React.FC = () => {
  const { 
    data: printers = [], 
    isLoading, 
    isFetching, 
    refetch 
  } = useGetExposedPrintersQuery()
  
  const { data: clientStatus } = useGetEmsClientStatusQuery(undefined, {
    pollingInterval: 10000,
  })

  const isClientOnline = clientStatus?.connected ?? false

  // Group printers by deviceId
  const printerGroups = useMemo(() => {
    const groups: Record<string, PrinterGroup> = {}
    
    printers.forEach(printer => {
      const deviceId = printer.deviceId || 'Appareil inconnu'
      
      if (!groups[deviceId]) {
        groups[deviceId] = {
          deviceId,
          printers: []
        }
      }
      
      groups[deviceId].printers.push(printer)
    })
    
    return Object.values(groups).sort((a, b) => a.deviceId.localeCompare(b.deviceId))
  }, [printers])

  return (
    <PageContainer>
      <PageHeader
        title="Gestion des imprimantes"
        icon={Printer}
        description="Vue d'ensemble des clients d'impression connectés et de leurs imprimantes"
        actions={
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isClientOnline 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {isClientOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>
                {isClientOnline 
                  ? `${clientStatus?.clientCount || 0} client(s) connecté(s)` 
                  : 'Aucun client connecté'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        }
      />

      <PageSection>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" className="text-gray-400" />
          </div>
        ) : printerGroups.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Printer className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Aucune imprimante détectée
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Connectez le client d'impression EMS sur vos ordinateurs pour voir les imprimantes disponibles ici.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {printerGroups.map((group) => (
              <Card key={group.deviceId} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                      <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-gray-900 dark:text-white">
                        {group.deviceId}
                      </CardTitle>
                      <CardDescription>
                        {group.printers.length} imprimante(s) disponible(s)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="divide-y divide-gray-100 dark:divide-gray-700/50 p-0 flex-1">
                  {group.printers.map((printer) => (
                    <div 
                      key={`${printer.name}-${printer.deviceId}`}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-start justify-between group"
                    >
                      <div className="flex items-start gap-3">
                        <Printer className={`w-5 h-5 mt-0.5 ${
                          printer.status === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-red-400'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {printer.displayName}
                          </p>
                          {printer.name !== printer.displayName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 truncate max-w-[200px]" title={printer.name}>
                              {printer.name}
                            </p>
                          )}
                          {printer.isDefault && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mt-1.5 border border-blue-100 dark:border-blue-800">
                              Défaut
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className={`w-2 h-2 rounded-full mt-2 ring-2 ring-white dark:ring-gray-800 ${
                        printer.status === 0 
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                          : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      }`} title={printer.status === 0 ? 'Prête' : 'Erreur / Hors ligne'} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageSection>
    </PageContainer>
  )
}
