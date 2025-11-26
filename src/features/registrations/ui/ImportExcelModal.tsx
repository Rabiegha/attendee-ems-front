import React, { useState, useRef } from 'react'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  Trash2,
} from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { ModalSteps } from '@/shared/ui/ModalSteps'
import * as XLSX from 'xlsx'
import { useToast } from '@/shared/hooks/useToast'
import { useImportExcelRegistrationsMutation } from '../api/registrationsApi'

interface ImportExcelModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  onImportSuccess?: (data: any) => void // ← Callback optionnel pour rafraîchir la liste
}

interface ParsedRow {
  [key: string]: any
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
  const [step, setStep] = useState<'upload' | 'preview' | 'conflicts' | 'success'>('upload')
  const [importResult, setImportResult] = useState<any | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // ← Stocker le fichier
  const [conflicts, setConflicts] = useState<any[]>([]) // ← Doublons détectés
  const [selectedConflicts, setSelectedConflicts] = useState<Set<number>>(new Set()) // ← Lignes à remplacer
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  // Mapper les étapes à des numéros pour l'animation
  const getStepNumber = (stepName: 'upload' | 'preview' | 'conflicts' | 'success'): number => {
    const stepMap = { upload: 0, preview: 1, conflicts: 2, success: 3 }
    return stepMap[stepName]
  }

