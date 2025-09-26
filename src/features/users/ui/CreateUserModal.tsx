import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User, Mail, Lock, Shield } from 'lucide-react';
import { Button, Input, FormField, Modal, Select, SelectOption } from '@/shared/ui';
import { useToast } from '@/shared/ui/useToast';
import { useCreateUserMutation, useGetRolesQuery, type Role } from '@/features/users/api/usersApi';
import { createUserSchema, mapCreateUserFormToDto, type CreateUserFormData, roleDescriptions } from '@/features/users/dpo/user.dpo';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { success, error: showError } = useToast();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
    defaultValues: {
      is_active: true,
    },
  });

  const selectedRoleId = watch('role_id');
  const selectedRole = rolesData?.find((role: Role) => role.id === selectedRoleId);

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      const createUserDto = mapCreateUserFormToDto(data);
      const result = await createUser(createUserDto).unwrap();
      
      success(
        'Utilisateur créé avec succès !',
        `L'utilisateur ${result.email} a été créé avec le rôle ${result.role.name}.`
      );
      
      reset();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          'Une erreur est survenue lors de la création de l\'utilisateur';
      
      showError('Erreur', errorMessage);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer un utilisateur"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <FormField
          label="Adresse email"
          error={errors.email?.message}
          required
        >
          <Input
            {...register('email')}
            type="email"
            placeholder="nom@entreprise.com"
            leftIcon={<Mail className="h-5 w-5" />}
            autoComplete="email"
          />
        </FormField>

        {/* Mot de passe */}
        <FormField
          label="Mot de passe"
          error={errors.password?.message}
          required
          hint="Minimum 8 caractères avec majuscule, minuscule, chiffre et caractère spécial"
        >
          <Input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-5 w-5" />}
            autoComplete="new-password"
          />
        </FormField>

        {/* Rôle */}
        <FormField
          label="Rôle"
          error={errors.role_id?.message}
          required
        >
          <Select
            {...register('role_id')}
            leftIcon={<Shield className="h-5 w-5" />}
            disabled={isLoadingRoles}
            placeholder={isLoadingRoles ? 'Chargement des rôles...' : 'Sélectionnez un rôle'}
          >
            {rolesData?.map((role: Role) => (
              <SelectOption key={role.id} value={role.id}>
                {role.name}
              </SelectOption>
            ))}
          </Select>
        </FormField>

        {/* Description du rôle sélectionné */}
        {selectedRole && roleDescriptions[selectedRole.code] && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 transition-colors duration-200">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  {selectedRole.name}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  {roleDescriptions[selectedRole.code]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Compte actif */}
        <FormField label="État du compte">
          <div className="flex items-center space-x-3">
            <input
              {...register('is_active')}
              type="checkbox"
              id="is_active"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded transition-colors duration-200"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
              Compte activé (l'utilisateur pourra se connecter immédiatement)
            </label>
          </div>
        </FormField>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isCreating}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isCreating || isLoadingRoles}
            className="min-w-[120px]"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Créer l'utilisateur
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};