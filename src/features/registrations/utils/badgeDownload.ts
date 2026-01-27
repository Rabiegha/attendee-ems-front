/**
 * Utility functions for badge generation and download
 */

export type BadgeFormat = 'pdf' | 'image'

export interface BadgeDownloadOptions {
  registrationId: string
  eventId: string
  format: BadgeFormat
  firstName?: string | undefined
  lastName?: string | undefined
  token: string
  apiUrl: string
}

/**
 * Generate and download a badge for a registration
 * This function always generates a fresh badge to ensure it's up-to-date
 */
export async function generateAndDownloadBadge(options: BadgeDownloadOptions): Promise<void> {
  const { registrationId, eventId, format, firstName, lastName, token, apiUrl } = options

  // Step 1: Generate the badge (always fresh)
  const generateResponse = await fetch(
    `${apiUrl}/events/${eventId}/registrations/${registrationId}/generate-badge`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!generateResponse.ok) {
    throw new Error(`Erreur lors de la génération du badge: ${generateResponse.status}`)
  }

  const generatedBadge = await generateResponse.json()
  const badgeId = generatedBadge.data?.id

  if (!badgeId) {
    throw new Error('Le badge a été généré mais l\'ID est manquant')
  }

  // Step 2: Download the badge
  const downloadFormat = format === 'pdf' ? 'pdf' : 'image'
  const response = await fetch(
    `${apiUrl}/badges/${badgeId}/${downloadFormat}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Échec du téléchargement: HTTP ${response.status}`)
  }

  // Step 3: Create download link
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  
  // Generate filename with person's name
  const name1 = firstName || 'Participant'
  const name2 = lastName || ''
  const extension = format === 'pdf' ? 'pdf' : 'png'
  link.download = `badge-${name1}-${name2}.${extension}`.replace(/\s+/g, '-')
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
