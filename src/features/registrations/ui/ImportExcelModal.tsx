import React, { useState, useRef, useEffect } from 'react'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  Trash2,
  AlertTriangle,
  XCircle,
  Info,
} from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { ModalSteps } from '@/shared/ui/ModalSteps'
import * as XLSX from 'xlsx'
import { useToast } from '@/shared/hooks/useToast'
import { useImportExcelRegistrationsMutation, useGetRegistrationsQuery } from '../api/registrationsApi'
import { useGetEventByIdQuery } from '@/features/events/api/eventsApi'

interface ImportExcelModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  onImportSuccess?: (data: any) => void // ← Callback optionnel pour rafraîchir la liste
}

interface ParsedRow {
  [key: string]: any
  _rowIndex?: number // Index de la ligne dans le fichier Excel
  _conflictType?: 'duplicate' | 'capacity' | 'deleted' | null // Type de conflit
  _existingData?: any // Données existantes si conflit
  _selected?: boolean // Sélectionné pour remplacement
}

// Mapping des colonnes possibles (insensible à la casse et aux accents)
const COLUMN_MAPPINGS: Record<string, string[]> = {
  firstName: ['prénom', 'prenom', 'first_name', 'firstname', 'first name'],
  lastName: ['nom', 'last_name', 'lastname', 'last name', 'nom de famille'],
  email: ['email', 'e-mail', 'mail', 'courriel'],
  phone: ['téléphone', 'telephone', 'phone', 'tel', 'mobile', 'portable'],
  company: ['entreprise', 'company', 'société', 'societe', 'organization'],
  jobTitle: [
    'poste',
    'job_title',
    'jobtitle',
    'job title',
    'fonction',
    'titre',
  ],
  country: ['pays', 'country', 'nation', 'state'],
  attendanceType: ['mode', 'attendance_type', 'type', 'participation', 'attendance'],
}

