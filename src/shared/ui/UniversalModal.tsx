import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, Building2, Users, Mail, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

// Types de modals supportés
export type ModalType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info'
  | 'confirmation'
  | 'organization-created'
  | 'user-created'
  | 'invitation-sent';

// Configuration d'un modal
export interface ModalConfig {
  type: ModalType;
  title: string;
  message: string;
  details?: {
    name?: string;
    slug?: string;
    email?: string;
    organization?: string;
    [key: string]: any;
  };
  actions?: {
    primary?: {
      label: string;
      action: () => void;
      variant?: 'default' | 'destructive' | 'outline';
    };
    secondary?: {
      label: string;
      action: () => void;
    };
  };
}

interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModalConfig;
}

// Configurations par type de modal avec thème sombre
const modalConfigs: Record<ModalType, {
  icon: React.ComponentType<any>;
  iconColor: string;
  iconBg: string;
  titleColor: string;
  cardStyle?: string;
}> = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-white',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/25',
    titleColor: 'text-green-400',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-white',
    iconBg: 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/25',
    titleColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-white',
    iconBg: 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-yellow-500/25',
    titleColor: 'text-yellow-400',
  },
  info: {
    icon: Info,
    iconColor: 'text-white',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25',
    titleColor: 'text-blue-400',
  },
  confirmation: {
    icon: Info,
    iconColor: 'text-white',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25',
    titleColor: 'text-blue-400',
  },
  'organization-created': {
    icon: Building2,
    iconColor: 'text-white',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/25',
    titleColor: 'text-green-400',
    cardStyle: 'bg-gray-800/50 border-gray-700/50',
  },
  'user-created': {
    icon: Users,
    iconColor: 'text-white',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25',
    titleColor: 'text-blue-400',
    cardStyle: 'bg-gray-800/50 border-gray-700/50',
  },
  'invitation-sent': {
    icon: Mail,
    iconColor: 'text-white',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/25',
    titleColor: 'text-purple-400',
    cardStyle: 'bg-gray-800/50 border-gray-700/50',
  },
};

export const UniversalModal: React.FC<UniversalModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const modalConfig = modalConfigs[config.type];

  const renderDetails = () => {
    if (!config.details) return null;

    switch (config.type) {
      case 'organization-created':
        return (
          <div className="mb-8 p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl backdrop-blur-sm">
            {config.details.name && (
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-medium text-gray-400">Nom :</span>
                <span className="text-green-400 font-semibold">{config.details.name}</span>
              </div>
            )}
            {config.details.slug && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-400">URL :</span>
                <span className="font-mono text-gray-300 bg-gray-900/50 px-3 py-1 rounded-lg border border-gray-700/50">
                  {config.details.slug}
                </span>
              </div>
            )}
          </div>
        );

      case 'user-created':
      case 'invitation-sent':
        return (
          <div className="mb-8 p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl backdrop-blur-sm">
            {config.details.email && (
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-medium text-gray-400">Email :</span>
                <span className="font-mono text-gray-300 bg-gray-900/50 px-3 py-1 rounded-lg border border-gray-700/50">{config.details.email}</span>
              </div>
            )}
            {config.details.organization && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-400">Organisation :</span>
                <span className="text-gray-300 font-semibold">{config.details.organization}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="md"
      showCloseButton={false}
      contentPadding={false}
    >
      <div className="relative text-center py-10 px-8">
        {/* Bouton de fermeture moderne */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/50 transition-all duration-200 hover:scale-110"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Titre moderne */}
        <h2 className={`text-2xl font-bold mb-6 ${modalConfig.titleColor} leading-tight`}>
          {config.title}
        </h2>

        {/* Message épuré */}
        <p className="text-gray-300 mb-8 text-lg leading-relaxed">
          {config.message}
        </p>

        {/* Détails spécifiques */}
        {renderDetails()}

        {/* Actions modernes */}
        <div className="flex gap-4 justify-center">
          {config.actions?.secondary && (
            <Button
              variant="outline"
              onClick={() => {
                config.actions!.secondary!.action();
                onClose();
              }}
              className="px-6 py-3 bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 rounded-xl"
            >
              {config.actions.secondary.label}
            </Button>
          )}
          
          <Button
            variant={config.actions?.primary?.variant || 'default'}
            onClick={() => {
              if (config.actions?.primary) {
                config.actions.primary.action();
              }
              onClose();
            }}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
              config.type === 'success' || config.type === 'organization-created'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/25'
                : config.type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/25'
                : config.type === 'warning'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-yellow-500/25'
                : config.type === 'info' || config.type === 'confirmation'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/25'
                : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-purple-500/25'
            }`}
          >
            {config.actions?.primary?.label || 'OK'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};