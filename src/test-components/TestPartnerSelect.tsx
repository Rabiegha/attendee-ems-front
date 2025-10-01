// Test d'intégration pour vérifier le bon fonctionnement des composants Partner et Event
import React from 'react';
import { PartnerSelect } from '../features/events/ui/PartnerSelect';
import { MultiSelect } from '../shared/ui/MultiSelect';

// Simulateur de composant pour tester les types et interfaces
const TestPartnerSelectIntegration: React.FC = () => {
  const [partnerIds, setPartnerIds] = React.useState<string[]>([]);

  // Test des types MultiSelectOption
  const testOptions = [
    {
      id: '1', 
      label: 'John Doe',
      subLabel: 'john@example.com'
    },
    {
      id: '2',
      label: 'Jane Smith', 
      subLabel: 'jane@example.com'
    }
  ];

  return (
    <div>
      <h2>Test MultiSelect</h2>
      <MultiSelect
        options={testOptions}
        value={partnerIds}
        onChange={setPartnerIds}
        placeholder="Test placeholder"
      />
      
      <h2>Test PartnerSelect</h2>
      <PartnerSelect
        value={partnerIds}
        onChange={setPartnerIds}
      />
    </div>
  );
};

export default TestPartnerSelectIntegration;