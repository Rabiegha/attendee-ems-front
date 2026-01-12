import React from 'react'
import { Download, Smartphone, CheckCircle } from 'lucide-react'
import { PageContainer, PageHeader, PageSection } from '@/shared/ui'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'

export const ApplicationDownloadPage: React.FC = () => {
  const apkUrl = '/downloads/attendee-app.apk'
  
  const features = [
    'Consultation des événements en cours, à venir et passés',
    'Recherche et filtres avancés',
    'Gestion des inscriptions',
    'Interface moderne et intuitive',
    'Mode hors ligne (bientôt disponible)',
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Application Mobile"
        description="Téléchargez l'application Android Attendee pour gérer vos événements en mobilité."
        icon={Smartphone}
      />

      <PageSection spacing="lg">
        <div className="max-w-2xl mx-auto">
          <Card variant="default" padding="xl" className="shadow-xl my-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="section-title mb-0">Attendee Mobile</h2>
                <p className="text-body-sm text-gray-500 dark:text-gray-400">
                  Version Android - Production
                </p>
              </div>
            </div>

            <div className="space-form">
              {/* Bouton de téléchargement */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                    <Smartphone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Fichier APK prêt au téléchargement
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <a
                    href={apkUrl}
                    download="attendee-app.apk"
                    className="w-full max-w-xs"
                  >
                    <Button
                      type="button"
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Télécharger l'APK
                    </Button>
                  </a>
                </div>
              </div>

              {/* Instructions d'installation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Instructions d'installation
                </h3>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                      1
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                      Téléchargez le fichier APK en cliquant sur le bouton ci-dessus
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                      2
                    </span>
                    <div className="text-gray-700 dark:text-gray-300 pt-0.5">
                      <p>Autorisez l'installation d'applications provenant de sources inconnues</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Paramètres → Sécurité → Sources inconnues
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                      3
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                      Ouvrez le fichier APK téléchargé et suivez les instructions
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                      4
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                      Lancez l'application et connectez-vous avec vos identifiants
                    </span>
                  </li>
                </ol>
              </div>

              {/* Fonctionnalités */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Fonctionnalités principales
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Note de compatibilité */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Compatibilité
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Cette application requiert Android 5.0 (Lollipop) ou une version ultérieure.
                  Pour toute question ou problème, contactez l'administrateur système.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </PageSection>
    </PageContainer>
  )
}
