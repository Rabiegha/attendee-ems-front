import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/features/auth/api/authApi'
import { setSession } from '@/features/auth/model/sessionSlice'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { FormField } from '@/shared/ui/FormField'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const { t } = useTranslation('auth')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [login, { isLoading, error }] = authApi.useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap()
      dispatch(setSession(result))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="bg-white py-8 px-6 shadow rounded-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            {t('login.title')}
          </h2>
        </div>

        <FormField
          label={t('login.email')}
          error={errors.email?.message}
          required
        >
          <Input
            type="email"
            {...register('email')}
            placeholder="nom@exemple.com"
          />
        </FormField>

        <FormField
          label={t('login.password')}
          error={errors.password?.message}
          required
        >
          <Input
            type="password"
            {...register('password')}
            placeholder="••••••••"
          />
        </FormField>

        {error && (
          <div className="text-sm text-destructive text-center">
            {t('login.invalid_credentials')}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? t('common:app.loading') : t('login.submit')}
        </Button>
      </form>
    </div>
  )
}
