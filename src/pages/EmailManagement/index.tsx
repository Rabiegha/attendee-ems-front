/**
 * EmailManagementPage - Page de gestion des templates d'emails
 */

import { useState } from 'react'
import { Mail, CheckCircle, XCircle, Info, Send, Eye, X, UserPlus, Key } from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  PageContainer,
  PageHeader,
  PageSection,
  Badge,
  Skeleton,
  Input,
  Modal,
} from '@/shared/ui'
import {
  useGetEmailTemplatesQuery,
  useGetEmailStatusQuery,
  useSendTestEmailMutation,
  useLazyGetEmailTemplatePreviewQuery,
} from '@/features/email/api/emailApi'
import { EmailTemplateType } from '@/features/email/types/email.types'
import { ProtectedPage } from '@/shared/acl/guards/ProtectedPage'
import { Can } from '@/shared/acl/guards/Can'
import { useToast } from '@/shared/hooks/useToast'

const EMAIL_TYPE_LABELS: Record<EmailTemplateType, string> = {
  [EmailTemplateType.REGISTRATION_CONFIRMATION]: 'Confirmation d\'inscription',
  [EmailTemplateType.REGISTRATION_APPROVED]: 'Approbation d\'inscription',
  [EmailTemplateType.REGISTRATION_REJECTED]: 'Refus d\'inscription',
  [EmailTemplateType.INVITATION]: 'Invitation utilisateur',
}

const EMAIL_TYPE_DESCRIPTIONS: Record<EmailTemplateType, string> = {
  [EmailTemplateType.REGISTRATION_CONFIRMATION]: 'Envoyé automatiquement lors de l\'inscription à un événement',
  [EmailTemplateType.REGISTRATION_APPROVED]: 'Envoyé lorsque l\'inscription d\'un participant est approuvée',
  [EmailTemplateType.REGISTRATION_REJECTED]: 'Envoyé lorsque l\'inscription d\'un participant est refusée',
  [EmailTemplateType.INVITATION]: 'Envoyé lors de l\'invitation d\'un nouvel utilisateur dans l\'organisation',
}

