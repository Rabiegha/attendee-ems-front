import React, { useState } from 'react'
import { Copy, Check, Code2 } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/hooks/useToast'

interface EmbedCodeGeneratorProps {
  eventId: string
  publicToken: string
}

export const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({ 
  eventId, 
  publicToken 
}) => {
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  // Générer le token public si non existant
  const token = publicToken || `event-${eventId}-${Date.now()}`
  
  // URL du formulaire public
  const formUrl = `${window.location.origin}/register/${token}`
  
  // Code embed HTML
  const embedCode = `<!-- Formulaire d'inscription Attendee EMS -->
<div id="attendee-ems-form"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${formUrl}';
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '600px';
    iframe.onload = function() {
      // Auto-resize iframe based on content
      window.addEventListener('message', function(e) {
        if (e.data.type === 'attendee-ems-resize') {
          iframe.style.height = e.data.height + 'px';
        }
      });
    };
    document.getElementById('attendee-ems-form').appendChild(iframe);
  })();
</script>`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      toast.success('Code copié !', 'Le code embed a été copié dans le presse-papier')
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      toast.error('Erreur', 'Impossible de copier le code')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Code d'intégration
          </h3>
        </div>
        <Button
          variant={copied ? 'default' : 'outline'}
          size="sm"
          onClick={copyToClipboard}
          className="transition-all duration-200"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copié !
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copier le code
            </>
          )}
        </Button>
      </div>

      {/* Code Display */}
      <div className="relative">
        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-700">
          <code>{embedCode}</code>
        </pre>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          Instructions d'intégration :
        </h4>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Copiez le code ci-dessus</li>
          <li>Collez-le dans le code HTML de votre page web</li>
          <li>Le formulaire s'affichera automatiquement à l'emplacement du div</li>
          <li>Les inscriptions arriveront directement dans votre back-office</li>
        </ol>
      </div>

      {/* Direct Link */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Lien direct vers le formulaire :
        </h4>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={formUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(formUrl)
              toast.success('Lien copié !', 'Le lien a été copié dans le presse-papier')
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Vous pouvez également partager ce lien directement sans l'intégrer sur votre site
        </p>
      </div>

      {/* Token Info */}
      {!publicToken && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ Token public temporaire :</strong> Le token affiché est temporaire. 
            Enregistrez les modifications de l'événement pour générer un token permanent.
          </p>
        </div>
      )}
    </div>
  )
}
