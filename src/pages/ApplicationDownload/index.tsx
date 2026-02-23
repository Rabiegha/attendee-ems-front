import React from 'react'
import { Download, Smartphone, CheckCircle, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'
import { PageContainer, PageHeader, PageSection } from '@/shared/ui'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { useTranslation } from 'react-i18next'

export const ApplicationDownloadPage: React.FC = () => {
  const { t, i18n } = useTranslation('downloads')
  const apkUrl = '/downloads/AttendeeV2.apk'
  const fullApkUrl = `${window.location.origin}${apkUrl}`
  
  const features = [
    t('mobile.feature_1'),
    t('mobile.feature_2'),
    t('mobile.feature_3'),
    t('mobile.feature_4'),
    t('mobile.feature_5'),
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('mobile.title')}
        description={t('mobile.description')}
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
                <h2 className="section-title mb-0">{t('mobile.app_name')}</h2>
                <p className="text-body-sm text-gray-500 dark:text-gray-400">
                  {t('mobile.version')}
                </p>
              </div>
            </div>

            <div className="space-form">
              {/* QR Code Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('mobile.scan_title')}
                  </h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-inner border-4 border-gray-100">
                  <QRCode
                    value={fullApkUrl}
                    size={200}
                    level="H"
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                  {t('mobile.scan_description')}
                </p>
              </div>

              {/* Bouton de téléchargement */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                    <Smartphone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {t('mobile.apk_ready')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('mobile.last_update')} {new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                    </p>
                  </div>
                  <a
                    href={apkUrl}
                    download="AttendeeV2.apk"
                    className="w-full max-w-xs"
                    onClick={(e) => {
                      // Forcer le téléchargement
                      e.preventDefault()
                      const link = document.createElement('a')
                      link.href = apkUrl
                      link.download = 'AttendeeV2.apk'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    <Button
                      type="button"
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      {t('mobile.download_apk')}
                    </Button>
                  </a>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 max-w-xs">
                    {t('mobile.download_auto')}{' '}
                    <a href={apkUrl} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {t('mobile.click_here')}
                    </a>
                  </p>
                </div>
              </div>

              {/* Instructions d'installation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('mobile.install_title')}
                </h3>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                      1
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                      {t('mobile.step_1')}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                      2
                    </span>
                    <div className="text-gray-700 dark:text-gray-300 pt-0.5">
                      <p>{t('mobile.step_2')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('mobile.step_2_detail')}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                      3
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                      {t('mobile.step_3')}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                      4
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                      {t('mobile.step_4')}
                    </span>
                  </li>
                </ol>
              </div>

              {/* Fonctionnalités */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('mobile.features_title')}
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
                  {t('mobile.compatibility_title')}
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t('mobile.compatibility_desc')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </PageSection>
    </PageContainer>
  )
}