function EmailManagementPageContent() {
  const toast = useToast()
  const { data: templates, isLoading: templatesLoading } = useGetEmailTemplatesQuery()
  const { data: status, isLoading: statusLoading } = useGetEmailStatusQuery()
  const [sendTestEmail, { isLoading: sendingTest }] = useSendTestEmailMutation()
  const [getPreview, { data: previewData, isLoading: previewLoading }] = useLazyGetEmailTemplatePreviewQuery()

  const [testEmail, setTestEmail] = useState('')
  const [testTemplateType, setTestTemplateType] = useState<EmailTemplateType>(
    EmailTemplateType.REGISTRATION_CONFIRMATION
  )
  const [previewOpen, setPreviewOpen] = useState(false)

  const handlePreview = async (templateId: string) => {
    try {
      await getPreview(templateId).unwrap()
      setPreviewOpen(true)
    } catch (error) {
      toast.error('Erreur', 'Impossible de charger l\'aperçu du template')
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Erreur', 'Veuillez saisir une adresse email')
      return
    }

    try {
      const result = await sendTestEmail({
        email: testEmail,
        templateType: testTemplateType,
      }).unwrap()

      if (result.success) {
        toast.success('Email de test envoyé', result.message)
      } else {
        toast.error('Erreur', result.message)
      }
    } catch (error) {
      toast.error('Erreur', 'Impossible d\'envoyer l\'email de test')
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Gestion des Emails"
        description="Configurez les templates d'emails automatiques de l'application"
        icon={Mail}
      />

      <PageSection>
        {/* Liste des templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 pb-5">
              <Mail className="h-5 w-5" />
              Templates d'emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800/50">
                    <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : templates && templates.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {templates.map((template) => {
                  // Déterminer l'icône et la couleur selon le type
                  let IconComponent = Mail
                  let iconColorClass = 'text-blue-600 dark:text-blue-400'
                  let bgColorClass = 'bg-blue-100 dark:bg-blue-900/30'
                  
                  if (template.type === EmailTemplateType.REGISTRATION_CONFIRMATION) {
                    IconComponent = CheckCircle
                    iconColorClass = 'text-green-600 dark:text-green-400'
                    bgColorClass = 'bg-green-100 dark:bg-green-900/30'
                  } else if (template.type === EmailTemplateType.REGISTRATION_APPROVED) {
                    IconComponent = CheckCircle
                    iconColorClass = 'text-emerald-600 dark:text-emerald-400'
                    bgColorClass = 'bg-emerald-100 dark:bg-emerald-900/30'
                  } else if (template.type === EmailTemplateType.REGISTRATION_REJECTED) {
                    IconComponent = XCircle
                    iconColorClass = 'text-red-600 dark:text-red-400'
                    bgColorClass = 'bg-red-100 dark:bg-red-900/30'
                  } else if (template.type === EmailTemplateType.INVITATION) {
                    IconComponent = UserPlus
                    iconColorClass = 'text-blue-600 dark:text-blue-400'
                    bgColorClass = 'bg-blue-100 dark:bg-blue-900/30'
                  }

                  return (
                    <div
                      key={template.id}
                      className="group border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all bg-white dark:bg-gray-800/50"
                    >
                      {/* En-tête avec icône et bouton */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${bgColorClass}`}>
                          <IconComponent className={`h-6 w-6 ${iconColorClass}`} />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(template.id)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Aperçu
                        </Button>
                      </div>

                      {/* Titre et description */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {EMAIL_TYPE_LABELS[template.type as EmailTemplateType]}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {EMAIL_TYPE_DESCRIPTIONS[template.type as EmailTemplateType]}
                      </p>

                      {/* Objet de l'email */}
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Objet :</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{template.subject}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Mail className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <p>Aucun template d'email configuré</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info box */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent>
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">À propos des templates d'emails</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Les templates d'emails sont actuellement génériques et identiques pour tous les événements.
                  La fonctionnalité de personnalisation des templates par événement sera ajoutée dans une prochaine version.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section de test d'email */}
        <Can do="update" on="Email">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Tester l'envoi d'email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de template
                  </label>
                  <select
                    value={testTemplateType}
                    onChange={(e) => setTestTemplateType(e.target.value as EmailTemplateType)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={EmailTemplateType.REGISTRATION_CONFIRMATION}>
                      {EMAIL_TYPE_LABELS[EmailTemplateType.REGISTRATION_CONFIRMATION]}
                    </option>
                    <option value={EmailTemplateType.REGISTRATION_APPROVED}>
                      {EMAIL_TYPE_LABELS[EmailTemplateType.REGISTRATION_APPROVED]}
                    </option>
                    <option value={EmailTemplateType.REGISTRATION_REJECTED}>
                      {EMAIL_TYPE_LABELS[EmailTemplateType.REGISTRATION_REJECTED]}
                    </option>
                    <option value={EmailTemplateType.INVITATION}>
                      {EMAIL_TYPE_LABELS[EmailTemplateType.INVITATION]}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse email de destination
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="votre@email.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendTestEmail}
                      disabled={sendingTest || !testEmail}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sendingTest ? 'Envoi...' : 'Envoyer'}
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Un email de test avec des données fictives sera envoyé à l'adresse indiquée.
                </p>
              </div>
            </CardContent>
          </Card>
        </Can>
      </PageSection>

      {/* Modal de prévisualisation */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Aperçu du template"
        size="xl"
      >
        <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white" style={{ maxHeight: '70vh' }}>
          {previewLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Chargement de l'aperçu...</div>
            </div>
          ) : previewData ? (
            <iframe
              srcDoc={previewData.html}
              className="w-full h-full min-h-[600px]"
              title="Email preview"
              sandbox="allow-same-origin"
            />
          ) : null}
        </div>
      </Modal>
    </PageContainer>
  )
}

export function EmailManagementPage() {
  return (
    <ProtectedPage action="read" subject="Email">
      <EmailManagementPageContent />
    </ProtectedPage>
  )
}