function normalizeColumnName(colName: string): string {
  return colName
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}

  headers.forEach((header) => {
    const normalized = normalizeColumnName(header)

    for (const [targetField, variants] of Object.entries(COLUMN_MAPPINGS)) {
      if (
        variants.some((variant) => normalizeColumnName(variant) === normalized)
      ) {
        mapping[header] = targetField
        break
      }
    }
  })

  return mapping
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  eventId,
  onImportSuccess,
}) => {
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [allData, setAllData] = useState<ParsedRow[]>([]) // Toutes les données du fichier
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload')
  const [importResult, setImportResult] = useState<any | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  // Récupérer les données de l'événement et les inscriptions existantes (y compris supprimées)
  const { data: eventData } = useGetEventByIdQuery(eventId, { skip: !isOpen })
  const { data: existingRegistrationsData } = useGetRegistrationsQuery(
    { eventId, page: 1, limit: 10000 }, // Retirer isActive pour obtenir toutes les inscriptions
    { skip: !isOpen }
  )

  // Mapper les étapes à des numéros pour l'animation
  const getStepNumber = (stepName: 'upload' | 'preview' | 'success'): number => {
    const stepMap = { upload: 0, preview: 1, success: 2 }
    return stepMap[stepName]
  }

  // Mutation API pour l'import Excel
  const [importExcelRegistrations, { isLoading: isImporting }] =
    useImportExcelRegistrationsMutation()

  // Fonction pour extraire l'email d'une ligne
  const getEmailFromRow = (row: ParsedRow): string | null => {
    const emailKey = Object.keys(row).find((key) =>
      ['email', 'Email', 'E-mail', 'e-mail', 'mail'].includes(key)
    )
    return emailKey ? String(row[emailKey]).toLowerCase().trim() : null
  }

  // Détecter les conflits après parsing du fichier
  const detectConflicts = (parsedData: ParsedRow[]) => {
    if (!eventData || !existingRegistrationsData) {
      return parsedData
    }

    const capacity = eventData.capacity
    const currentApprovedCount = existingRegistrationsData.meta.statusCounts.approved || 0
    const existingEmails = new Set(
      existingRegistrationsData.data
        .filter((reg) => reg.deletedAt === null) // Actifs uniquement
        .map((reg) => reg.attendee?.email?.toLowerCase().trim())
    )
    const deletedEmails = new Set(
      existingRegistrationsData.data
        .filter((reg) => reg.deletedAt !== null) // Soft deleted
        .map((reg) => reg.attendee?.email?.toLowerCase().trim())
    )

    let availableSpots = capacity ? capacity - currentApprovedCount : Infinity
    
    return parsedData.map((row, index) => {
      const email = getEmailFromRow(row)
      
      if (!email) {
        return { ...row, _rowIndex: index, _conflictType: null }
      }

      // Vérifier si email existe dans les soft-deleted
      if (deletedEmails.has(email)) {
        const existingReg = existingRegistrationsData.data.find(
          (r) => r.attendee?.email?.toLowerCase().trim() === email && r.deletedAt !== null
        )
        return {
          ...row,
          _rowIndex: index,
          _conflictType: 'deleted' as const,
          _existingData: existingReg,
          _selected: false,
        }
      }

      // Vérifier si email existe déjà (actif)
      if (existingEmails.has(email)) {
        const existingReg = existingRegistrationsData.data.find(
          (r) => r.attendee?.email?.toLowerCase().trim() === email && r.deletedAt === null
        )
        return {
          ...row,
          _rowIndex: index,
          _conflictType: 'duplicate' as const,
          _existingData: existingReg,
          _selected: false,
        }
      }

      // Toutes les nouvelles inscriptions : pas de conflit, non sélectionnées par défaut
      return { ...row, _rowIndex: index, _conflictType: null, _selected: false }
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    parseExcelFile(file)
  }

  const parseExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        toast.error('Erreur', 'Le fichier Excel ne contient aucune feuille')
        return
      }
      const firstSheet = workbook.Sheets[sheetName]
      if (!firstSheet) {
        toast.error('Erreur', 'Impossible de lire la feuille Excel')
        return
      }
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
      }) as any[][]

      if (jsonData.length === 0) {
        toast.error('Erreur', 'Le fichier Excel est vide')
        return
      }

      // Première ligne = headers
      const headerRow = jsonData[0] as string[]
      const dataRows = jsonData.slice(1)

      // Auto-détection des colonnes
      const detectedMapping = detectColumnMapping(headerRow)

      // Conversion en objets
      const parsedData: ParsedRow[] = dataRows
        .filter((row) =>
          row.some((cell) => cell !== null && cell !== undefined && cell !== '')
        )
        .map((row) => {
          const obj: ParsedRow = {}
          headerRow.forEach((header, index) => {
            const value = row[index]
            obj[header] = value !== null && value !== undefined ? value : null
          })
          return obj
        })

      setHeaders(headerRow)
      setColumnMapping(detectedMapping)
      
      // Détecter les conflits immédiatement
      const dataWithConflicts = detectConflicts(parsedData)
      setAllData(dataWithConflicts)
      setPreview(dataWithConflicts)
      setStep('preview')
    } catch (error) {
      console.error('Error parsing Excel:', error)
      toast.error('Erreur', 'Impossible de lire le fichier Excel')
    }
  }

  const handleImport = async () => {
    if (allData.length === 0) {
      toast.error('Erreur', 'Aucune donnée à importer')
      return
    }

    setIsProcessing(true)

    try {
      // Séparer les lignes selon leur type (toutes doivent être sélectionnées)
      const normalRows = allData.filter((row) => !row._conflictType && row._selected)
      const duplicateRows = allData.filter(
        (row) => row._conflictType === 'duplicate' && row._selected
      )
      const deletedRows = allData.filter(
        (row) => row._conflictType === 'deleted' && row._selected
      )
      const capacityRows = allData.filter((row) => row._conflictType === 'capacity' && row._selected)
      const capacityRowsNotSelected = allData.filter((row) => row._conflictType === 'capacity' && !row._selected)

      // Combiner les lignes à importer (toutes sélectionnées)
      const rowsToImport = [...normalRows, ...duplicateRows, ...deletedRows, ...capacityRows]

      if (rowsToImport.length === 0) {
        toast.error('Erreur', 'Aucune ligne sélectionnée pour l\'import')
        setIsProcessing(false)
        return
      }

      // Nettoyer les métadonnées internes avant l'export
      const cleanedData = rowsToImport.map((row) => {
        const { _rowIndex, _conflictType, _existingData, _selected, ...cleanRow } = row
        return cleanRow
      })

      // Générer un fichier Excel
      const ws = XLSX.utils.json_to_sheet(cleanedData, { header: headers })
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Import')
      const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const fileToImport = new File([blob], 'import.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      // Import avec replaceExisting=true pour gérer les doublons et restaurations
      const result = await importExcelRegistrations({
        eventId,
        file: fileToImport,
        autoApprove: true,
        replaceExisting: true,
      }).unwrap()

      setImportResult(result)
      setStep('success')

      if (onImportSuccess) {
        onImportSuccess(result)
      }

      const { created, updated, skipped, errors } = result.summary
      const restored = (result.summary as any).restored || 0
      
      const conflictsIgnored = capacityRowsNotSelected.length + 
        allData.filter((row) => !row._selected).length

      if (errors && errors.length > 0) {
        toast.warning(
          'Import terminé avec des avertissements',
          `${created} créées, ${updated} màj, ${restored} restaurées, ${skipped} ignorées${conflictsIgnored > 0 ? `, ${conflictsIgnored} conflits non résolus` : ''}`
        )
      } else {
        toast.success(
          'Import réussi !',
          `${created} créées, ${updated} màj, ${restored} restaurées${conflictsIgnored > 0 ? `, ${conflictsIgnored} conflits ignorés` : ''}`
        )
      }
    } catch (error: any) {
      console.error('Import error:', error)

      if (error?.status === 404) {
        toast.error(
          'Fonctionnalité en cours de développement',
          "L'endpoint d'import Excel backend n'est pas encore activé."
        )
      } else {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Échec de l'import des inscriptions"
        toast.error('Erreur', errorMessage)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setPreview([])
    setAllData([])
    setHeaders([])
    setColumnMapping({})
    setStep('upload')
    setImportResult(null)
    onClose()
  }

  const handleRemoveRow = (indexToRemove: number) => {
    const newData = allData.filter((_, index) => index !== indexToRemove)
    // Recalculer les conflits après suppression
    const dataWithConflicts = detectConflicts(newData)
    setAllData(dataWithConflicts)
    setPreview(dataWithConflicts)
  }

  const handleCellChange = (rowIndex: number, header: string, value: string) => {
    const newData = [...allData]
    newData[rowIndex] = {
      ...newData[rowIndex],
      [header]: value,
    }
    // Recalculer les conflits après modification (surtout si email changé)
    const dataWithConflicts = detectConflicts(newData)
    setAllData(dataWithConflicts)
    setPreview(dataWithConflicts)
  }

  const toggleRowSelection = (rowIndex: number, shiftKey: boolean = false) => {
    const newData = [...allData]
    
    if (!newData[rowIndex]) return
    
    // Si Shift est pressé et qu'il y a un dernier index cliqué, sélectionner la plage
    if (shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, rowIndex)
      const end = Math.max(lastClickedIndex, rowIndex)
      const newSelectionState = !newData[rowIndex]._selected
      
      // Sélectionner/désélectionner toute la plage
      for (let i = start; i <= end; i++) {
        if (newData[i]) {
          newData[i] = {
            ...newData[i],
            _selected: newSelectionState,
          }
        }
      }
    } else {
      // Comportement normal : toggle une seule ligne
      newData[rowIndex] = {
        ...newData[rowIndex],
        _selected: !newData[rowIndex]._selected,
      }
    }
    
    // Mettre à jour le dernier index cliqué
    setLastClickedIndex(rowIndex)
    
    // Recalculer les sélections en fonction de la capacité disponible
    const recalculatedData = recalculateSelections(newData)
    setAllData(recalculatedData)
    setPreview(recalculatedData)
  }

  // Recalculer dynamiquement le type de conflit selon les sélections et la capacité
  const recalculateSelections = (data: ParsedRow[]) => {
    if (!eventData || !existingRegistrationsData) {
      return data
    }

    const capacity = eventData.capacity
    // Compter UNIQUEMENT les inscriptions actives (non supprimées)
    const currentApprovedCount = existingRegistrationsData.data.filter(
      (reg) => reg.deletedAt === null && reg.status === 'approved'
    ).length
    const availableSpots = capacity ? capacity - currentApprovedCount : Infinity

    // Sauvegarder les types originaux avant modification (detectConflicts)
    const deletedEmails = new Set(
      existingRegistrationsData.data
        .filter((reg) => reg.deletedAt !== null)
        .map((reg) => reg.attendee?.email?.toLowerCase().trim())
    )
    
    const existingEmails = new Set(
      existingRegistrationsData.data
        .filter((reg) => reg.deletedAt === null)
        .map((reg) => reg.attendee?.email?.toLowerCase().trim())
    )

    // Compter les nouvelles inscriptions ET les restaurations sélectionnées
    // Les deux consomment des places, seuls les doublons ne consomment pas de places (ils remplacent)
    let selectedCount = 0

    return data.map((row) => {
      const email = getEmailFromRow(row)
      const isDeleted = email ? deletedEmails.has(email) : false
      const isDuplicate = email ? existingEmails.has(email) : false

      // Les doublons ne consomment pas de places - toujours jaunes
      if (isDuplicate) {
        return { ...row, _conflictType: 'duplicate' as const }
      }

      // Pour les nouvelles inscriptions ET les restaurations
      if (row._selected) {
        selectedCount++
        // Vérifier si cette sélection est dans la limite des places disponibles
        if (selectedCount <= availableSpots) {
          // Dans la capacité → garder le type original
          if (isDeleted) {
            return { ...row, _conflictType: 'deleted' as const }
          }
          return { ...row, _conflictType: null }
        } else {
          // Hors capacité → marquer comme capacity (rouge)
          return { ...row, _conflictType: 'capacity' as const }
        }
      } else {
        // Non sélectionnée → remettre le type original
        if (isDeleted) {
          return { ...row, _conflictType: 'deleted' as const }
        }
        return { ...row, _conflictType: null }
      }
    })
  }

  const selectAllConflicts = () => {
    const newData = allData.map((row) => {
      return { ...row, _selected: true }
    })
    const recalculatedData = recalculateSelections(newData)
    setAllData(recalculatedData)
    setPreview(recalculatedData)
  }

  const deselectAllConflicts = () => {
    const newData = allData.map((row) => {
      return { ...row, _selected: false }
    })
    const recalculatedData = recalculateSelections(newData)
    setAllData(recalculatedData)
    setPreview(recalculatedData)
  }

  const downloadTemplate = () => {
    const templateData = [
      ['prénom', 'nom', 'email', 'téléphone', 'entreprise', 'poste', 'pays', 'mode'],
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inscriptions')
    XLSX.writeFile(wb, 'template_inscriptions.xlsx')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importer des inscriptions (Excel)"
      maxWidth="4xl"
    >
      <ModalSteps currentStep={getStepNumber(step)}>
        <div className="space-y-6">
        {step === 'upload' && (
          <>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Sélectionnez un fichier Excel
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Format accepté : .xlsx, .xls. La première ligne doit contenir
                les noms des colonnes.
              </p>

              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="mb-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger un modèle
              </Button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Cliquez ou glissez-déposez votre fichier Excel ici
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Maximum 10 000 lignes
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                Colonnes reconnues automatiquement :
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>
                  • <strong>Nom</strong> : nom, last_name, lastname
                </li>
                <li>
                  • <strong>Prénom</strong> : prénom, prenom, first_name,
                  firstname
                </li>
                <li>
                  • <strong>Email</strong> : email, e-mail, mail
                </li>
                <li>
                  • <strong>Téléphone</strong> : téléphone, phone, tel, mobile
                </li>
                <li>
                  • <strong>Entreprise</strong> : entreprise, company, société
                </li>
                <li>
                  • <strong>Poste</strong> : poste, job_title, fonction
                </li>
                <li>
                  • <strong>Pays</strong> : pays, country
                </li>
                <li>
                  • <strong>Mode</strong> : mode, attendance_type (onsite/online)
                </li>
              </ul>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                Les colonnes non reconnues seront sauvegardées comme données
                supplémentaires
              </p>
            </div>
          </>
        )}

        {step === 'preview' && (
          <>
            {/* Résumé du fichier */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-200">
                    Fichier analysé avec succès
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                    {allData.length} inscriptions détectées •{' '}
                    {Object.keys(columnMapping).length} colonnes reconnues
                  </p>
                </div>
              </div>
            </div>

            {/* Légende des conflits */}
            {(() => {
              const duplicateCount = allData.filter(r => r._conflictType === 'duplicate').length
              const deletedCount = allData.filter(r => r._conflictType === 'deleted').length
              const capacityCount = allData.filter(r => r._conflictType === 'capacity').length
              // Compter TOUTES les lignes sélectionnées (nouvelles + restaurations) sauf doublons
              const selectedCount = allData.filter(r => r._selected && r._conflictType !== 'duplicate' && r._conflictType !== 'capacity').length
              const capacity = eventData?.capacity || 0
              // Compter UNIQUEMENT les inscriptions actives (non supprimées)
              const currentApprovedCount = existingRegistrationsData?.data.filter(
                (reg: any) => reg.deletedAt === null && reg.status === 'approved'
              ).length || 0
              const availableSpots = capacity ? capacity - currentApprovedCount : Infinity
              const remainingSpots = availableSpots - selectedCount

              return (
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                          Sélectionnez les inscriptions à importer
                        </h4>
                        <p className="text-xs text-blue-800 dark:text-blue-300 mb-3">
                          Places disponibles : {remainingSpots >= 0 ? remainingSpots : 0} / {availableSpots} • 
                          Capacité événement : {capacity} • Actuellement inscrits : {currentApprovedCount}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-50 dark:bg-green-700 border border-green-300 dark:border-green-500 rounded"></div>
                            <span className="text-blue-800 dark:text-blue-200">Sélectionnées ({selectedCount})</span>
                          </div>
                          {capacityCount > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-red-100 dark:bg-red-600 border border-red-300 dark:border-red-400 rounded"></div>
                              <span className="text-blue-800 dark:text-blue-200">Capacité dépassée ({capacityCount})</span>
                            </div>
                          )}
                          {duplicateCount > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-600 border border-yellow-400 dark:border-yellow-400 rounded"></div>
                              <span className="text-blue-800 dark:text-blue-200">{duplicateCount} Doublon(s)</span>
                            </div>
                          )}
                          {deletedCount > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-purple-100 dark:bg-purple-600 border border-purple-300 dark:border-purple-400 rounded"></div>
                              <span className="text-blue-800 dark:text-blue-200">{deletedCount} À restaurer</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="ghost" onClick={selectAllConflicts}>
                            Tout sélectionner
                          </Button>
                          <Button size="sm" variant="ghost" onClick={deselectAllConflicts}>
                            Tout désélectionner
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Tableau avec conflits inline */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Aperçu des données ({preview.length} lignes) :
              </h4>
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                        {/* Checkbox pour conflits */}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                        {/* Actions */}
                      </th>
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {header}
                          {columnMapping[header] && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                              → {columnMapping[header]}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {preview.map((row, rowIndex) => {
                      const conflictType = row._conflictType
                      let rowClass = ''
                      let icon = null
                      let tooltip = ''

                      if (conflictType === 'duplicate') {
                        rowClass = 'bg-yellow-100 dark:bg-yellow-600/30'
                        icon = <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-200" />
                        tooltip = 'Email déjà inscrit - Sélectionnez pour remplacer'
                      } else if (conflictType === 'deleted') {
                        rowClass = 'bg-purple-100 dark:bg-purple-600/30'
                        icon = <AlertTriangle className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                        tooltip = 'Inscription supprimée - Sélectionnez pour restaurer'
                      } else if (conflictType === 'capacity') {
                        // Capacité dépassée → rouge
                        rowClass = 'bg-red-100 dark:bg-red-600/30'
                        icon = <XCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
                        tooltip = 'Capacité dépassée - Décochez d\'autres lignes pour importer celle-ci'
                      } else {
                        // Nouvelle inscription : verte si sélectionnée, blanche sinon
                        if (row._selected) {
                          rowClass = 'bg-green-50 dark:bg-green-700/30'
                        } else {
                          rowClass = 'bg-white dark:bg-gray-900'
                        }
                      }

                      return (
                        <tr key={rowIndex} className={rowClass}>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={row._selected === true}
                              onChange={(e) => toggleRowSelection(rowIndex, (e.nativeEvent as MouseEvent).shiftKey)}
                              className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                              title={
                                conflictType === 'duplicate' 
                                  ? tooltip 
                                  : conflictType === 'deleted' 
                                    ? tooltip 
                                    : conflictType === 'capacity' 
                                      ? 'Sélection dépasse la capacité - Décochez d\'autres lignes' 
                                      : 'Sélectionner pour importer (Shift+clic pour sélection multiple)'
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            <button
                              onClick={() => handleRemoveRow(rowIndex)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Supprimer cette ligne"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                          {headers.map((header, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-2 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap"
                            >
                              <input
                                type="text"
                                value={row[header]?.toString() || ''}
                                onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                                className="w-full min-w-[100px] bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 transition-colors text-sm"
                                placeholder="-"
                              />
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {Object.keys(columnMapping).length === 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                      Aucune colonne standard détectée
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                      Les données seront importées telles quelles. Assurez-vous
                      que les noms de colonnes sont corrects.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Retour
              </Button>
              <Button
                onClick={handleImport}
                disabled={isProcessing || isImporting}
              >
                {isProcessing || isImporting ? (
                  'Import en cours...'
                ) : (
                  <span className="flex items-center gap-2">
                    Importer
                    {(() => {
                      const newCount = allData.filter(r => !r._conflictType && r._selected).length
                      const duplicateCount = allData.filter(r => r._conflictType === 'duplicate' && r._selected).length
                      const restoredCount = allData.filter(r => r._conflictType === 'deleted' && r._selected).length
                      const capacityCount = allData.filter(r => r._conflictType === 'capacity' && r._selected).length
                      const total = newCount + duplicateCount + restoredCount + capacityCount
                      
                      return (
                        <>
                          <span>{total}</span>
                          {newCount > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100">
                              {newCount}✓
                            </span>
                          )}
                          {duplicateCount > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100">
                              {duplicateCount}↻
                            </span>
                          )}
                          {restoredCount > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-600 dark:text-purple-100">
                              {restoredCount}⟲
                            </span>
                          )}
                          {capacityCount > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700 dark:bg-red-600 dark:text-red-100">
                              {capacityCount}!
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </span>
                )}
              </Button>
            </div>
          </>
        )}

        {step === 'success' && importResult && (
          <>
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Import terminé !
              </h3>
              
              <div className={`grid gap-4 mb-6 ${(importResult.summary as any).restored > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center border border-green-100 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {importResult.summary.created}
                  </div>
                  <div className="text-sm font-medium text-green-800 dark:text-green-300">
                    Ajoutés
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center border border-blue-100 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {importResult.summary.updated}
                  </div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Mis à jour
                  </div>
                </div>
                {(importResult.summary as any).restored > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center border border-purple-100 dark:border-purple-800">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {(importResult.summary as any).restored}
                    </div>
                    <div className="text-sm font-medium text-purple-800 dark:text-purple-300">
                      Restaurés
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {importResult.summary.skipped || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ignorés / Erreurs
                  </div>
                </div>
              </div>
            </div>

            {importResult.summary.errors &&
              importResult.summary.errors.length > 0 && (
                <div className="space-y-4">
                  {/* Compteur d'erreurs par type */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Détails des éléments non importés ({importResult.summary.errors.length})
                    </h4>
                    <div className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                      {(() => {
                        const duplicates = importResult.summary.errors.filter(
                          (e: any) => e.error?.includes('already registered')
                        ).length
                        const refused = importResult.summary.errors.filter(
                          (e: any) => e.error?.includes('declined')
                        ).length
                        const full = importResult.summary.errors.filter(
                          (e: any) => {
                            const err = e.error?.toLowerCase() || '';
                            return err.includes('event is full') || err.includes('capacity') || err.includes('complet');
                          }
                        ).length
                        const other = importResult.summary.errors.length - duplicates - refused - full

                        return (
                          <>
                            {full > 0 && (
                              <p className="font-medium text-red-600 dark:text-red-400">• {full} non ajouté(s) : événement complet</p>
                            )}
                            {duplicates > 0 && (
                              <p>• {duplicates} doublon(s) : déjà inscrits à cet événement</p>
                            )}
                            {refused > 0 && (
                              <p>• {refused} refusé(s) : précédemment déclinés</p>
                            )}
                            {other > 0 && (
                              <p>• {other} autre(s) erreur(s)</p>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Liste détaillée des erreurs */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Liste des inscriptions non importées
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {importResult.summary.errors.length} erreur(s)
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                              Ligne
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Email / Identifiant
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Raison
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {importResult.summary.errors.map((error: any, index: number) => {
                            let frenchError = error.error;
                            const errLower = error.error?.toLowerCase() || '';
                            let badgeColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                            
                            if (errLower.includes('event is full') || errLower.includes('capacity')) {
                              frenchError = 'Événement complet';
                              badgeColor = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
                            }
                            else if (errLower.includes('already registered')) {
                              frenchError = 'Déjà inscrit';
                              badgeColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
                            }
                            else if (errLower.includes('declined')) {
                              frenchError = 'Précédemment refusé';
                              badgeColor = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
                            }
                            else if (errLower.includes('soft delete')) {
                              frenchError = 'Dans la corbeille';
                              badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
                            }
                            else if (errLower.includes('email is required')) {
                              frenchError = 'Email manquant';
                              badgeColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                            }

                            return (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-mono">
                                  {error.row}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {error.email && error.email !== 'N/A' ? error.email : <span className="italic text-gray-400">Non spécifié</span>}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                                    {frenchError}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            <div className="flex justify-end">
              <Button onClick={handleClose}>Fermer</Button>
            </div>
          </>
        )}
        </div>
      </ModalSteps>
    </Modal>
  )
}
