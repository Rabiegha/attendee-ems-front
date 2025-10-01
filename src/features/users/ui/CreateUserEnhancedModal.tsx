import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector } from 'react-redux';
import { Loader2, User, Mail, Shield, Building2, Plus } from 'lucide-react';
import { Button, Input, FormField, Modal, Select, SelectOption } from '@/shared/ui';
import { useToast } from '@/shared/ui/useToast';
import { selectUser } from '@/features/auth/model/sessionSlice';
import { useCan } from '@/shared/acl/hooks/useCan';
import { 
  useCreateUserWithGeneratedPasswordMutation, 
  useGetRolesQuery, 
  useGetOrganizationsQuery,
  type Role,
  type Organization
} from '@/features/users/api/usersApi';
import { 
  createUserWithGeneratedPasswordSchema, 
  mapCreateUserWithGeneratedPasswordFormToDto, 
  type CreateUserWithGeneratedPasswordFormData, 
  roleDescriptions 
} from '@/features/users/dpo/user.dpo';
import { UserCredentialsModal } from './UserCredentialsModal';

interface CreateUserEnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateUserEnhancedModal: React.FC<CreateUserEnhancedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { success, error: showError } = useToast();
  const currentUser = useSelector(selectUser);
  const [createUser, { isLoading: isCreating }] = useCreateUserWithGeneratedPasswordMutation();
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();
  
  // 🔒 Récupérer les organisations seulement si SUPER_ADMIN
  const isSuperAdmin = useCan('manage', 'all');
  const { data: organizationsData, isLoading: isLoadingOrgs } = useGetOrganizationsQuery(undefined, {
    skip: !isSuperAdmin // Ne charger que si c'est un SUPER_ADMIN
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<CreateUserWithGeneratedPasswordFormData>({
    resolver: zodResolver(createUserWithGeneratedPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      createNewOrg: false,
      // Si pas SUPER_ADMIN, l'orgId sera automatiquement celui de l'utilisateur connecté
      orgId: !isSuperAdmin ? currentUser?.orgId : undefined,
    }
  });

  const [showCredentials, setShowCredentials] = useState(false);
  const [userCredentials, setUserCredentials] = useState<{
    email: string;
    temporaryPassword: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  const selectedRoleId = watch('roleId');
  const createNewOrg = watch('createNewOrg');
  const selectedRole = rolesData?.find((role: Role) => role.id === selectedRoleId);

  const onSubmit = async (data: CreateUserWithGeneratedPasswordFormData) => {
    try {
      const { dto, temporaryPassword, newOrgData } = mapCreateUserWithGeneratedPasswordFormToDto(data);
      
      // TODO: Si newOrgData existe, créer d'abord l'organisation
      // Pour l'instant, on fait juste la création d'utilisateur
      
      await createUser(dto).unwrap();
      
      // Préparer les données pour la modal des identifiants
      setUserCredentials({
        email: data.email,
        temporaryPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      setShowCredentials(true);
      reset();
      onClose();
      
      success(
        'Utilisateur créé',
        `L'utilisateur ${data.firstName} ${data.lastName} a été créé avec succès.`
      );
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création de l\'utilisateur';
      
      if (error?.data?.message?.includes('already exists')) {
        errorMessage = 'Cet email est déjà utilisé par un autre utilisateur.';
      } else if (error?.data?.message?.includes('Invalid credentials')) {
        errorMessage = 'Permissions insuffisantes pour créer un utilisateur.';
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }
      
      showError('Erreur de création', errorMessage);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer un utilisateur"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 👤 Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Prénom"
            error={errors.firstName?.message}
            required
          >
            <Input
              {...register('firstName')}
              placeholder="Jean"
              leftIcon={<User className="h-5 w-5" />}
            />
          </FormField>
          
          <FormField
            label="Nom"
            error={errors.lastName?.message}
            required
          >
            <Input
              {...register('lastName')}
              placeholder="Dupont"
              leftIcon={<User className="h-5 w-5" />}
            />
          </FormField>
        </div>

        {/* 📧 Email */}
        <FormField
          label="Adresse email"
          error={errors.email?.message}
          required
        >
          <Input
            {...register('email')}
            type="email"
            placeholder="jean.dupont@example.com"
            leftIcon={<Mail className="h-5 w-5" />}
            autoComplete="email"
          />
        </FormField>

        {/* 📱 Téléphone (optionnel) */}
        <FormField
          label="Téléphone (optionnel)"
          error={errors.phone?.message}
        >
          <Input
            {...register('phone')}
            type="tel"
            placeholder="+33 6 12 34 56 78"
          />
        </FormField>

        {/* 🏢 Organisation - Conditionnel selon le rôle */}
        {isSuperAdmin && (
          <div className="space-y-4">
            <FormField
              label="Organisation"
              error={errors.orgId?.message}
              required
            >
              <div className="space-y-3">
                {/* Option: Organisation existante */}
                <div className="flex items-center space-x-2">
                  <Controller
                    name="createNewOrg"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="radio"
                        id="existing-org"
                        checked={!field.value}
                        onChange={() => field.onChange(false)}
                        className="text-blue-600"
                      />
                    )}
                  />
                  <label htmlFor="existing-org" className="text-sm font-medium">
                    Assigner à une organisation existante
                  </label>
                </div>
                
                {!createNewOrg && (
                  <Select
                    {...register('orgId')}
                    leftIcon={<Building2 className="h-5 w-5" />}
                    disabled={isLoadingOrgs}
                    placeholder={isLoadingOrgs ? 'Chargement...' : 'Sélectionnez une organisation'}
                  >
                    {organizationsData?.map((org: Organization) => (
                      <SelectOption key={org.id} value={org.id}>
                        {org.name}
                      </SelectOption>
                    ))}
                  </Select>
                )}

                {/* Option: Nouvelle organisation */}
                <div className="flex items-center space-x-2">
                  <Controller
                    name="createNewOrg"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="radio"
                        id="new-org"
                        checked={field.value}
                        onChange={() => field.onChange(true)}
                        className="text-blue-600"
                      />
                    )}
                  />
                  <label htmlFor="new-org" className="text-sm font-medium flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Créer une nouvelle organisation
                  </label>
                </div>

                {createNewOrg && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
                    <FormField
                      label="Nom de l'organisation"
                      error={errors.newOrgName?.message}
                      required
                    >
                      <Input
                        {...register('newOrgName')}
                        placeholder="ACME Corp"
                      />
                    </FormField>
                    
                    <FormField
                      label="Identifiant unique (slug)"
                      error={errors.newOrgSlug?.message}
                      required
                    >
                      <Input
                        {...register('newOrgSlug')}
                        placeholder="acme-corp"
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </FormField>
          </div>
        )}

        {/* Info pour les non-SUPER_ADMIN */}
        {!isSuperAdmin && currentUser?.orgId && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              📍 L'utilisateur sera automatiquement créé dans votre organisation
            </p>
          </div>
        )}

        {/* 🔐 Rôle */}
        <FormField
          label="Rôle"
          error={errors.roleId?.message}
          required
        >
          <Select
            {...register('roleId')}
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
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

        {/* Boutons */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            Annuler
          </Button>
          
          <Button
            type="submit"
            disabled={!isValid || isCreating}
            loading={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              'Créer l\'utilisateur'
            )}
          </Button>
        </div>
      </form>
    </Modal>

    {/* Modal des identifiants */}
    {userCredentials && (
      <UserCredentialsModal
        isOpen={showCredentials}
        onClose={() => setShowCredentials(false)}
        userCredentials={userCredentials}
      />
    )}
    </>
  );
};