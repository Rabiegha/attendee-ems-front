/**
 * 🔐 FORMULAIRE DE COMPLÉTION D'INSCRIPTION
 * 
 * Workflow sécurisé : Token validé → Complétion profil → Activation compte
 */

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, User, Phone, CheckCircle } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { FormField } from '@/shared/ui/FormField'
import type { SignupFormData, InvitationTokenInfo } from '../types/signup.types'

// Schéma de validation strict
const signupSchema = z.object({
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom ne peut contenir que des lettres'),
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/(?=.*[a-z])/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/(?=.*[A-Z])/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/(?=.*[@$!%*?&])/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z.string(),
  phone: z.string()
    .optional()
    .refine((val) => !val || /^(\+33|0)[1-9](?:[0-9]{8})$/.test(val), {
      message: 'Numéro de téléphone français invalide'
    }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions d\'utilisation'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

interface SignupFormProps {
  invitation: InvitationTokenInfo
  onSubmit: (data: SignupFormData) => Promise<void>
  isLoading: boolean
}

export const SignupForm: React.FC<SignupFormProps> = ({
  invitation,
  onSubmit,
  isLoading
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  })

  const password = watch('password')

  // Calcul de la force du mot de passe
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[@$!%*?&]/.test(password)) score++

    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Très faible', color: 'bg-red-500' },
      { score: 2, label: 'Faible', color: 'bg-orange-500' },
      { score: 3, label: 'Moyen', color: 'bg-yellow-500' },
      { score: 4, label: 'Fort', color: 'bg-blue-500' },
      { score: 5, label: 'Très fort', color: 'bg-green-500' }
    ]

    return levels[score] || levels[0]
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email (lecture seule) */}
      <FormField
        label="Adresse email"
        hint="Cette adresse email ne peut pas être modifiée"
      >
        <Input
          type="email"
          value={invitation.email}
          disabled
          className="bg-gray-50"
        />
      </FormField>

      {/* Prénom */}
      <FormField
        label="Prénom"
        error={errors.firstName?.message}
        required
      >
        <Input
          {...register('firstName')}
          placeholder="Jean"
          leftIcon={<User className="h-4 w-4" />}
          autoComplete="given-name"
        />
      </FormField>

      {/* Nom */}
      <FormField
        label="Nom de famille"
        error={errors.lastName?.message}
        required
      >
        <Input
          {...register('lastName')}
          placeholder="Dupont"
          leftIcon={<User className="h-4 w-4" />}
          autoComplete="family-name"
        />
      </FormField>

      {/* Mot de passe */}
      <FormField
        label="Mot de passe"
        error={errors.password?.message}
        required
      >
        <Input
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          autoComplete="new-password"
        />
        
        {/* Indicateur de force du mot de passe */}
        {password && passwordStrength && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">{passwordStrength.label}</span>
            </div>
            <div className="text-xs text-gray-500">
              Le mot de passe doit contenir au moins 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux.
            </div>
          </div>
        )}
      </FormField>

      {/* Confirmation mot de passe */}
      <FormField
        label="Confirmer le mot de passe"
        error={errors.confirmPassword?.message}
        required
      >
        <Input
          {...register('confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          autoComplete="new-password"
        />
      </FormField>

      {/* Téléphone (optionnel) */}
      <FormField
        label="Téléphone"
        error={errors.phone?.message}
        hint="Optionnel - Format français attendu"
      >
        <Input
          {...register('phone')}
          type="tel"
          placeholder="+33 1 23 45 67 89"
          leftIcon={<Phone className="h-4 w-4" />}
          autoComplete="tel"
        />
      </FormField>

      {/* Conditions d'utilisation */}
      <FormField error={errors.acceptTerms?.message}>
        <div className="flex items-start gap-3">
          <input
            {...register('acceptTerms')}
            type="checkbox"
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-200"
          />
          <label className="text-sm text-gray-700 dark:text-gray-300">
            J'accepte les{' '}
            <a href="/conditions" target="_blank" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
              conditions d'utilisation
            </a>
            {' '}et la{' '}
            <a href="/confidentialite" target="_blank" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
              politique de confidentialité
            </a>
          </label>
        </div>
      </FormField>

      {/* Bouton de validation */}
      <Button
        type="submit"
        className="w-full"
        disabled={!isValid || isLoading}
      >
        {isLoading ? (
          'Création du compte...'
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Créer mon compte
          </>
        )}
      </Button>
    </form>
  )
}