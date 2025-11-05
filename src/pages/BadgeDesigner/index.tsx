import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus } from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { useGetBadgeTemplatesQuery } from '@/services/api/badge-templates.api';

export const BadgeDesigner: React.FC = () => {
  const navigate = useNavigate();
  
  const { 
    data, 
    isLoading, 
    error 
  } = useGetBadgeTemplatesQuery({ 
    page: 1, 
    limit: 10 
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Templates de badges"
        description="Créez et gérez vos templates de badges d'événements"
      />
      
      <div className="flex gap-4 mb-6">
        <Button 
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate('/badges/designer/new')}
        >
          Nouveau template
        </Button>
      </div>
      
      <Card>
        {isLoading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des templates...</p>
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <p className="text-red-500">
              Erreur lors du chargement des templates
            </p>
          </div>
        )}

        {!isLoading && !error && data?.data && data.data.length > 0 && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((template) => (
                <div 
                  key={template.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                    </div>
                    <div className="flex space-x-1">
                      {template.is_default && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Par défaut
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {template.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  
                  {template.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-3">
                    {template.width} × {template.height}px
                  </div>
                  
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.variables.slice(0, 3).map((variable, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {variable}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          +{template.variables.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Utilisé {template.usage_count} fois</span>
                    <span>{new Date(template.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        console.log('Aperçu du template:', template.id);
                      }}
                    >
                      Aperçu
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/badges/designer/${template.id}`)}
                    >
                      Modifier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !error && (!data?.data || data.data.length === 0) && (
          <div className="p-8 text-center">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              Aucun template trouvé
            </h3>
            <p className="text-gray-500 mb-6">
              Vous n'avez pas encore créé de template de badge
            </p>
            <Button 
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/badges/designer/new')}
            >
              Créer votre premier template
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