  // Mutation API pour l'import Excel
  const [importExcelRegistrations, { isLoading: isImporting }] =
    useImportExcelRegistrationsMutation()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
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
      setAllData(parsedData) // Stocker toutes les données
      setPreview(parsedData) // Aperçu de toutes les lignes
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
      // Générer un nouveau fichier Excel à partir de allData (qui contient les suppressions)
      const ws = XLSX.utils.json_to_sheet(allData, { header: headers })
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Import')
      const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const fileToImport = new File([blob], 'import.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      // Premier import SANS remplacer les doublons pour détecter les conflits
      const result = await importExcelRegistrations({
        eventId,
        file: fileToImport,
        autoApprove: true,
        replaceExisting: false, // ← Ne pas remplacer au premier passage
      }).unwrap()

      // Vérifier s'il y a des doublons détectés
      const duplicateErrors = result.summary.errors?.filter(
        (e: any) => 
          e.error?.toLowerCase().includes('already registered') || 
          e.error?.toLowerCase().includes('previously deleted')
      ) || []

      if (duplicateErrors.length > 0) {
        // Il y a des doublons → Afficher l'étape de résolution de conflits
        setConflicts(duplicateErrors)
        setStep('conflicts')
        
        const deletedCount = duplicateErrors.filter((e: any) => e.error?.toLowerCase().includes('previously deleted')).length
        const existingCount = duplicateErrors.length - deletedCount
        
        let message = ''
        if (existingCount > 0) message += `${existingCount} inscription(s) existent déjà. `
        if (deletedCount > 0) message += `${deletedCount} inscription(s) sont dans la corbeille. `
        message += 'Choisissez lesquelles remplacer/restaurer.'

        toast.info('Conflits détectés', message)
      } else {
        // Pas de doublons → Succès direct
        setImportResult(result)
        setStep('success')

        if (onImportSuccess) {
          onImportSuccess(result)
        }

        const { created, updated, skipped, errors } = result.summary
        
        if (errors && errors.length > 0) {
          toast.warning(
            'Import terminé avec des erreurs',
            `${created} créées, ${updated} mises à jour, ${skipped} ignorées. ${errors.length} erreur(s) détectée(s).`
          )
        } else {
          toast.success(
            'Import réussi !',
            `${created} créées, ${updated} mises à jour, ${skipped} ignorées`
          )
        }
      }
    } catch (error: any) {
      console.error('Import error:', error)

      // Erreur 404 = endpoint non implémenté
      if (error?.status === 404) {
        toast.error(
          'Fonctionnalité en cours de développement',
          "L'endpoint d'import Excel backend n'est pas encore activé. Contactez l'administrateur."
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
    setSelectedFile(null)
    setConflicts([])
    setSelectedConflicts(new Set())
    setStep('upload')
    setImportResult(null)
    onClose()
  }

  const handleApplyReplacements = async () => {
    if (selectedConflicts.size === 0) {
      // Aucune ligne sélectionnée → Terminer sans remplacer
      toast.info('Import terminé', 'Aucun doublon remplacé')
      setStep('success')
      return
    }

    setIsProcessing(true)

    try {
      // Récupérer les emails des conflits sélectionnés
      const emailsToReplace = Array.from(selectedConflicts).map(
        (index) => conflicts[index].email
      )

      // Filtrer allData pour ne garder que les lignes sélectionnées
      const filteredData = allData.filter((row) => {
        const rowEmail = Object.keys(row).find((key) =>
          ['email', 'Email', 'E-mail', 'e-mail', 'mail'].includes(key)
        )
        return rowEmail && emailsToReplace.includes(String(row[rowEmail]).toLowerCase().trim())
      })

      console.log(`Filtered ${filteredData.length} rows for replacement out of ${allData.length} total rows.`);

      // Créer un nouveau fichier Excel avec seulement ces lignes
      const ws = XLSX.utils.json_to_sheet(filteredData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Replacements')
      const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const replacementFile = new File([blob], 'replacements.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      console.log('Sending replacement file with replaceExisting=true');

      // Import avec replaceExisting=true
      const result = await importExcelRegistrations({
        eventId,
        file: replacementFile,
        autoApprove: true,
        replaceExisting: true,
      }).unwrap()

      setImportResult(result)
      setStep('success')

      if (onImportSuccess) {
        onImportSuccess(result)
      }

      toast.success(
        'Remplacements appliqués !',
        `${selectedConflicts.size} inscription(s) mise(s) à jour`
      )
    } catch (error: any) {
      console.error('Replacement error:', error)
      toast.error('Erreur', 'Échec du remplacement des doublons')
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleConflictSelection = (index: number) => {
    const newSelection = new Set(selectedConflicts)
    if (newSelection.has(index)) {
      newSelection.delete(index)
    } else {
      newSelection.add(index)
    }
    setSelectedConflicts(newSelection)
  }

  const selectAllConflicts = () => {
    setSelectedConflicts(new Set(conflicts.map((_, i) => i)))
  }

  const deselectAllConflicts = () => {
    setSelectedConflicts(new Set())
  }

  const downloadTemplate = () => {
    // Créer un fichier Excel template
    const templateData = [
      ['prénom', 'nom', 'email', 'téléphone', 'entreprise', 'poste', 'pays', 'mode'],
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inscriptions')
    XLSX.writeFile(wb, 'template_inscriptions.xlsx')
  }

  const handleRemoveRow = (indexToRemove: number) => {
    const newData = allData.filter((_, index) => index !== indexToRemove)
    setAllData(newData)
    setPreview(newData)
  }

  const handleCellChange = (rowIndex: number, header: string, value: string) => {
    const newData = [...allData]
    newData[rowIndex] = {
      ...newData[rowIndex],
      [header]: value
    }
    setAllData(newData)
    setPreview(newData)
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
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-200">
                    Fichier analysé avec succès
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                    {allData.length} inscriptions détectées •{' '}
                    {Object.keys(columnMapping).length} colonnes reconnues
                    automatiquement
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Aperçu des données ({preview.length} lignes) :
              </h4>
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16 min-w-[64px]">
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
                    {preview.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          <button
                            onClick={() => handleRemoveRow(rowIndex)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="Supprimer cette ligne"
                          >
                            <Trash2 className="h-5 w-5 min-w-[20px] min-h-[20px]" />
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
                    ))}
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
                {isProcessing || isImporting
                  ? 'Import en cours...'
                  : `Importer ${allData.length} inscriptions`}
              </Button>
            </div>
          </>
        )}

        {/* Nouvelle étape : Résolution des conflits */}
        {step === 'conflicts' && (
          <>
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                      {conflicts.length} conflit(s) détecté(s)
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                      Certaines inscriptions existent déjà ou sont dans la corbeille. Sélectionnez celles que vous souhaitez remplacer ou restaurer.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions groupées */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedConflicts.size} / {conflicts.length} sélectionné(s)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllConflicts}
                  >
                    Tout sélectionner
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deselectAllConflicts}
                  >
                    Tout désélectionner
                  </Button>
                </div>
              </div>

              {/* Liste des conflits */}
              <div className="max-h-96 overflow-y-auto space-y-3">
                {conflicts.map((conflict: any, index: number) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedConflicts.has(index)
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedConflicts.has(index)}
                        onChange={() => toggleConflictSelection(index)}
                        className="mt-1 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {conflict.email}
                          </span>
                          {conflict.error?.toLowerCase().includes('previously deleted') ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                              Supprimé (Corbeille)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                              Déjà inscrit
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Ligne {conflict.row} • {conflict.error?.toLowerCase().includes('previously deleted') ? 'Sera restauré et mis à jour' : 'Sera remplacé par les nouvelles données'}
                        </p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('success')
                  toast.info('Import terminé', 'Conflits ignorés')
                }}
              >
                Ignorer les conflits
              </Button>
              <Button
                onClick={handleApplyReplacements}
                disabled={isProcessing || selectedConflicts.size === 0}
              >
                {isProcessing
                  ? 'Traitement en cours...'
                  : `Remplacer/Restaurer ${selectedConflicts.size} inscription(s)`}
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Import terminé !
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {importResult.summary.created} créées •{' '}
                {importResult.summary.updated} mises à jour •{' '}
                {importResult.summary.skipped} ignorées
              </p>
            </div>

            {importResult.summary.errors &&
              importResult.summary.errors.length > 0 && (
                <div className="space-y-4">
                  {/* Compteur d'erreurs par type */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Résumé des problèmes ({importResult.summary.errors.length})
                    </h4>
                    <div className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                      {(() => {
                        const duplicates = importResult.summary.errors.filter(
                          (e: any) => e.error?.includes('already registered')
                        ).length
                        const refused = importResult.summary.errors.filter(
                          (e: any) => e.error?.includes('declined')
                        ).length
                        const other = importResult.summary.errors.length - duplicates - refused

                        return (
                          <>
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
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-2">
                      Détail des erreurs :
                    </h4>
                    <ul className="text-sm text-red-800 dark:text-red-300 space-y-1 max-h-48 overflow-y-auto">
                      {importResult.summary.errors.map(
                        (error: any, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="font-mono text-xs bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded mr-2">
                              L{error.row}
                            </span>
                            <span className="flex-1">
                              {error.email && (
                                <span className="font-medium">{error.email} : </span>
                              )}
                              {error.error}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
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
