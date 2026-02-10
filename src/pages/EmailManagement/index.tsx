/**
 * EmailManagementPage - Page de gestion des templates d'emails
 */

import { useState } from 'react'
import { Mail, CheckCircle, XCircle, Info, Settings, Send, Eye, X } from 'lucide-react'
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
  useUpdateEmailTemplateMutation,
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
  [EmailTemplateType.INVITATION]: 'Invitation utilisateur',
  [EmailTemplateType.PASSWORD_RESET]: 'Réinitialisation mot de passe',
}

const EMAIL_TYPE_DESCRIPTIONS: Record<EmailTemplateType, string> = {
  [EmailTemplateType.REGISTRATION_CONFIRMATION]: 'Envoyé automatiquement lors de l\'inscription à un événement',
  [EmailTemplateType.REGISTRATION_APPROVED]: 'Envoyé lorsque l\'inscription d\'un participant est approuvée',
  [EmailTemplateType.INVITATION]: 'Envoyé lors de l\'invitation d\'un nouvel utilisateur dans l\'organisation',
  [EmailTemplateType.PASSWORD_RESET]: 'Envoyé lors d\'une demande de réinitialisation de mot de passe',
}

function EmailManagementPageContent() {
  const toast = useToast()
  const { data: templates, isLoading: templatesLoading } = useGetEmailTemplatesQuery()
  const { data: status, isLoading: statusLoading } = useGetEmailStatusQuery()
  const [updateTemplate] = useUpdateEmailTemplateMutation()
  const [sendTestEmail, { isLoading: sendingTest }] = useSendTestEmailMutation()
  const [getPreview, { data: previewData, isLoading: previewLoading }] = useLazyGetEmailTemplatePreviewQuery()

  const [togglingTemplate, setTogglingTemplate] = useState<string | null>(null)
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

  const handleToggleTemplate = async (templateId: string, currentStatus: boolean) => {
    try {
      setTogglingTemplate(templateId)
      await updateTemplate({
        id: templateId,
        data: { is_active: !currentStatus },
      }).unwrap()

      toast.success(
        currentStatus ? 'Template d\'email désactivé' : 'Template d\'email activé',
        currentStatus
          ? 'Les emails de ce type ne seront plus envoyés'
          : 'Les emails de ce type seront maintenant envoyés'
      )
    } catch (error) {
      toast.error('Erreur', 'Impossible de modifier le statut du template')
    } finally {
      setTogglingTemplate(null)
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
        description="Configurez les templates d'emails automatiques et consultez le statut du service"
        icon={Mail}
      />

      <PageSection>
        {/* Statut du service email */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Statut du service d'emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : status ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Service activé</span>
                    {status.enabled ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Activé
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Désactivé
                      </Badge>
                    )}
                  </div>
                  {status.enabled && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Connexion SMTP</span>
                      {status.connected ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Connecté
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Non connecté
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {status.enabled && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Serveur SMTP</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{status.host}:{status.port}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Adresse d'envoi</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{status.from}</span>
                    </div>
                  </div>
                )}

                {!status.enabled && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-medium mb-1">Service d'emails désactivé</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Pour activer l'envoi d'emails, configurez les variables d'environnement SMTP dans votre fichier .env
                        et redémarrez le serveur backend.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Liste des templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Templates d'emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/50">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : templates && templates.length > 0 ? (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {EMAIL_TYPE_LABELS[template.type as EmailTemplateType]}
                          </h3>
                          {template.is_active ? (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Actif
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Inactif
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {EMAIL_TYPE_DESCRIPTIONS[template.type as EmailTemplateType]}
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 mb-3 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Objet de l'email :</p>
                          <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{template.subject}</p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>ID: {template.id}</span>
                          <span>•</span>
                          <span>
                            Mis à jour le {new Date(template.updated_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(template.id)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Aperçu
                        </Button>
                        <Can do="update" on="Email">
                          <Button
                            variant={template.is_active ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => handleToggleTemplate(template.id, template.is_active)}
                            disabled={togglingTemplate === template.id}
                          >
                            {togglingTemplate === template.id
                              ? 'Chargement...'
                              : template.is_active
                              ? 'Désactiver'
                              : 'Activer'}
                          </Button>
                        </Can>
                      </div>
                    </div>
                  </div>
                ))}
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
          <CardContent className="pt-6">
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
                    <option value={EmailTemplateType.INVITATION}>
                      {EMAIL_TYPE_LABELS[EmailTemplateType.INVITATION]}
                    </option>
                    <option value={EmailTemplateType.PASSWORD_RESET}>
                      {EMAIL_TYPE_LABELS[EmailTemplateType.PASSWORD_RESET]}
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
