/**
 * TagStats Component
 * 
 * Affiche les statistiques des tags pour un attendee :
 * - Tags des événements auxquels il participe
 * - Nombre de participations par tag
 * - Pourcentage de participation par tag
 * 
 * Props:
 * - attendeeId: ID de l'attendee
 * - compact?: Mode compact (pour affichage dans une card)
 */

import { useMemo } from 'react'
import { Tag } from 'lucide-react'

interface TagStat {
  tagName: string
  eventCount: number
  percentage: number
  color?: string
}

interface TagStatsProps {
  attendeeId: string
  tags: TagStat[] // Les tags seront passés depuis le parent qui récupère les événements de l'attendee
  compact?: boolean
}

export const TagStats: React.FC<TagStatsProps> = ({
  tags,
  compact = false,
}) => {
  // Trier par usage décroissant
  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => b.eventCount - a.eventCount)
  }, [tags])

  if (tags.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        Aucun événement avec tags
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {sortedTags.slice(0, 3).map((stat) => (
          <div
            key={stat.tagName}
            className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
          >
            <Tag className="w-3 h-3" />
            <span>{stat.tagName}</span>
            <span className="text-blue-600 dark:text-blue-400">
              {stat.eventCount}
            </span>
          </div>
        ))}
        {sortedTags.length > 3 && (
          <div className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
            +{sortedTags.length - 3}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Tag className="w-4 h-4" />
        Participation par catégorie
      </h3>
      <div className="space-y-2">
        {sortedTags.map((stat) => (
          <div key={stat.tagName} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {stat.tagName}
              </span>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>{stat.eventCount} événement{stat.eventCount > 1 ? 's' : ''}</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {stat.percentage}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Fonction utilitaire pour calculer les stats de tags depuis les événements d'un attendee
 * 
 * @param events - Liste des événements auxquels l'attendee participe
 * @returns TagStat[] - Statistiques des tags
 */
export function calculateTagStats(
  events: Array<{ tags: string[] }>
): TagStat[] {
  const tagCounts = new Map<string, number>()
  
  // Compter les occurrences de chaque tag
  events.forEach((event) => {
    event.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  const totalEvents = events.length
  
  // Convertir en array de stats avec pourcentages
  return Array.from(tagCounts.entries()).map(([tagName, count]) => ({
    tagName,
    eventCount: count,
    percentage: Math.round((count / totalEvents) * 100),
  }))
}
