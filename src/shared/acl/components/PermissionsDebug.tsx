import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectAbilityRules } from '@/features/auth/model/sessionSlice'
import { ChevronDown, ChevronUp, Shield } from 'lucide-react'

/**
 * Composant de debug pour afficher les permissions CASL en temps réel
 * À utiliser uniquement en développement
 */
export const PermissionsDebug: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const rules = useSelector(selectAbilityRules)

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800 transition-colors rounded-t-lg"
        >
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="font-mono text-sm">
              Permissions ({rules.length} rules)
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="px-4 py-3 max-h-96 overflow-y-auto border-t border-gray-700">
            {rules.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Aucune permission</p>
            ) : (
              <div className="space-y-2">
                {rules.map((rule: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded p-2 border border-gray-700"
                  >
                    <div className="font-mono text-xs">
                      <span className="text-green-400">{rule.action}</span>
                      {' → '}
                      <span className="text-blue-400">{rule.subject}</span>
                    </div>
                    {rule.conditions && (
                      <div className="mt-1 text-xs text-gray-400 font-mono">
                        {JSON.stringify(rule.conditions)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
              Mise à jour toutes les 5 secondes
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
