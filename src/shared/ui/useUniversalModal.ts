import { useState } from 'react';
import type { ModalConfig } from './UniversalModal';

export const useUniversalModal = () => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    config: ModalConfig | null;
  }>({
    isOpen: false,
    config: null,
  });

  const showModal = (config: ModalConfig) => {
    setModalState({
      isOpen: true,
      config,
    });
  };

  const hideModal = () => {
    setModalState({
      isOpen: false,
      config: null,
    });
  };

  // Helpers pour les types courants
  const showSuccess = (title: string, message: string, actions?: ModalConfig['actions']) => {
    showModal({
      type: 'success',
      title,
      message,
      ...(actions && { actions }),
    });
  };

  const showError = (title: string, message: string, actions?: ModalConfig['actions']) => {
    showModal({
      type: 'error',
      title,
      message,
      ...(actions && { actions }),
    });
  };

  const showWarning = (title: string, message: string, actions?: ModalConfig['actions']) => {
    showModal({
      type: 'warning',
      title,
      message,
      ...(actions && { actions }),
    });
  };

  const showInfo = (title: string, message: string, actions?: ModalConfig['actions']) => {
    showModal({
      type: 'info',
      title,
      message,
      ...(actions && { actions }),
    });
  };

  const showConfirmation = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => {
    showModal({
      type: 'confirmation',
      title,
      message,
      actions: {
        primary: {
          label: 'Confirmer',
          action: onConfirm,
        },
        secondary: {
          label: 'Annuler',
          action: onCancel || (() => {}),
        },
      },
    });
  };

  const showOrganizationCreated = (
    name: string, 
    slug: string, 
    onViewOrganizations?: () => void
  ) => {
    showModal({
      type: 'organization-created',
      title: 'Organisation créée avec succès !',
      message: `L'organisation "${name}" a été créée et est maintenant disponible.`,
      details: { name, slug },
      actions: {
        primary: {
          label: 'Parfait !',
          action: () => {},
        },
        ...(onViewOrganizations && {
          secondary: {
            label: 'Voir les organisations',
            action: onViewOrganizations,
          },
        }),
      },
    });
  };

  const showUserCreated = (
    email: string, 
    organization?: string, 
    onViewUsers?: () => void
  ) => {
    showModal({
      type: 'user-created',
      title: 'Utilisateur créé avec succès !',
      message: `L'utilisateur ${email} a été créé et peut maintenant se connecter.`,
      details: { email, ...(organization && { organization }) },
      actions: {
        primary: {
          label: 'Parfait !',
          action: () => {},
        },
        ...(onViewUsers && {
          secondary: {
            label: 'Voir les utilisateurs',
            action: onViewUsers,
          },
        }),
      },
    });
  };

  const showInvitationSent = (
    email: string, 
    organization?: string, 
    onSendAnother?: () => void
  ) => {
    showModal({
      type: 'invitation-sent',
      title: 'Invitation envoyée !',
      message: `L'invitation a été envoyée à ${email}. L'utilisateur recevra un email avec un lien sécurisé.`,
      details: { email, ...(organization && { organization }) },
      actions: {
        primary: {
          label: 'Parfait !',
          action: () => {},
        },
        ...(onSendAnother && {
          secondary: {
            label: 'Envoyer une autre',
            action: onSendAnother,
          },
        }),
      },
    });
  };

  return {
    modalState,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    showOrganizationCreated,
    showUserCreated,
    showInvitationSent,
  };
};