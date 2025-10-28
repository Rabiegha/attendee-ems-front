// Test direct de l'API des organisations
import { useGetOrganizationsQuery } from '@/features/users/api/usersApi'

export const OrganizationsTest: React.FC = () => {
  const { data: organizations, isLoading, error } = useGetOrganizationsQuery()

  console.log('Organizations test - data:', organizations)
  console.log('Organizations test - loading:', isLoading)
  console.log('Organizations test - error:', error)

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Test API Organisations</h3>
      <p>Loading: {isLoading ? 'Oui' : 'Non'}</p>
      <p>Error: {error ? JSON.stringify(error) : 'Aucune'}</p>
      <p>
        Data:{' '}
        {organizations ? JSON.stringify(organizations, null, 2) : 'Aucune'}
      </p>
    </div>
  )
}
