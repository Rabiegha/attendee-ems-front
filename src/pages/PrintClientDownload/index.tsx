import React from 'react'
import { useTranslation } from 'react-i18next'
import { Download, MonitorCheck } from 'lucide-react'
import { PageContainer, PageHeader, PageSection } from '@/shared/ui'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'

// Icone Windows (Microsoft)
const WindowsIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 88 88" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.017 45.742zm4.33-38.356L88 0v41.385l-47.989.192zM88 45.98l-.01 41.39-48.001-6.936.007-34.256z"/>
  </svg>
)

// Icone Apple (logo officiel)
const AppleIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 384 512" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/>
  </svg>
)

export const PrintClientDownloadPage: React.FC = () => {
  const { t } = useTranslation('printing')
  // URLs de téléchargement (à adapter selon votre hébergement)
  const windowsUrl = '/downloads/Attendee-Print-Client-Setup.exe'
  const macUrl = '/downloads/Attendee-Print-Client-1.0.0.dmg'
  
  return (
    <PageContainer>
      <PageHeader
        title={t('download.title')}
        description={t('download.description')}
        icon={MonitorCheck}
      />

      <PageSection spacing="lg">
        <div className="max-w-4xl mx-auto">
          {/* Cartes de téléchargement */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Windows */}
            <Card variant="default" padding="xl" className="shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <WindowsIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {t('download.windows')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('download.windows_desc')}
                  </p>
                </div>
                <div className="w-full space-y-3">
                  <a
                    href={windowsUrl}
                    download="Attendee-Print-Client-Setup.exe"
                    className="block"
                    onClick={(e) => {
                      e.preventDefault()
                      const link = document.createElement('a')
                      link.href = windowsUrl
                      link.download = 'Attendee-Print-Client-Setup.exe'
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
                      {t('download.download_button')}
                    </Button>
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('download.version_windows')}
                  </p>
                </div>
              </div>
            </Card>

            {/* macOS */}
            <Card variant="default" padding="xl" className="shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl shadow-lg">
                  <AppleIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {t('download.macos')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('download.macos_desc')}
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
                      {t('download.download_button')}
                    </Button>
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('download.version_macos')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageSection>
    </PageContainer>
  )
}
