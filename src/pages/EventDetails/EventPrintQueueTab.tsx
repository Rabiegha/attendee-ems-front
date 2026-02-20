import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectUserId } from '@/features/auth/model/sessionSlice'
import {
  useGetPrintJobsQuery,
  useGetEmsClientStatusQuery,
  useGetExposedPrintersQuery,
  useAddBatchPrintJobsMutation,
  useRetryOfflineJobsMutation,
  useDismissOfflineJobsMutation,
  type PrintJob,
} from '@/features/print-queue/api/printQueueApi'
import { useGetRegistrationsQuery } from '@/features/registrations/api/registrationsApi'
import { socketService } from '@/services/socket.service'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/hooks/useToast'
import type { EventDPO } from '@/features/events/dpo/event.dpo'
import {
  Printer,
  RefreshCw,
  XCircle,
  Loader2,
  Wifi,
  WifiOff,
  Send,
  AlertTriangle,
  ChevronDown,
  Check,
  Search,
  CheckCircle,
  Clock,
} from 'lucide-react'

interface EventPrintQueueTabProps {
  event: EventDPO
}

// Helper pour extraire le nom d'un registration
function getRegistrationName(job: PrintJob): string {
  const reg = job.registration
  if (!reg) return job.registration_id?.substring(0, 8) || '—'
  const first = reg.snapshot_first_name || reg.attendee_first_name || ''
  const last = reg.snapshot_last_name || reg.attendee_last_name || ''
  return `${first} ${last}`.trim() || job.registration_id?.substring(0, 8) || '—'
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'En attente', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    PRINTING: { label: 'Impression...', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    COMPLETED: { label: 'Terminé', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    FAILED: { label: 'Erreur', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    OFFLINE: { label: 'Hors ligne', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  }
  const c = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>
      {status === 'PRINTING' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
      {status === 'COMPLETED' && <CheckCircle className="w-3 h-3 mr-1" />}
      {status === 'FAILED' && <XCircle className="w-3 h-3 mr-1" />}
      {status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
      {status === 'OFFLINE' && <WifiOff className="w-3 h-3 mr-1" />}
      {c.label}
    </span>
  )
}

export const EventPrintQueueTab: React.FC<EventPrintQueueTabProps> = ({ event }) => {
  const toast = useToast()
  const userId = useSelector(selectUserId)

  // --- Data fetching ---
  const { data: printJobs = [], isLoading: isLoadingJobs, refetch: refetchJobs } = useGetPrintJobsQuery(
    { eventId: event.id, limit: 200 },
    { pollingInterval: 30000 }
  )

  const { data: clientStatus } = useGetEmsClientStatusQuery(undefined, {
    pollingInterval: 10000,
  })

  const { data: exposedPrinters = [] } = useGetExposedPrintersQuery()

  const { data: registrationsData } = useGetRegistrationsQuery({
    eventId: event.id,
    page: 1,
    limit: 10000,
    status: 'approved',
  })

  const registrations = registrationsData?.data || []

  // --- Mutations ---
  const [addBatchPrintJobs, { isLoading: isBatchPrinting }] = useAddBatchPrintJobsMutation()
  const [retryOfflineJobs] = useRetryOfflineJobsMutation()
  const [dismissOfflineJobs] = useDismissOfflineJobsMutation()

  // --- Local state ---
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const [showPrinterDropdown, setShowPrinterDropdown] = useState(false)
  const [selectedRegistrations, setSelectedRegistrations] = useState<Set<string>>(new Set())
  const [batchSearch, setBatchSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [displayCount, setDisplayCount] = useState(20)

  // --- Real-time WebSocket updates ---
  useEffect(() => {
    const handlePrintJobUpdated = () => {
      refetchJobs()
    }
    socketService.on('print-job:updated', handlePrintJobUpdated)
    socketService.on('print-job:created', handlePrintJobUpdated)
    return () => {
      socketService.off('print-job:updated', handlePrintJobUpdated)
      socketService.off('print-job:created', handlePrintJobUpdated)
    }
  }, [refetchJobs])

  // --- Auto select first printer ---
  useEffect(() => {
    if (!selectedPrinter && exposedPrinters.length > 0) {
      const defaultPrinter = exposedPrinters.find(p => p.isDefault) ?? exposedPrinters[0]
      if (defaultPrinter) setSelectedPrinter(defaultPrinter.name)
    }
  }, [exposedPrinters, selectedPrinter])

  // --- Filtered & sorted jobs ---
  const filteredJobs = useMemo(() => {
    let jobs = [...printJobs]
    if (statusFilter !== 'all') {
      jobs = jobs.filter(j => j.status === statusFilter)
    }
    return jobs
  }, [printJobs, statusFilter])

  const visibleJobs = filteredJobs.slice(0, displayCount)
  const hasMore = filteredJobs.length > displayCount

  // --- Status counts for filter dropdown ---
  const offlineCount = useMemo(() => printJobs.filter(j => j.status === 'OFFLINE').length, [printJobs])

  // --- Batch printing ---
  const filteredRegistrations = useMemo(() => {
    if (!batchSearch) return registrations
    const q = batchSearch.toLowerCase()
    return registrations.filter(r => {
      const name = `${r.attendee?.firstName || ''} ${r.attendee?.lastName || ''}`.toLowerCase()
      const email = (r.attendee?.email || '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [registrations, batchSearch])

  const toggleRegistration = (id: string) => {
    setSelectedRegistrations(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedRegistrations(new Set(filteredRegistrations.map(r => r.id)))
  }

  const deselectAll = () => {
    setSelectedRegistrations(new Set())
  }

  const handleBatchPrint = async () => {
    if (selectedRegistrations.size === 0) {
      toast.error('Sélectionnez au moins un participant')
      return
    }

    if (!selectedPrinter) {
      toast.error('Sélectionnez une imprimante')
      return
    }

    if (!userId) {
      toast.error('Utilisateur non connecté')
      return
    }

    const regs = registrations
      .filter(r => selectedRegistrations.has(r.id))
      .map(r => ({
        registrationId: r.id,
        eventId: event.id,
        userId: userId,
        badgeUrl: r.badgePdfUrl || r.badgeImageUrl || '',
      }))

    try {
      const results = await addBatchPrintJobs({
        registrations: regs,
        printerName: selectedPrinter,
      }).unwrap()

      toast.success(`${results.length} badges envoyés à la file d'impression`)
      setSelectedRegistrations(new Set())
    } catch (error) {
      toast.error("Erreur lors de l'envoi des badges")
      console.error('Batch print error:', error)
    }
  }

  const handleRetryOffline = async () => {
    try {
      const result = await retryOfflineJobs().unwrap()
      toast.success(`${result.count} job(s) relancé(s)`)
    } catch {
      toast.error('Erreur lors de la relance')
    }
  }

  const handleDismissOffline = async () => {
    try {
      const result = await dismissOfflineJobs().unwrap()
      toast.success(`${result.count} job(s) annulé(s)`)
    } catch {
      toast.error('Erreur lors de l\'annulation')
    }
  }

  const isClientOnline = clientStatus?.connected ?? false

  return (
    <div className="space-y-6">
      {/* Offline jobs banner */}
      {offlineCount > 0 && (
        <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {offlineCount} job(s) en attente (client hors ligne)
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleRetryOffline}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Relancer tout
            </Button>
            <Button size="sm" variant="outline" onClick={handleDismissOffline}>
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Annuler tout
            </Button>
          </div>
        </div>
      )}

      {/* Two columns: Print Queue + Batch Print */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Print Queue History (2/3) */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                File d'impression
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {filteredJobs.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setDisplayCount(20) }}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="COMPLETED">Terminés</option>
                <option value="PENDING">En attente</option>
                <option value="PRINTING">En cours</option>
                <option value="FAILED">Erreurs</option>
                <option value="OFFLINE">Hors ligne</option>
              </select>

              <Button size="sm" variant="outline" onClick={() => refetchJobs()}>
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Jobs list */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {isLoadingJobs ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Chargement...
              </div>
            ) : visibleJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                <Printer className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">Aucune impression pour cet événement</p>
              </div>
            ) : (
              <>
                {visibleJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <StatusBadge status={job.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {getRegistrationName(job)}
                      </p>
                      {job.printer_name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {job.printer_name}
                        </p>
                      )}
                    </div>
                    {job.error && (
                      <span className="text-xs text-red-500 dark:text-red-400 max-w-[200px] truncate" title={job.error}>
                        {job.error}
                      </span>
                    )}
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(job.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {job.duration_ms && (
                        <span className="text-xs font-medium text-blue-500 dark:text-blue-400">
                          {(job.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <button
                    onClick={() => setDisplayCount(prev => prev + 20)}
                    className="w-full py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors font-medium"
                  >
                    Charger plus ({filteredJobs.length - displayCount} restants)
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Batch Print (1/3) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {/* EMS Client status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-3 text-xs font-medium ${
              isClientOnline
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {isClientOnline ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              EMS Client {isClientOnline ? 'connecté' : 'hors ligne'}
              {clientStatus && clientStatus.clientCount > 1 && ` (${clientStatus.clientCount})`}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Send className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Impression en lot
              </h3>
            </div>

            {/* Printer selector */}
            <div className="relative mb-3">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                Imprimante
              </label>
              <button
                onClick={() => setShowPrinterDropdown(!showPrinterDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              >
                <span className="flex items-center gap-2 truncate">
                  <Printer className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {(() => {
                    // Parse selected printer to display correct name
                    if (!selectedPrinter) return 'Sélectionner...';
                    
                    const [pName, dId] = selectedPrinter.includes('::') 
                      ? selectedPrinter.split('::') 
                      : [selectedPrinter, null];
                      
                    const found = exposedPrinters.find(p => p.name === pName && (!dId || p.deviceId === dId));
                    return found 
                      ? `${found.displayName} ${found.deviceId ? `(${found.deviceId})` : ''}`
                      : selectedPrinter;
                  })()}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </button>

              {showPrinterDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {exposedPrinters.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Aucune imprimante exposée
                    </div>
                  ) : (
                    exposedPrinters.map((printer) => (
                      <button
                        key={`${printer.deviceId}-${printer.name}`}
                        onClick={() => {
                          const compositeName = printer.deviceId 
                            ? `${printer.name}::${printer.deviceId}` 
                            : printer.name;
                          setSelectedPrinter(compositeName)
                          setShowPrinterDropdown(false)
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <span className="text-gray-700 dark:text-gray-200">
                          {printer.displayName} 
                          {printer.deviceId && <span className="text-xs text-gray-500 ml-2">({printer.deviceId})</span>}
                        </span>
                        {selectedPrinter === (printer.deviceId ? `${printer.name}::${printer.deviceId}` : printer.name) && (
                          <Check className="w-4 h-4 text-blue-500" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
                placeholder="Rechercher un participant..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Select all / deselect */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {selectedRegistrations.size} sélectionné(s) / {filteredRegistrations.length}
              </span>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-blue-600 dark:text-blue-400 hover:underline">
                  Tout sélectionner
                </button>
                <button onClick={deselectAll} className="text-gray-500 dark:text-gray-400 hover:underline">
                  Désélectionner
                </button>
              </div>
            </div>
          </div>

          {/* Registration list */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
            {filteredRegistrations.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                Aucun participant trouvé
              </div>
            ) : (
              filteredRegistrations.map((reg) => {
                const isSelected = selectedRegistrations.has(reg.id)
                const name = `${reg.attendee?.firstName || ''} ${reg.attendee?.lastName || ''}`.trim()
                return (
                  <label
                    key={reg.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRegistration(reg.id)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {name || 'Sans nom'}
                      </p>
                      {reg.attendee?.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {reg.attendee.email}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })
            )}
          </div>

          {/* Print button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleBatchPrint}
              disabled={selectedRegistrations.size === 0 || !selectedPrinter || isBatchPrinting}
              className="w-full"
            >
              {isBatchPrinting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer {selectedRegistrations.size > 0 ? `(${selectedRegistrations.size})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
