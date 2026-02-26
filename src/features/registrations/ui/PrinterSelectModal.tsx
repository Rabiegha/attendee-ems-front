import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { Printer, Check, Loader2, Wifi, WifiOff } from 'lucide-react'
import {
  useGetExposedPrintersQuery,
  useGetEmsClientStatusQuery,
  type ExposedPrinter,
} from '@/features/print-queue/api/printQueueApi'

interface PrinterSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (printerName: string) => void
  isSubmitting?: boolean
  attendeeName?: string
}

export function PrinterSelectModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  attendeeName,
}: PrinterSelectModalProps) {
  const { t } = useTranslation(['events', 'common'])
  const { data: exposedPrinters = [], isLoading: isLoadingPrinters } = useGetExposedPrintersQuery(undefined, {
    pollingInterval: 10000,
  })
  const { data: clientStatus } = useGetEmsClientStatusQuery(undefined, {
    pollingInterval: 10000,
  })

  const [selectedPrinter, setSelectedPrinter] = useState<string>('')

  // Auto-select default printer on mount / when printers change
  useEffect(() => {
    if (isOpen && !selectedPrinter && exposedPrinters.length > 0) {
      const defaultPrinter = exposedPrinters.find((p) => p.isDefault) ?? exposedPrinters[0]
      const compositeName = defaultPrinter.deviceId
        ? `${defaultPrinter.name}::${defaultPrinter.deviceId}`
        : defaultPrinter.name
      setSelectedPrinter(compositeName)
    }
  }, [isOpen, exposedPrinters, selectedPrinter])

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPrinter('')
    }
  }, [isOpen])

  const isClientConnected = clientStatus?.connected === true

  const getPrinterStatusColor = (printer: ExposedPrinter) => {
    if (printer.status === 0 || printer.status === 3) return 'bg-green-500'
    if (printer.status === 4) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getPrinterStatusText = (printer: ExposedPrinter) => {
    if (printer.status === 0 || printer.status === 3) return t('events:registrations.printer_ready')
    if (printer.status === 4) return t('events:registrations.printer_busy')
    return t('events:registrations.printer_error')
  }

  const getCompositeKey = (printer: ExposedPrinter) =>
    printer.deviceId ? `${printer.name}::${printer.deviceId}` : printer.name

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('events:registrations.select_printer_title')} maxWidth="md">
      <div className="space-y-4">
        {/* Attendee name */}
        {attendeeName && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('events:registrations.printing_badge_for', { name: attendeeName })}
          </p>
        )}

        {/* Client status */}
        <div className="flex items-center gap-2 text-sm">
          {isClientConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">{t('events:registrations.print_client_connected')}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-red-600 dark:text-red-400">{t('events:registrations.print_client_disconnected')}</span>
            </>
          )}
        </div>

        {/* Printer list */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('events:registrations.available_printers')}
          </label>

          {isLoadingPrinters ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : exposedPrinters.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Printer className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('events:registrations.no_printers_available')}</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {exposedPrinters.map((printer) => {
                const compositeKey = getCompositeKey(printer)
                const isSelected = selectedPrinter === compositeKey

                return (
                  <button
                    key={compositeKey}
                    onClick={() => setSelectedPrinter(compositeKey)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Printer className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {printer.displayName}
                          {printer.isDefault && (
                            <span className="ml-2 text-xs text-blue-500 dark:text-blue-400 font-normal">
                              ({t('events:registrations.default_printer')})
                            </span>
                          )}
                        </div>
                        {printer.deviceId && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{printer.deviceId}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${getPrinterStatusColor(printer)}`} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{getPrinterStatusText(printer)}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('common:cancel')}
          </Button>
          <Button
            onClick={() => selectedPrinter && onConfirm(selectedPrinter)}
            disabled={!selectedPrinter || !isClientConnected || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t('events:registrations.sending_to_printer')}
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                {t('events:registrations.print_button')}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
