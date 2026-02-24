import React, { useEffect, useState, useRef } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY as string | undefined

interface GoogleFont {
  family: string
  category: string
  variants: string[]
}

interface GoogleFontPickerProps {
  value: string
  onChange: (fontFamily: string) => void
}

// Cache global des fonts déjà injectées dans le DOM
const loadedFonts = new Set<string>()
// Cache global de la liste de fonts
let fontsCache: GoogleFont[] | null = null

const SYSTEM_FONTS: GoogleFont[] = [
  { family: 'Arial', category: 'sans-serif', variants: ['regular'] },
  { family: 'Helvetica', category: 'sans-serif', variants: ['regular'] },
  { family: 'Times New Roman', category: 'serif', variants: ['regular'] },
  { family: 'Georgia', category: 'serif', variants: ['regular'] },
  { family: 'Verdana', category: 'sans-serif', variants: ['regular'] },
  { family: 'Courier New', category: 'monospace', variants: ['regular'] },
  { family: 'Trebuchet MS', category: 'sans-serif', variants: ['regular'] },
  { family: 'Impact', category: 'display', variants: ['regular'] },
  { family: 'Tahoma', category: 'sans-serif', variants: ['regular'] },
]

function isSystemFont(family: string): boolean {
  return SYSTEM_FONTS.some(f => f.family === family)
}

export function loadGoogleFont(family: string): void {
  if (!family || isSystemFont(family) || loadedFonts.has(family)) return
  const encoded = family.replace(/ /g, '+')
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@100;300;400;500;700;900&display=swap`
  document.head.appendChild(link)
  loadedFonts.add(family)
}

// Categories avec icônes
const CATEGORY_LABELS: Record<string, string> = {
  'sans-serif': 'Sans serif',
  'serif': 'Serif',
  'display': 'Display',
  'handwriting': 'Manuscrit',
  'monospace': 'Monospace',
}

export const GoogleFontPicker: React.FC<GoogleFontPickerProps> = ({ value, onChange }) => {
  const [fonts, setFonts] = useState<GoogleFont[]>([])
  const [filtered, setFiltered] = useState<GoogleFont[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Charger la liste des fonts (une seule fois, avec cache)
  useEffect(() => {
    if (fontsCache) {
      setFonts(fontsCache)
      setFiltered(fontsCache.slice(0, 50))
      return
    }

    if (!GOOGLE_FONTS_API_KEY) {
      // Pas de clé API : utiliser uniquement les polices système
      setFonts(SYSTEM_FONTS)
      setFiltered(SYSTEM_FONTS)
      return
    }

    setLoading(true)
    setError(false)
    fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
    )
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        const googleFonts: GoogleFont[] = data.items || []
        // Polices système en tête, puis Google Fonts par popularité
        const all = [...SYSTEM_FONTS, ...googleFonts]
        fontsCache = all
        setFonts(all)
        setFiltered(all.slice(0, 50))
      })
      .catch(err => {
        console.error('GoogleFontPicker: failed to load fonts', err)
        setError(true)
        setFonts(SYSTEM_FONTS)
        setFiltered(SYSTEM_FONTS)
      })
      .finally(() => setLoading(false))
  }, [])

  // Précharger la police sélectionnée si c'est une Google Font
  useEffect(() => {
    if (value) loadGoogleFont(value)
  }, [value])

  // Filtrer la liste selon la recherche
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(fonts.slice(0, 50))
    } else {
      const q = search.toLowerCase()
      setFiltered(fonts.filter(f => f.family.toLowerCase().includes(q)).slice(0, 100))
    }
  }, [search, fonts])

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  // Focus sur la recherche quand le dropdown s'ouvre
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      setSearch('')
    }
  }, [open])

  const handleSelect = (family: string) => {
    loadGoogleFont(family)
    onChange(family)
    setOpen(false)
  }

  const displayName = value || 'Arial'

  return (
    <div ref={containerRef} className="relative">
      {/* Bouton principal */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded p-2 text-sm hover:border-blue-400 dark:hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        style={{ fontFamily: displayName }}
      >
        <span className="truncate">{displayName}</span>
        <ChevronDown
          size={14}
          className={`ml-1 flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden">
          {/* Barre de recherche */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une police..."
              className="flex-1 text-sm bg-transparent outline-none dark:text-gray-100 placeholder-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-56 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Chargement des polices…
              </div>
            )}

            {!loading && error && (
              <div className="py-3 px-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20">
                Impossible de charger Google Fonts. Polices système disponibles.
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="py-4 text-center text-sm text-gray-400">
                Aucune police trouvée pour « {search} »
              </div>
            )}

            {!loading &&
              filtered.map(font => {
                const isSelected = value === font.family
                const isSys = isSystemFont(font.family)
                return (
                  <button
                    key={font.family}
                    type="button"
                    onMouseEnter={() => !isSys && loadGoogleFont(font.family)}
                    onClick={() => handleSelect(font.family)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    style={{ fontFamily: font.family }}
                  >
                    <span>{font.family}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0 normal-case not-italic font-sans">
                      {CATEGORY_LABELS[font.category] || font.category}
                    </span>
                  </button>
                )
              })}

            {!loading && filtered.length === 50 && !search && (
              <div className="py-2 px-3 text-xs text-center text-gray-400 border-t border-gray-100 dark:border-gray-700">
                Tapez pour rechercher parmi toutes les polices
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
