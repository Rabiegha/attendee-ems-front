import React from 'react'
import { Download, MonitorCheck, Apple, CheckCircle, Info } from 'lucide-react'
import { PageContainer, PageHeader, PageSection } from '@/shared/ui'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'

export const PrintClientDownloadPage: React.FC = () => {
  // URLs de téléchargement (à adapter selon votre hébergement)
  const windowsUrl = '/downloads/Attendee-Print-Client-1.0.0-win32-x64.zip'
  const macUrl = '/downloads/Attendee-Print-Client-1.0.0.dmg'
  
  const features = [
    'Impression automatique de badges',
    'Polling de la queue d\'impression',
    'Ghostscript intégré (pas d\'installation manuelle)',
    'Support Windows et macOS',
    'Formats de badge dynamiques',
    'System tray avec statuts en temps réel',
  ]

  const printers = [
    'EPSON CW-C4000e',
    'EPSON TM-C3500',
    'Zebra ZD420',
    'Brother QL-820NWB',
    'Dymo LabelWriter 550',
    'Et autres imprimantes compatibles CUPS',
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Client d'Impression"
        description="Téléchargez le client d'impression automatique pour vos badges d'événements."
        icon={MonitorCheck}
      />

      <PageSection spacing="lg">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  À propos du client d'impression
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  Le client d'impression Attendee remplace PrintNode et permet d'imprimer vos badges 
                  automatiquement depuis votre ordinateur. Il surveille la queue d'impression en temps réel 
                  et respecte toutes les préférences de votre imprimante (auto-cut, détection de marques, format personnalisé, etc.).
                </p>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed mt-2">
                  <strong>Tout inclus</strong> - Impression 100% silencieuse avec respect total des paramètres du driver Windows (auto-cut, détection de marque, format personnalisé). Aucune dépendance externe requise !
                </p>
              </div>
            </div>
          </div>

          {/* Cartes de téléchargement */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Windows */}
            <Card variant="default" padding="xl" className="shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <MonitorCheck className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Windows
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Windows 10 / 11 (64-bit)
                  </p>
                </div>
                <div className="w-full space-y-3">
                  <a
                    href={windowsUrl}
                    download="Attendee-Print-Client-1.0.0-win32-x64.zip"
                    className="block"
                    onClick={(e) => {
                      e.preventDefault()
                      const link = document.createElement('a')
                      link.href = windowsUrl
                      link.download = 'Attendee-Print-Client-1.0.0-win32-x64.zip'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    <Button
                      type="button"
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Télécharger (.zip)
                    </Button>
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Version 1.0.0 • ~190 MB
                  </p>
                </div>
              </div>
            </Card>

            {/* macOS */}
            <Card variant="default" padding="xl" className="shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl shadow-lg">
                  <Apple className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    macOS
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    macOS 11 Big Sur ou supérieur
                  </p>
                </div>
                <div className="w-full space-y-3">
                  <a
                    href={macUrl}
                    download="Attendee-Print-Client-1.0.0.dmg"
                    className="block"
                    onClick={(e) => {
                      e.preventDefault()
                      const link = document.createElement('a')
                      link.href = macUrl
                      link.download = 'Attendee-Print-Client-1.0.0.dmg'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    <Button
                      type="button"
                      className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Télécharger (.dmg)
                    </Button>
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Version 1.0.0 • ~120 MB
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Instructions d'installation */}
          <Card variant="default" padding="xl" className="shadow-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Instructions d'installation
            </h3>
            
            {/* Windows */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MonitorCheck className="h-5 w-5 text-blue-600" />
                Windows
              </h4>
              <ol className="space-y-2 ml-7">
                <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-blue-600">1.</span>
                  Téléchargez le fichier <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm">.zip</code>
                </li>
                <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-blue-600">2.</span>
                  Extrayez l'archive ZIP dans un dossier de votre choix
                </li>
                <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-blue-600">3.</span>
                  Configurez votre imprimante dans Windows (Paramètres → Imprimantes → Préférences d'impression)
                </li>
                <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-blue-600">4.</span>
                  Créez un fichier <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm">.env</code> dans le dossier extrait avec vos paramètres (URL API, nom imprimante, identifiants)
                </li>
                <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-blue-600">5.</span>
                  Double-cliquez sur <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm">Attendee Print Client.exe</code> pour lancer l'application
                </li>
              </ol>
            </div>

            {/* macOS */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Apple className="h-5 w-5 text-gray-700" />
                macOS
              </h4>
              <ol className="space-y-2 ml-7">
                <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-600">1.</span>
                  Téléchargez le fichier <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm">.dmg</code>
                </li>
                <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-600">2.</span>
                  Ouvrez le DMG et glissez l'application dans Applications
                </li>
                <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-600">3.</span>
                  Configurez votre imprimante dans Préférences Système → Imprimantes et scanners
                </li>
                <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-600">4.</span>
                  Créez un fichier <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm">.env</code> dans le dossier de l'application
                </li>
                <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-600">5.</span>
                  Lancez l'application (autoriser dans Sécurité si nécessaire)
                </li>
              </ol>
            </div>
          </Card>

          {/* Fonctionnalités */}
          <Card variant="default" padding="xl" className="shadow-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Fonctionnalités
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Imprimantes compatibles */}
          <Card variant="default" padding="xl" className="shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Imprimantes testées et compatibles
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <ul className="grid sm:grid-cols-2 gap-3">
                {printers.map((printer, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    {printer}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              La plupart des imprimantes thermiques label sont compatibles. Pour d'autres modèles, 
              contactez le support technique.
            </p>
          </Card>

          {/* Configuration requise */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Configuration système requise
            </h4>
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-2">Windows :</p>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Windows 10 ou 11 (64-bit)</li>
                  <li>• 4 GB RAM minimum</li>
                  <li>• 200 MB d'espace disque</li>
                  <li>• Connexion réseau à l'API</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-2">macOS :</p>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• macOS 11 Big Sur ou supérieur</li>
                  <li>• 4 GB RAM minimum</li>
                  <li>• 150 MB d'espace disque</li>
                  <li>• Connexion réseau à l'API</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </PageSection>
    </PageContainer>
  )
}
