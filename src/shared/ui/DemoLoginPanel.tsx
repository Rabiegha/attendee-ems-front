import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/Button'
import { demoData } from '@/mocks/auth-demo'
import { useLoginMutation } from '@/features/auth/api/authApi'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addToast } from '@/shared/ui/toast-slice'
import { setSession } from '@/features/auth/model/sessionSlice'

interface DemoLoginPanelProps {
  className?: string
}

export const DemoLoginPanel: React.FC<DemoLoginPanelProps> = ({ className = '' }) => {
  const { t } = useTranslation('common')
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleDemoLogin = async (email: string, description: string) => {
    try {
      const result = await login({
        email,
        password: 'demo123'
      }).unwrap()
      
      // Mettre à jour la session Redux (comme dans LoginPage)
      dispatch(setSession(result))
      
      dispatch(addToast({
        type: 'success',
        title: t('demo.login_success'),
        message: `${t('demo.login_as')} ${description}`,
        duration: 5000
      }))
      
      // Rediriger vers le dashboard
      navigate('/dashboard', { replace: true })
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: t('demo.login_error'),
        message: t('demo.login_error_message'),
        duration: 5000
      }))
    }
  }

  return (
    <div className={`p-6 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('demo.title')}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        {t('demo.description')}
      </p>

      <div className="space-y-3">
        {demoData.loginExamples.map((example, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {example.email}
              </p>
              <p className="text-xs text-gray-500">
                {example.description}
              </p>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDemoLogin(example.email, example.description)}
              disabled={isLoading}
              className="ml-3 flex-shrink-0"
            >
              {isLoading ? t('app.connecting') : t('app.sign_in')}
            </Button>
          </div>
        ))}
      </div>



      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-xs text-yellow-700">
          {t('demo.password_notice')} <code className="font-mono bg-yellow-100 px-1 rounded">demo123</code>
        </p>
      </div>
    </div>
  )
}

export default DemoLoginPanel
