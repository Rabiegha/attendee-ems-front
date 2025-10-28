import React, { useState, useRef } from 'react'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
} from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // ← Stocker le fichier
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

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
      setPreview(parsedData.slice(0, 5)) // Aperçu des 5 premières lignes
      setStep('preview')
    } catch (error) {
      console.error('Error parsing Excel:', error)
      toast.error('Erreur', 'Impossible de lire le fichier Excel')
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Erreur', 'Aucun fichier sélectionné')
      return
    }

    setIsProcessing(true)

    try {
      // Appel API avec le fichier Excel
      const result = await importExcelRegistrations({
        eventId,
        file: selectedFile,
        autoApprove: true, // Vous pouvez ajouter une option dans l'UI pour cela
      }).unwrap()

      setImportResult(result)
      setStep('success')

      // Callback pour rafraîchir la liste (invalidation RTK Query automatique)
      if (onImportSuccess) {
        onImportSuccess(result)
      }

      toast.success(
        'Import réussi !',
        `${result.summary.created} créées, ${result.summary.updated} mises à jour, ${result.summary.skipped} ignorées`
      )
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
    setStep('upload')
    setImportResult(null)
    onClose()
  }

  const downloadTemplate = () => {
    // Créer un fichier Excel template
    const templateData = [
      ['prénom', 'nom', 'email', 'téléphone', 'entreprise', 'poste'],
      [
        'Jean',
        'Dupont',
        'jean.dupont@example.com',
        '0612345678',
        'ACME Corp',
        'Directeur',
      ],
      [
        'Marie',
        'Martin',
        'marie.martin@example.com',
        '0698765432',
        'TechStart',
        'Manager',
      ],
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
                Aperçu des données (5 premières lignes) :
              </h4>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
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
                        {headers.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap"
                          >
                            {row[header]?.toString() || (
                              <span className="text-gray-400 dark:text-gray-500">
                                null
                              </span>
                            )}
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
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-2">
                    Erreurs rencontrées ({importResult.summary.errors.length}) :
                  </h4>
                  <ul className="text-sm text-red-800 dark:text-red-300 space-y-1 max-h-48 overflow-y-auto">
                    {importResult.summary.errors.map(
                      (error: any, index: number) => (
                        <li key={index}>
                          • Ligne {error.row}: {error.error}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            <div className="flex justify-end">
              <Button onClick={handleClose}>Fermer</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
